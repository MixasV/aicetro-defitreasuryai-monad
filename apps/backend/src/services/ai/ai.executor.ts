import { DEFAULT_AI_AGENT_ADDRESS, blockchainService } from '../blockchain/blockchain.service'
import { monitoringService } from '../monitoring/monitoring.service'
import { aiService } from './ai.service'
import { aiExecutionHistoryService } from './ai.history'
import { alertingService } from '../monitoring/alerting.service'
import { env } from '../../config/env'
import type {
  AIExecutionRequest,
  AIExecutionResult,
  AIExecutionAction,
  AIExecutionTransaction
} from '../../types/ai.js'
import {
  normalizeProtocolId,
  resolveAllowedProtocolIdentifiers,
  resolveProtocolAddress
} from './protocol.registry'

class AIExecutionService {
  async execute (input: AIExecutionRequest): Promise<AIExecutionResult> {
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

    const remainingInitial = Math.max(0, delegationState.dailyLimitUsd - delegationState.spent24h)
    const recommendation = await aiService.generateRecommendations({
      portfolio,
      riskTolerance: input.riskTolerance ?? 'balanced',
      protocols: requestedProtocols,
      constraints: {
        dailyLimitUsd: delegationState.dailyLimitUsd,
        remainingDailyLimitUsd: remainingInitial,
        maxRiskScore: delegationState.maxRiskScore,
        whitelist: requestedProtocols,
        notes: 'AI execution flow'
      },
      protocolMetrics: protocolMetrics ?? undefined,
      context: {
        account,
        delegate,
        chainId: 10143,
        scenario: 'execution'
      }
    })

    let remainingLimit = Math.max(0, Number(remainingInitial.toFixed(2)))
    const actions: AIExecutionAction[] = []
    const transactions: AIExecutionTransaction[] = []

    for (const allocation of recommendation.allocations) {
      const amountUsd = Number((portfolio.totalValueUSD * (allocation.allocationPercent / 100)).toFixed(2))
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

      remainingLimit = Number((remainingLimit - amountUsd).toFixed(2))
      actions.push(baseAction)
    }

    for (const action of actions) {
      if (action.status !== 'executed') continue

      const protocolAddress = resolveProtocolAddress(action.protocolId ?? action.protocol, protocolMetrics ?? undefined)
      if (protocolAddress == null) {
        action.status = 'skipped'
        action.reason = 'Protocol address is unknown'
        action.simulationUsd = 0
        remainingLimit = Number((remainingLimit + action.amountUsd).toFixed(2))
        transactions.push({
          protocolId: action.protocolId ?? normalizeProtocolId(action.protocol),
          protocolAddress: '0x0000000000000000000000000000000000000000',
          callData: '0x',
          amountUsd: action.amountUsd,
          submittedAt: new Date().toISOString(),
          status: 'failed',
          failureReason: 'Protocol address is unknown'
        })
        continue
      }

      action.protocolAddress = protocolAddress
      action.callData = action.callData ?? '0x'

      const planResult = await blockchainService.prepareDelegatedExecution({
        account,
        delegate,
        protocolId: action.protocolId ?? normalizeProtocolId(action.protocol),
        protocolAddress,
        amountUsd: action.amountUsd,
        callData: action.callData as `0x${string}`
      })

      if (!planResult.ok) {
        action.status = 'skipped'
        action.reason = planResult.reason
        action.simulationUsd = 0
        remainingLimit = Number((remainingLimit + action.amountUsd).toFixed(2))
        transactions.push({
          protocolId: action.protocolId ?? normalizeProtocolId(action.protocol),
          protocolAddress,
          callData: action.callData ?? '0x',
          amountUsd: action.amountUsd,
          submittedAt: new Date().toISOString(),
          status: 'failed',
          failureReason: planResult.reason
        })
        continue
      }

      action.callData = planResult.plan.callData

      if (!env.aiAutoExecutionEnabled) {
        transactions.push({
          protocolId: planResult.plan.protocolId,
          protocolAddress,
          callData: planResult.plan.callData,
          amountUsd: action.amountUsd,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        })
        continue
      }

      const broadcast = await blockchainService.broadcastDelegatedExecution(planResult.plan)
      if (!broadcast.ok) {
        action.status = 'skipped'
        action.reason = broadcast.reason ?? 'On-chain execution failed'
        action.simulationUsd = 0
        remainingLimit = Number((remainingLimit + action.amountUsd).toFixed(2))
        transactions.push({
          protocolId: planResult.plan.protocolId,
          protocolAddress,
          callData: planResult.plan.callData,
          amountUsd: action.amountUsd,
          submittedAt: new Date().toISOString(),
          status: 'failed',
          failureReason: broadcast.reason ?? 'On-chain execution failed'
        })
        continue
      }

      action.transactionHash = broadcast.txHash
      transactions.push({
        protocolId: planResult.plan.protocolId,
        protocolAddress,
        callData: planResult.plan.callData,
        amountUsd: action.amountUsd,
        submittedAt: new Date().toISOString(),
        status: 'executed',
        transactionHash: broadcast.txHash
      })
    }

    const totalExecutedUsd = actions
      .filter((action) => action.status === 'executed')
      .reduce((sum, action) => sum + action.amountUsd, 0)

    if (env.aiAutoExecutionEnabled && totalExecutedUsd > 0) {
      await blockchainService.incrementDelegationSpend(account, delegate, totalExecutedUsd)
    }

    const summary = totalExecutedUsd > 0
      ? env.aiAutoExecutionEnabled
        ? `AI executed on-chain actions worth ${totalExecutedUsd.toFixed(2)} USD.`
        : `AI prepared executable actions worth ${totalExecutedUsd.toFixed(2)} USD (auto execution disabled).`
      : 'No actions satisfied the guardrails.'

    const result: AIExecutionResult = {
      account,
      delegate,
      generatedAt: new Date().toISOString(),
      summary,
      totalExecutedUsd: Number(totalExecutedUsd.toFixed(2)),
      remainingDailyLimitUsd: Number(remainingLimit.toFixed(2)),
      actions,
      transactions: transactions.length > 0 ? transactions : undefined,
      analysis: recommendation.analysis,
      suggestedActions: recommendation.suggestedActions,
      evaluation: recommendation.evaluation,
      governanceSummary: recommendation.governanceSummary,
      warnings: recommendation.evaluation?.warnings,
      model: recommendation.model,
      provider: recommendation.provider
    }

    await aiExecutionHistoryService.record(result)
    await alertingService.notifyExecution(result)
    return result
  }
}

export const aiExecutionService = new AIExecutionService()
