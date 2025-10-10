import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  DEMO_CORPORATE_ACCOUNT,
  DEMO_DELEGATE,
  DEMO_DAILY_LIMIT_USD,
  DEMO_INITIAL_SPENT_24H,
  DEMO_MAX_RISK_SCORE,
  DEMO_OWNERS,
  DEMO_PROTOCOLS,
  DEMO_THRESHOLD
} from '../../config/demo'
import { aiExecutionService } from '../ai/ai.executor'
import { aiExecutionHistoryService } from '../ai/ai.history'
import { blockchainService } from '../blockchain/blockchain.service'
import { emergencyLogService } from '../emergency/emergency.service'
import { emergencyStateService } from '../emergency/emergency.state'
import { riskService } from '../risk/risk.service'
import { monitoringService } from '../monitoring/monitoring.service'
import { portfolioAnalyticsService } from '../monitoring/portfolio.analytics.service'
import type {
  AIExecutionResult,
  DemoAccountOverview,
  DemoDelegationOverview,
  DemoScenarioRunResult,
  DemoScenarioSummary,
  DemoStep,
  EmergencyStatusMetadata
} from '../../types/ai.js'

const DEMO_WHITELIST = [...DEMO_PROTOCOLS]

class DemoService {
  async runScenario (): Promise<DemoScenarioRunResult> {
    const account = await this.ensureDemoState()

    const execution = await aiExecutionService.execute({
      account: account.address,
      delegate: DEMO_DELEGATE,
      riskTolerance: 'balanced',
      protocols: [...DEMO_PROTOCOLS]
    })

    const stopMetadata: EmergencyStatusMetadata = {
      action: 'stop',
      reason: 'Demo: CFO приостанавливает AI для проверки.',
      simulated: true,
      mode: 'simulated'
    }
    const pausedStatus = emergencyStateService.setPaused(account.address, stopMetadata)
    emergencyLogService.recordSuccess(account.address, 'Demo: AI operations paused for manual review.', {
      ...stopMetadata,
      status: pausedStatus.state
    })

    const resumeMetadata: EmergencyStatusMetadata = {
      action: 'resume',
      reason: 'Demo: Control completed, AI active again.',
      simulated: true,
      mode: 'simulated'
    }
    const activeStatus = emergencyStateService.setActive(account.address, resumeMetadata)
    emergencyLogService.recordSuccess(account.address, 'Demo: AI operations resumed after review.', {
      ...resumeMetadata,
      status: activeStatus.state
    })

    const summary = await this.buildSummary(account.address, execution)
    return { execution, summary }
  }

  async getSummary (account?: string): Promise<DemoScenarioSummary> {
    const targetAccount = (account ?? DEMO_CORPORATE_ACCOUNT).toLowerCase()
    await this.ensureDemoState()
    return await this.buildSummary(targetAccount)
  }

  private async ensureDemoState (): Promise<DemoAccountOverview> {
    const corporate = await prisma.corporateAccount.upsert({
      where: { address: DEMO_CORPORATE_ACCOUNT },
      update: {
        owners: DEMO_OWNERS,
        threshold: DEMO_THRESHOLD
      },
      create: {
        address: DEMO_CORPORATE_ACCOUNT,
        owners: DEMO_OWNERS,
        threshold: DEMO_THRESHOLD
      }
    })

    await prisma.delegation.upsert({
      where: {
        corporateId_delegate: {
          corporateId: corporate.id,
          delegate: DEMO_DELEGATE
        }
      },
      update: {
        dailyLimitUsd: DEMO_DAILY_LIMIT_USD,
        whitelist: DEMO_WHITELIST,
        caveats: this.buildCaveatsPayload() as Prisma.JsonObject
      },
      create: {
        corporateId: corporate.id,
        delegate: DEMO_DELEGATE,
        dailyLimitUsd: DEMO_DAILY_LIMIT_USD,
        whitelist: DEMO_WHITELIST,
        caveats: this.buildCaveatsPayload() as Prisma.JsonObject
      }
    })

    return {
      address: corporate.address,
      owners: Array.isArray(corporate.owners) ? (corporate.owners as string[]) : [...DEMO_OWNERS],
      threshold: corporate.threshold
    }
  }

  private async buildSummary (account: string, execution?: AIExecutionResult): Promise<DemoScenarioSummary> {
    const [corporate, delegationState, delegations, aiSummary, risk, emergencyLog, snapshot, alerts, projection, history] = await Promise.all([
      prisma.corporateAccount.findUnique({ where: { address: account } }),
      blockchainService.getDelegationState(account, DEMO_DELEGATE),
      blockchainService.getDelegations(account),
      aiExecutionHistoryService.getSummary(account),
      riskService.getRiskInsights(account),
      Promise.resolve(emergencyLogService.list(account).slice(0, 5)),
      monitoringService.getPortfolioSnapshot(account),
      monitoringService.getRiskAlerts(account),
      portfolioAnalyticsService.buildProjection(account),
      aiExecutionHistoryService.listForAccount(account, 10)
    ])

    const overview: DemoAccountOverview = {
      address: account,
      owners: Array.isArray(corporate?.owners) ? (corporate?.owners as string[]) : [...DEMO_OWNERS],
      threshold: corporate?.threshold ?? DEMO_THRESHOLD
    }

    const delegationOverview = this.composeDelegationOverview(delegationState, delegations)
    const steps = this.composeSteps(delegationOverview, aiSummary, risk, emergencyLog, alerts, execution)

    return {
      account: overview,
      delegation: delegationOverview,
      risk,
      aiSummary,
      portfolio: snapshot,
      alerts,
      projection,
      aiHistory: history,
      emergencyLog,
      steps,
      generatedAt: new Date().toISOString()
    }
  }

  private composeDelegationOverview (
    state: Awaited<ReturnType<typeof blockchainService.getDelegationState>>,
    delegations: Awaited<ReturnType<typeof blockchainService.getDelegations>>
  ): DemoDelegationOverview {
    const target = delegations.find((item) => item.delegate === state.delegate)

    const updatedAt = target?.updatedAt ?? new Date().toISOString()
    const dailyLimit = Number(target?.dailyLimit ?? state.dailyLimitUsd)
    const spent24h = Number(target?.spent24h ?? state.spent24h)
    const remaining = Math.max(dailyLimit - spent24h, 0)

    return {
      delegate: state.delegate,
      dailyLimitUsd: roundCurrency(dailyLimit),
      spent24hUsd: roundCurrency(spent24h),
      remainingDailyLimitUsd: roundCurrency(remaining),
      maxRiskScore: state.maxRiskScore,
      whitelist: target?.allowedProtocols ?? state.whitelist,
      updatedAt
    }
  }

  private composeSteps (
    delegation: DemoDelegationOverview,
    aiSummary: Awaited<ReturnType<typeof aiExecutionHistoryService.getSummary>>,
    risk: Awaited<ReturnType<typeof riskService.getRiskInsights>>,
    emergencyLog: ReturnType<typeof emergencyLogService.list>,
    alerts: Awaited<ReturnType<typeof monitoringService.getRiskAlerts>>,
    execution?: AIExecutionResult
  ): DemoStep[] {
    const steps: DemoStep[] = []

    steps.push({
      id: 'delegation-setup',
      title: 'Delegation configuration',
      status: 'completed',
      description: `AI agent has access to ${delegation.whitelist.length} protocols with daily limit ${delegation.dailyLimitUsd.toLocaleString('en-US')} USD.`,
      timestamp: delegation.updatedAt
    })

    const lastExecution = execution ?? aiSummary.lastExecution
    steps.push({
      id: 'ai-execution',
      title: 'AI strategy execution',
      status: aiSummary.totalExecutions > 0 ? 'completed' : 'pending',
      description:
        aiSummary.totalExecutions > 0
          ? `Last execution processed ${roundCurrency(lastExecution?.totalExecutedUsd ?? 0).toLocaleString('en-US')} USD.`
          : 'AI has not been executed yet — run demo to see results.',
      timestamp: lastExecution?.generatedAt
    })

    const riskStatus = risk.guardrails.violations.length > 0 ? 'error' : 'completed'
    steps.push({
      id: 'risk-review',
      title: 'Risk analysis',
      status: riskStatus,
      description:
        riskStatus === 'error'
          ? risk.guardrails.violations[0] ?? 'Guardrails violations detected.'
          : 'Guardrails are within limits, risk profile is acceptable.',
      timestamp: risk.updatedAt
    })

    const lastEmergency = emergencyLog[0]
    steps.push({
      id: 'emergency-control',
      title: 'Emergency stop control',
      status: lastEmergency != null ? 'completed' : 'pending',
      description:
        lastEmergency != null
          ? `Last event: ${lastEmergency.status === 'success' ? 'successful AI pause' : 'stop error'}.`
          : 'Emergency stop has not been triggered in the demo scenario yet.',
      timestamp: lastEmergency?.createdAt
    })

    steps.push({
      id: 'monitoring-alerts',
      title: 'Monitoring & Alerts',
      status: alerts.length > 0 ? 'completed' : 'pending',
      description:
        alerts.length > 0
          ? `Active alerts: ${alerts.length}. Last signal: ${alerts[0].title}.`
          : 'Alert system detected no deviations.',
      timestamp: alerts[0]?.createdAt
    })

    return steps
  }

  private buildCaveatsPayload () {
    return {
      spent24h: DEMO_INITIAL_SPENT_24H,
      spent24hUpdatedAt: new Date().toISOString(),
      maxRiskScore: DEMO_MAX_RISK_SCORE,
      notes: 'demo scenario baseline'
    }
  }
}

const roundCurrency = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(2))
}

export const demoService = new DemoService()
