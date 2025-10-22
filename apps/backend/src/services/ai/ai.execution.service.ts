import { prisma } from '../../lib/prisma'
import { logger } from '../../config/logger'
import { blockchainService } from '../blockchain/blockchain.service'
import { aiService } from './ai.service'
import type {
  AIExecutionRecord,
  AIRecommendationRequest,
  DelegationConfig,
  PortfolioSnapshot
} from '@defitreasuryai/types'

interface AutoExecutionResult {
  success: boolean
  execution?: AIExecutionRecord
  reason?: string
}

class AIExecutionService {
  /**
   * Execute AI strategy automatically for accounts with auto-execution enabled
   */
  async executeAutoStrategy (account: string, portfolioValue?: number): Promise<AutoExecutionResult> {
    const lowerAccount = account.toLowerCase()

    try {
      // 1. Get delegation with dynamic limits
      const delegation = await blockchainService.getDelegationWithDynamicLimits(lowerAccount, portfolioValue)
      
      if (delegation == null) {
        return { success: false, reason: 'No delegation configured' }
      }

      // 2. Check if auto-execution is enabled
      if (!delegation.autoExecutionEnabled) {
        return { success: false, reason: 'Auto-execution is disabled' }
      }

      // 3. Check if delegation is active
      if (delegation.active === false) {
        return { success: false, reason: 'Delegation is paused' }
      }

      // 4. Get current portfolio snapshot
      const portfolioSnapshot = await this.getPortfolioSnapshot(lowerAccount, portfolioValue)
      
      if (portfolioSnapshot == null) {
        return { success: false, reason: 'Failed to get portfolio snapshot' }
      }

      // 5. Calculate remaining allowance
      const autoExecutedUsd = delegation.autoExecutedUsd ?? 0
      const portfolioPercentage = delegation.portfolioPercentage ?? 0
      const autoAllowance = portfolioSnapshot.totalValueUSD * (portfolioPercentage / 100)
      const remainingAllowance = Math.max(0, autoAllowance - autoExecutedUsd)

      // Allow first execution even if balance is 0 (user needs to fund Smart Account)
      if (remainingAllowance <= 0 && autoExecutedUsd > 0) {
        return { success: false, reason: 'Auto-execution allowance exhausted' }
      }
      
      // For first execution with 0 balance, AI can still analyze but won't execute
      if (remainingAllowance <= 0 && autoExecutedUsd === 0) {
        logger.warn({ account }, 'First AI execution with 0 balance - will analyze but cannot execute')
      }

      const effectiveDailyLimit = Math.min(
        Number.parseFloat(delegation.dailyLimit),
        remainingAllowance
      )

      // 6. Get allowed tokens from delegation record (from database)
      const delegationRecord = await prisma.delegation.findFirst({
        where: { smartAccountAddress: lowerAccount, active: true }
      })
      const caveats = (delegationRecord?.caveats as any) || {}
      const selectedNetworks = caveats.selectedNetworks || []
      const allowedTokens = selectedNetworks
        .filter((n: any) => n.enabled !== false) // Network must be enabled
        .flatMap((n: any) => (n.tokens || []).filter((t: any) => t.enabled === true)) // Only enabled tokens
        .map((t: any) => t.symbol) // Extract symbols: ["MON", "USDC"]
      
      // Default to Monad native token if no tokens specified
      const finalAllowedTokens = allowedTokens.length > 0 ? allowedTokens : ['MON']
      
      logger.info({ 
        account, 
        allowedTokens: finalAllowedTokens,
        networksCount: selectedNetworks.length 
      }, 'AI can use these tokens as initial source')

      // 7. Generate AI recommendations with allowed tokens
      const aiRequest: AIRecommendationRequest = {
        portfolio: portfolioSnapshot,
        riskTolerance: 'conservative',
        protocols: delegation.allowedProtocols,
        constraints: {
          dailyLimitUsd: effectiveDailyLimit,
          remainingDailyLimitUsd: effectiveDailyLimit, // ✅ FIX: Use effectiveDailyLimit (already calculated above)
          maxRiskScore: delegation.maxRiskScore,
          whitelist: delegation.allowedProtocols,
          allowedTokens: finalAllowedTokens, // ✅ PASS ALLOWED TOKENS TO AI!
          // ✅ CRITICAL FIX: Pass delegation budget to AI so it knows how much it can use!
          portfolioPercentage: portfolioPercentage,      // % of portfolio delegated
          autoAllowance: autoAllowance,                  // Total USD AI can manage
          remainingAllowance: remainingAllowance         // Remaining after previous executions
        },
        context: {
          account: lowerAccount,
          delegate: delegation.delegate,
          chainId: 2814,
          scenario: 'auto-execution'
        }
      }

      const recommendations = await aiService.generateRecommendations(aiRequest)

      // 7. Validate recommendations
      logger.info({
        account,
        portfolioValue: portfolioSnapshot.totalValueUSD,
        portfolioPercentage,
        autoAllowance,
        remainingAllowance,
        effectiveDailyLimit,
        allocationsCount: recommendations.allocations.length
      }, 'AI execution context')
      
      if (recommendations.allocations.length === 0) {
        return { success: false, reason: 'No recommendations generated' }
      }

      // Calculate total amount to execute
      const totalAmount = recommendations.allocations.reduce(
        (sum, alloc) => sum + (alloc.amountUsd ?? 0),
        0
      )

      logger.info({
        account,
        totalAmount,
        allocations: recommendations.allocations.map(a => ({ protocol: a.protocol, amountUsd: a.amountUsd }))
      }, 'AI allocations')

      if (totalAmount <= 0) {
        return { success: false, reason: 'No executable amount' }
      }

      if (totalAmount > effectiveDailyLimit) {
        logger.warn({ account: lowerAccount, totalAmount, effectiveDailyLimit }, 'Auto-execution amount exceeds limit')
        return { success: false, reason: `Amount ${totalAmount} exceeds limit ${effectiveDailyLimit}` }
      }

      // 8. Execute first allocation (for MVP, execute one at a time)
      const primaryAllocation = recommendations.allocations[0]
      
      // ✅ FIX: Resolve protocol address from database!
      const { resolveProtocolAddressFromDB } = await import('./protocol.registry')
      const protocolAddress = await resolveProtocolAddressFromDB(primaryAllocation.protocol)
      
      if (!protocolAddress) {
        logger.error({ protocol: primaryAllocation.protocol }, 'Failed to resolve protocol address from database')
        return { success: false, reason: `Protocol address not found for: ${primaryAllocation.protocol}` }
      }
      
      logger.info({ 
        protocol: primaryAllocation.protocol, 
        resolvedAddress: protocolAddress 
      }, 'Protocol address resolved from database')
      
      // 9. Execute using MetaMask DelegationManager.redeemDelegations() V2 ✅
      // V2: Uses ONE AI Agent SA + Alchemy Gas Manager for gas sponsorship
      // AI agent doesn't need MON - Gas Manager sponsors transaction!
      const { metaMaskRedemptionV2Service } = await import('../metamask/metamask-redemption-v2.service')
      
      console.log('[AI Execution Service] Using Redemption V2 (Gas Manager sponsorship)')
      
      const broadcastResult = await metaMaskRedemptionV2Service.redeemDelegation({
        accountAddress: lowerAccount as `0x${string}`,
        protocolAddress: protocolAddress as `0x${string}`,
        callData: '0x', // Empty calldata for now (can add swap logic later)
        amountUsd: primaryAllocation.amountUsd ?? 0
      })
      
      console.log('[AI Execution Service] Redemption V2 result:', {
        ok: broadcastResult.ok,
        userOpHash: broadcastResult.userOpHash,
        txHash: broadcastResult.txHash,
        reason: broadcastResult.reason
      })

      if (!broadcastResult.ok) {
        logger.error({ account: lowerAccount, reason: broadcastResult.reason }, 'Transaction broadcast failed')
        return { success: false, reason: broadcastResult.reason }
      }

      // 10. Record execution in database
      const execution = await prisma.aIExecutionLog.create({
        data: {
          accountAddress: lowerAccount,
          delegateAddress: delegation.delegate,
          summary: recommendations.summary ?? 'AI auto-execution',
          totalExecutedUsd: totalAmount,
          remainingDailyLimitUsd: effectiveDailyLimit - totalAmount,
          actions: recommendations.allocations as any,
          executionMode: 'auto',
          txHashes: broadcastResult.txHash ? [broadcastResult.txHash] : [],
          reasoning: primaryAllocation.reasoning,
          userApproved: false,
          evaluation: recommendations.evaluation as any,
          model: recommendations.model,
          provider: recommendations.provider,
          analysis: recommendations.analysis,
          generatedAt: new Date()
        }
      })

      // 11. Update delegation spend tracking
      await prisma.delegation.update({
        where: {
          corporateId_delegate: {
            corporateId: lowerAccount,
            delegate: delegation.delegate
          }
        },
        data: {
          autoExecutedUsd: autoExecutedUsd + totalAmount,
          lastAutoExecutionAt: new Date()
        }
      })

      logger.info({ 
        account: lowerAccount, 
        executionId: execution.id, 
        amount: totalAmount,
        txHash: broadcastResult.txHash 
      }, 'Auto-execution completed successfully')

      return {
        success: true,
        execution: {
          id: execution.id,
          account: execution.accountAddress,
          delegate: execution.delegateAddress,
          generatedAt: execution.generatedAt.toISOString(),
          createdAt: execution.createdAt.toISOString(),
          summary: execution.summary,
          totalExecutedUsd: execution.totalExecutedUsd,
          remainingDailyLimitUsd: execution.remainingDailyLimitUsd,
          actions: execution.actions as any,
          executionMode: 'auto',
          txHashes: execution.txHashes as string[] | undefined,
          profitLossUsd: execution.profitLossUsd ?? undefined,
          reasoning: execution.reasoning ?? undefined,
          userApproved: execution.userApproved,
          analysis: execution.analysis ?? undefined,
          evaluation: execution.evaluation as any,
          model: execution.model ?? undefined,
          provider: execution.provider ?? undefined
        }
      }
    } catch (error) {
      logger.error({ err: error, account: lowerAccount }, 'Auto-execution failed with exception')
      return {
        success: false,
        reason: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get portfolio snapshot for account
   */
  private async getPortfolioSnapshot (account: string, portfolioValue?: number): Promise<PortfolioSnapshot | null> {
    try {
      // If portfolio value provided, create mock snapshot
      if (portfolioValue != null) {
        return {
          positions: [],
          totalValueUSD: portfolioValue,
          netAPY: 0
        }
      }

      // Try to get from database
      const snapshot = await prisma.portfolioSnapshot.findFirst({
        where: { accountId: account },
        orderBy: { capturedAt: 'desc' }
      })

      if (snapshot?.data && typeof snapshot.data === 'object') {
        const data = snapshot.data as any
        return {
          positions: data.positions ?? [],
          totalValueUSD: data.totalValueUSD ?? 0,
          netAPY: data.netAPY ?? 0
        }
      }

      // Fallback: Get real balance from blockchain
      try {
        const { ethers } = await import('ethers')
        const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz')
        const balance = await provider.getBalance(account)
        const balanceMON = parseFloat(ethers.formatEther(balance))
        // Approximate MON price (update if needed)
        const monPriceUSD = 5
        const totalValueUSD = balanceMON * monPriceUSD
        
        logger.info({ account, balanceMON, totalValueUSD }, 'Portfolio snapshot fallback: real balance')
        
        return {
          positions: [],
          totalValueUSD: Math.max(totalValueUSD, 0),
          netAPY: 0
        }
      } catch (balanceError) {
        logger.error({ err: balanceError }, 'Failed to get real balance, using zero')
        return {
          positions: [],
          totalValueUSD: 0,
          netAPY: 0
        }
      }
    } catch (error) {
      logger.error({ err: error, account }, 'Failed to get portfolio snapshot')
      return null
    }
  }

  /**
   * Check if account is eligible for auto-execution
   */
  async isEligibleForAutoExecution (account: string): Promise<boolean> {
    try {
      const delegation = await blockchainService.getDelegationWithDynamicLimits(account)
      
      if (delegation == null) {
        return false
      }

      return (
        delegation.autoExecutionEnabled === true &&
        delegation.active !== false &&
        (delegation.portfolioPercentage ?? 0) > 0
      )
    } catch (error) {
      logger.error({ err: error, account }, 'Failed to check auto-execution eligibility')
      return false
    }
  }
}

export const aiExecutionService = new AIExecutionService()
