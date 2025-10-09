import { DEFAULT_AI_AGENT_ADDRESS, blockchainService } from '../blockchain/blockchain.service'
import { monitoringService } from '../monitoring/monitoring.service'
import { aiService } from './ai.service'
import { aiSimulationLogService } from './ai.simulation-log'
import type { AIPreviewRequest, AIPreviewResult, AIExecutionAction } from '../../types/ai.js'
import { normalizeProtocolId, resolveAllowedProtocolIdentifiers } from './protocol.registry'

class AIPreviewService {
  async preview (input: AIPreviewRequest): Promise<AIPreviewResult> {
    const account = input.account.toLowerCase()
    const delegate = (input.delegate ?? DEFAULT_AI_AGENT_ADDRESS).toLowerCase()

    const delegationState = await blockchainService.getDelegationState(account, delegate)
    const portfolio = await monitoringService.getPortfolioSnapshot(account)
    const protocolMetrics = await monitoringService.getProtocolMetrics().catch(() => null)

    const resolvedWhitelist = resolveAllowedProtocolIdentifiers(delegationState.whitelist, protocolMetrics ?? undefined)
    let requestedProtocols = input.protocols != null && input.protocols.length > 0
      ? input.protocols
      : (resolvedWhitelist.length > 0 ? resolvedWhitelist : delegationState.whitelist)

    if (requestedProtocols.length === 0) {
      requestedProtocols = resolvedWhitelist.length > 0 ? resolvedWhitelist : ['nabla:usdc']
    }

    const normalizedWhitelistSet = new Set(requestedProtocols.map((id) => normalizeProtocolId(id)))

    const remainingInitial = Math.max(0, round(delegationState.dailyLimitUsd - delegationState.spent24h))
    const recommendation = await aiService.generateRecommendations({
      portfolio,
      riskTolerance: input.riskTolerance ?? 'balanced',
      protocols: requestedProtocols,
      constraints: {
        dailyLimitUsd: delegationState.dailyLimitUsd,
        remainingDailyLimitUsd: remainingInitial,
        maxRiskScore: delegationState.maxRiskScore,
        whitelist: requestedProtocols,
        notes: 'AIPreviewService'
      },
      protocolMetrics: protocolMetrics ?? undefined,
      context: {
        account,
        delegate,
        chainId: 10143,
        scenario: 'preview'
      }
    })

    let remainingLimit = remainingInitial
    const baseValue = portfolio.totalValueUSD
    const actions: AIExecutionAction[] = []

    for (const allocation of recommendation.allocations) {
      const amountUsd = round(baseValue * (allocation.allocationPercent / 100))

      const protocolId = normalizeProtocolId(allocation.protocol)

      const baseAction: AIExecutionAction = {
        protocol: allocation.protocol,
        protocolId,
        allocationPercent: allocation.allocationPercent,
        amountUsd,
        expectedAPY: allocation.expectedAPY,
        riskScore: allocation.riskScore,
        status: 'executed',
        simulationUsd: Math.min(amountUsd, remainingLimit)
      }

      if (!normalizedWhitelistSet.has(protocolId)) {
        actions.push({ ...baseAction, status: 'skipped', reason: 'Protocol is not whitelisted', simulationUsd: 0 })
        continue
      }

      if (allocation.riskScore > delegationState.maxRiskScore) {
        actions.push({ ...baseAction, status: 'skipped', reason: 'Risk score exceeds delegation limit', simulationUsd: 0 })
        continue
      }

      if (amountUsd > remainingLimit) {
        actions.push({ ...baseAction, status: 'skipped', reason: 'Insufficient daily limit remaining', simulationUsd: 0 })
        continue
      }

      remainingLimit = round(remainingLimit - amountUsd)
      actions.push(baseAction)
    }

    const totalExecutableUsd = actions
      .filter((action) => action.status === 'executed')
      .reduce((sum, action) => sum + action.amountUsd, 0)

    const summary = totalExecutableUsd > 0
      ? `Actions worth ${totalExecutableUsd.toFixed(2)} USD can be executed without breaching guardrails.`
      : 'No actions satisfied the guardrails.'

    const result: AIPreviewResult = {
      account,
      delegate,
      generatedAt: new Date().toISOString(),
      summary,
      totalExecutableUsd: round(totalExecutableUsd),
      remainingDailyLimitUsd: remainingLimit,
      actions,
      delegation: {
        dailyLimitUsd: round(delegationState.dailyLimitUsd),
        spent24hUsd: round(delegationState.spent24h),
        whitelist: delegationState.whitelist,
        maxRiskScore: delegationState.maxRiskScore
      },
      analysis: recommendation.analysis,
      evaluation: recommendation.evaluation,
      suggestedActions: recommendation.suggestedActions,
      governanceSummary: recommendation.governanceSummary,
      warnings: recommendation.evaluation?.warnings,
      model: recommendation.model,
      provider: recommendation.provider
    }

    await aiSimulationLogService.record(result)
    return result
  }
}

const round = (value: number): number => Number(value.toFixed(2))

export const aiPreviewService = new AIPreviewService()
