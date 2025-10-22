import { prisma } from '../../db/prisma'
import { assetRulesService } from './asset-rules.service'
import type { CapitalTransactionParams } from '../../types/asset-rules.types'

class CapitalManagementService {
  async recordTransaction(params: CapitalTransactionParams): Promise<void> {
    console.log('[Capital] Recording capital transaction...', {
      account: params.accountAddress,
      type: params.type,
      amount: params.amount
    })
    
    const rules = await assetRulesService.getRules(params.accountAddress)
    
    if (!rules) {
      console.warn('[Capital] No asset rules found for account:', params.accountAddress)
      return
    }
    
    const balanceBefore = rules.aiManagedCapital
    let balanceAfter = balanceBefore
    
    switch (params.type) {
      case 'allocate_to_ai':
        balanceAfter = balanceBefore + params.amount
        break
      case 'withdraw_from_ai':
        balanceAfter = Math.max(0, balanceBefore - params.amount)
        break
      case 'profit':
        balanceAfter = balanceBefore + params.amount
        break
      case 'loss':
        balanceAfter = Math.max(0, balanceBefore - params.amount)
        break
    }
    
    try {
      await prisma.capitalTransaction.create({
        data: {
          accountAddress: params.accountAddress,
          type: params.type,
          amount: params.amount,
          balanceBefore,
          balanceAfter,
          reason: params.reason,
          txHash: params.txHash
        }
      })
      
      await prisma.assetManagementRules.update({
        where: { accountAddress: params.accountAddress },
        data: {
          aiManagedCapital: balanceAfter,
          updatedAt: new Date()
        }
      })
      
      console.log('[Capital] Transaction recorded:', {
        type: params.type,
        balanceBefore,
        balanceAfter,
        change: balanceAfter - balanceBefore
      })
    } catch (error) {
      console.error('[Capital] Failed to record transaction:', error)
      throw new Error('Failed to record capital transaction')
    }
  }

  async getCapitalHistory(accountAddress: string, limit: number = 50): Promise<any[]> {
    try {
      return await prisma.capitalTransaction.findMany({
        where: { accountAddress },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      console.debug('[Capital] History query failed:', error)
      return []
    }
  }

  async getCurrentBalance(accountAddress: string): Promise<number> {
    const rules = await assetRulesService.getRules(accountAddress)
    return rules?.aiManagedCapital || 0
  }

  async adjustForProfit(accountAddress: string, profitUSD: number, reason?: string): Promise<void> {
    if (profitUSD === 0) return
    
    await this.recordTransaction({
      accountAddress,
      type: profitUSD > 0 ? 'profit' : 'loss',
      amount: Math.abs(profitUSD),
      reason: reason || `Automated ${profitUSD > 0 ? 'profit' : 'loss'} adjustment`
    })
  }

  // Convenience methods for tests
  async recordProfit(params: { accountAddress: string; amountUSD: number; source: string; txHash?: string }): Promise<void> {
    await this.recordTransaction({
      accountAddress: params.accountAddress,
      type: 'profit',
      amount: params.amountUSD,
      reason: `Profit from ${params.source}`,
      txHash: params.txHash
    })
  }

  async recordLoss(params: { accountAddress: string; amountUSD: number; source: string; txHash?: string }): Promise<void> {
    await this.recordTransaction({
      accountAddress: params.accountAddress,
      type: 'loss',
      amount: params.amountUSD,
      reason: `Loss from ${params.source}`,
      txHash: params.txHash
    })
  }

  async allocateCapital(params: { accountAddress: string; amountUSD: number; txHash: string }): Promise<void> {
    await this.recordTransaction({
      accountAddress: params.accountAddress,
      type: 'allocate_to_ai',
      amount: params.amountUSD,
      reason: 'User allocated more capital to AI',
      txHash: params.txHash
    })
  }

  async withdrawCapital(params: { accountAddress: string; amountUSD: number; txHash: string }): Promise<void> {
    const rules = await assetRulesService.getRules(params.accountAddress)
    
    if (!rules) {
      throw new Error('No asset rules found')
    }

    if (params.amountUSD > rules.aiManagedCapital) {
      throw new Error(`Cannot withdraw $${params.amountUSD} - only $${rules.aiManagedCapital} available`)
    }

    await this.recordTransaction({
      accountAddress: params.accountAddress,
      type: 'withdraw_from_ai',
      amount: params.amountUSD,
      reason: 'User manual withdrawal',
      txHash: params.txHash
    })
  }

  async getHistory(accountAddress: string, limit: number = 50): Promise<any[]> {
    return this.getCapitalHistory(accountAddress, limit)
  }

  async getSummary(accountAddress: string): Promise<any> {
    const rules = await assetRulesService.getRules(accountAddress)
    
    if (!rules) {
      return null
    }

    // Get transactions in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTransactions = await prisma.capitalTransaction.findMany({
      where: {
        accountAddress,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const totalProfit = recentTransactions
      .filter(t => t.type === 'profit')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalLoss = recentTransactions
      .filter(t => t.type === 'loss')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit30d = totalProfit - totalLoss

    // Calculate ROI
    const roi30d = rules.aiManagedCapital > 0
      ? (netProfit30d / rules.aiManagedCapital) * 100
      : 0

    return {
      currentCapital: rules.aiManagedCapital,
      totalCapital: rules.totalCapital,
      allocationPercent: (rules.aiManagedCapital / rules.totalCapital) * 100,
      netProfit30d,
      totalProfit,
      totalLoss,
      roi30d,
      transactionCount: recentTransactions.length
    }
  }
}

export const capitalManagementService = new CapitalManagementService()

// Export for testing
export { CapitalManagementService }
