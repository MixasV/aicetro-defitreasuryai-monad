import { DEFAULT_AI_AGENT_ADDRESS, blockchainService } from '../blockchain/blockchain.service'
import { monitoringService } from '../monitoring/monitoring.service'
import { aiService } from './ai.service'
import { aiExecutionHistoryService } from './ai.history'
import { alertingService } from '../monitoring/alerting.service'
import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'
import { metaMaskRedemptionV2Service } from '../metamask/metamask-redemption-v2.service'
import { logger } from '../../config/logger'
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

    // ✅ FIX: DON'T expand whitelist! User explicitly chose these protocols
    // resolveAllowedProtocolIdentifiers expands "Uniswap V2" → 5 pool IDs, confusing AI
    let requestedProtocols = input.protocols != null && input.protocols.length > 0
      ? input.protocols
      : delegationState.whitelist

    if (requestedProtocols.length === 0) {
      requestedProtocols = ['Uniswap V2']  // Default to Uniswap V2 on Monad
    }

    // ✅ FIX: Add base protocols to whitelist (same as ai.service.ts)
    // "Uniswap V2" → add both "uniswap v2" AND "uniswap"
    const normalizedWhitelistSet = new Set<string>()
    for (const protocol of requestedProtocols) {
      const normalized = normalizeProtocolId(protocol)
      normalizedWhitelistSet.add(normalized)
      // Extract base: "uniswap v2" → "uniswap"
      const base = normalized.split(/\s+/)[0]
      normalizedWhitelistSet.add(base)
    }
    
    console.log('[AI Executor] Whitelist:', Array.from(normalizedWhitelistSet))

    // ✅ CRITICAL: Get allowed networks from delegation (server-side validation)
    const delegationRecord = await prisma.delegation.findFirst({
      where: { smartAccountAddress: account, active: true }
    })
    
    const caveats = (delegationRecord?.caveats as any) || {}
    const selectedNetworks = caveats.selectedNetworks || []
    const allowedNetworkIds = selectedNetworks
      .filter((n: any) => n.enabled !== false)
      .map((n: any) => n.id) // e.g., ['monad']
    
    // Default to Monad if no networks specified
    const finalAllowedNetworks = allowedNetworkIds.length > 0 ? allowedNetworkIds : ['monad']
    
    logger.info({ 
      account, 
      allowedNetworks: finalAllowedNetworks 
    }, 'AI can execute ONLY on these networks')

    // ✅ CRITICAL FIX: Use portfolioPercentage to calculate allowed amount!
    // If portfolioPercentage = 20%, AI can use 20% of portfolio, NOT dailyLimitUsd!
    const portfolioPercentage = delegationState.portfolioPercentage ?? 100
    const allowedPortfolioAmount = (portfolio.totalValueUSD * portfolioPercentage) / 100
    const remainingInitial = Math.max(0, allowedPortfolioAmount - delegationState.spent24h)
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

    // ✅ CRITICAL FIX: Use remainingInitial (delegated amount) instead of portfolio.totalValueUSD!
    // remainingInitial already accounts for portfolioPercentage
    // This is the ONLY amount AI can use, NOT the full portfolio!
    // ⚠️ GAS_RESERVE: Keep funds for gas fees
    // Monad Testnet: $1 is enough (gas ~$0.001/tx)
    // Mainnet: should be $50-100
    const GAS_RESERVE_USD = 1
    const allowedPortfolioValue = Math.max(0, remainingInitial - GAS_RESERVE_USD)

    for (const allocation of recommendation.allocations) {
      const amountUsd = Number((allowedPortfolioValue * (allocation.allocationPercent / 100)).toFixed(2))
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

      // Check both full protocol ID and base protocol
      const baseProtocol = protocolId.split(':')[0]
      const isWhitelisted = normalizedWhitelistSet.has(protocolId) || normalizedWhitelistSet.has(baseProtocol)
      
      console.log('[AI Executor] Checking:', protocolId, '| base:', baseProtocol, '| whitelisted:', isWhitelisted)
      
      if (!isWhitelisted) {
        actions.push({ ...baseAction, status: 'skipped', reason: 'Protocol is not whitelisted', simulationUsd: 0 })
        continue
      }

      if (allocation.riskScore > delegationState.maxRiskScore) {
        actions.push({ ...baseAction, status: 'skipped', reason: 'Risk score exceeds delegation limit', simulationUsd: 0 })
        continue
      }

      // ✅ CRITICAL: Check if operation is on allowed network (Monad Testnet only)
      // All operations currently default to Monad Testnet (chainId 10143)
      const targetChain = 10143 // Monad Testnet
      if (targetChain !== 10143) {
        actions.push({ ...baseAction, status: 'skipped', reason: `Network ${targetChain} is not allowed. Only Monad Testnet (10143) is supported.`, simulationUsd: 0 })
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

      // ✅ NEW: Try resolving from database first!
      const { resolveProtocolAddressFromDB } = await import('./protocol.registry')
      let protocolAddress = resolveProtocolAddress(action.protocolId ?? action.protocol, protocolMetrics ?? undefined)
      
      // If not found in static config, try database
      if (protocolAddress == null) {
        logger.info({ protocol: action.protocol }, 'Static resolution failed, trying database...')
        protocolAddress = await resolveProtocolAddressFromDB(action.protocol)
      }
      
      // ✅ DEBUG: Log protocol address resolution
      logger.info({
        protocol: action.protocol,
        protocolId: action.protocolId,
        resolved: protocolAddress,
        hasMetrics: protocolMetrics != null
      }, 'Protocol address resolution')
      
      if (protocolAddress == null) {
        logger.warn({
          protocol: action.protocol,
          protocolId: action.protocolId
        }, 'FAILED to resolve protocol address from both static config and database!')
        
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

      // ✅ CRITICAL: Final network check before blockchain execution
      const txNetwork = 'monad' // All Monad transactions
      if (!finalAllowedNetworks.includes(txNetwork)) {
        action.status = 'skipped'
        action.reason = `Transaction blocked: network '${txNetwork}' not in allowed list [${finalAllowedNetworks.join(', ')}]`
        action.simulationUsd = 0
        remainingLimit = Number((remainingLimit + action.amountUsd).toFixed(2))
        logger.error({ account, protocolAddress, allowedNetworks: finalAllowedNetworks }, 'CRITICAL: Blocked unauthorized network transaction!')
        transactions.push({
          protocolId: action.protocolId ?? normalizeProtocolId(action.protocol),
          protocolAddress,
          callData: action.callData ?? '0x',
          amountUsd: action.amountUsd,
          submittedAt: new Date().toISOString(),
          status: 'failed',
          failureReason: action.reason
        })
        continue
      }

      // ✅ FIX: Ensure protocolAddress is valid before calling prepareDelegatedExecution
      logger.info({
        account,
        protocol: action.protocol,
        protocolId: action.protocolId,
        protocolAddress,
        amountUsd: action.amountUsd
      }, 'Preparing delegated execution')

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

      // Check delegation type to determine execution method
      const delegation = await prisma.delegation.findFirst({
        where: { 
          smartAccountAddress: account.toLowerCase(),
          active: true 
        }
      })

      // ✅ CORRECT: Detect ERC-7710 MetaMask delegation by checking required fields
      // NOT by checking type === 'metamask' (that field is optional)
      const signedDel = delegation?.signedDelegation as any
      const isMetaMaskDelegation = delegation?.signedDelegation && 
        typeof delegation.signedDelegation === 'object' &&
        signedDel.delegate &&     // Has delegate address
        signedDel.delegator &&    // Has delegator address
        signedDel.caveats &&      // Has caveats array
        signedDel.signature       // Has signature

      let broadcast
      
      if (isMetaMaskDelegation) {
        // V2: Use MetaMask Delegation Framework + Alchemy Gas Manager
        console.log('[AI Executor] ✅ Using MetaMask ERC-7710 redemption V2 (Gas Manager) for account:', account)
        console.log('[AI Executor] Delegation has delegate:', signedDel.delegate)
        console.log('[AI Executor] Using ONE AI Agent SA for redemption')
        
        const redemptionResult = await metaMaskRedemptionV2Service.redeemDelegation({
          accountAddress: account as `0x${string}`,
          protocolAddress: protocolAddress as `0x${string}`,
          callData: planResult.plan.callData,
          amountUsd: action.amountUsd
        })
        
        console.log('[AI Executor] Redemption V2 result:', {
          ok: redemptionResult.ok,
          userOpHash: redemptionResult.userOpHash,
          txHash: redemptionResult.txHash,
          reason: redemptionResult.reason
        })
        
        if (!redemptionResult.ok) {
          broadcast = { ok: false, reason: redemptionResult.reason }
        } else {
          broadcast = { 
            ok: true, 
            txHash: redemptionResult.txHash || '0x0000000000000000000000000000000000000000000000000000000000000000'
          }
        }
      } else {
        // Use legacy delegation execution
        console.log('[AI Executor] ⚠️ Using legacy delegation for account:', account)
        broadcast = await blockchainService.broadcastDelegatedExecution(planResult.plan)
      }

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
