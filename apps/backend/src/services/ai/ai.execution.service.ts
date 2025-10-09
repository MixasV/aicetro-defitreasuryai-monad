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

      if (remainingAllowance <= 0) {
        return { success: false, reason: 'Auto-execution allowance exhausted' }
      }

      const effectiveDailyLimit = Math.min(
        Number.parseFloat(delegation.dailyLimit),
        remainingAllowance
      )

      // 6. Generate AI recommendations
      const aiRequest: AIRecommendationRequest = {
        portfolio: portfolioSnapshot,
        riskTolerance: 'conservative',
        protocols: delegation.allowedProtocols,
        constraints: {
          dailyLimitUsd: effectiveDailyLimit,
          remainingDailyLimitUsd: effectiveDailyLimit - Number.parseFloat(delegation.spent24h),
          maxRiskScore: delegation.maxRiskScore,
          whitelist: delegation.allowedProtocols
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
      if (recommendations.allocations.length === 0) {
        return { success: false, reason: 'No recommendations generated' }
      }

      // Calculate total amount to execute
      const totalAmount = recommendations.allocations.reduce(
        (sum, alloc) => sum + (alloc.amountUsd ?? 0),
        0
      )

      if (totalAmount <= 0) {
        return { success: false, reason: 'No executable amount' }
      }

      if (totalAmount > effectiveDailyLimit) {
        logger.warn({ account: lowerAccount, totalAmount, effectiveDailyLimit }, 'Auto-execution amount exceeds limit')
        return { success: false, reason: `Amount ${totalAmount} exceeds limit ${effectiveDailyLimit}` }
      }

      // 8. Execute first allocation (for MVP, execute one at a time)
      const primaryAllocation = recommendations.allocations[0]
      
      const executionPlan = await blockchainService.prepareDelegatedExecution({
        account: lowerAccount,
        delegate: delegation.delegate,
        protocolId: primaryAllocation.protocol,
        protocolAddress: primaryAllocation.protocol, // TODO: resolve actual address
        amountUsd: primaryAllocation.amountUsd ?? 0
      })

      if (!executionPlan.ok) {
        logger.error({ account: lowerAccount, reason: executionPlan.reason }, 'Execution plan failed')
        return { success: false, reason: executionPlan.reason }
      }

      // 9. Broadcast transaction (AI agent signs)
      const broadcastResult = await blockchainService.broadcastDelegatedExecution(executionPlan.plan)

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

      // Fallback to mock data
      return {
        positions: [],
        totalValueUSD: 100000,
        netAPY: 0
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
