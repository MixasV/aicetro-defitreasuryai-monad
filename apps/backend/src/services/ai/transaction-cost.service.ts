import { marketContextService } from '../market/market-context.service'
import { prisma } from '../../db/prisma'
import type {
  TransactionCostParams,
  TransactionCost,
  FeeLimitStatus
} from '../../types/market-context.types'

class TransactionCostService {
  async analyzeCost(params: TransactionCostParams): Promise<TransactionCost> {
    console.log('[TxCost] Analyzing transaction cost...', { 
      protocol: params.protocol, 
      amount: params.amountUSD,
      isEmergency: params.isEmergency || false
    })
    
    // Emergency operations bypass all checks
    if (params.isEmergency) {
      console.log('[TxCost] ⚠️ EMERGENCY OPERATION - Bypassing fee limits!')
    }
    
    const gasUnits = this.estimateGasUnits(params.action, params.protocol)
    
    const marketCtx = await marketContextService.getContext()
    const currentGas = marketCtx.network.currentGasPrice
    
    // ✅ Monad uses MON for gas, not ETH!
    // Gas cost in MON tokens (not ETH)
    const costMON = (gasUnits * currentGas) / 1e9
    
    // MON price ≈ $5 (Monad testnet token)
    // TODO: Get real MON price from Alchemy or CoinGecko
    const monPrice = 5.0
    
    const costUSD = costMON * monPrice
    
    const optimizedGas = marketCtx.network.nextLowGasPeriod?.estimatedGasPrice
    
    let optimizedCostUSD: number | undefined
    let savingsUSD: number | undefined
    let hoursToWait: number | undefined
    
    if (optimizedGas && optimizedGas < currentGas) {
      const optimizedCostMON = (gasUnits * optimizedGas) / 1e9
      optimizedCostUSD = optimizedCostMON * monPrice
      savingsUSD = costUSD - optimizedCostUSD
      hoursToWait = marketCtx.network.nextLowGasPeriod!.estimatedHours
    }
    
    const dailyYield = (params.amountUSD * params.expectedAPY / 100) / 365
    const daysToBreakEven = dailyYield > 0 ? costUSD / dailyYield : 999
    
    const feeLimitStatus = await this.checkFeeLimit(
      costUSD,
      params.portfolioTotalUSD,
      params.aiManagedCapitalUSD,
      params.accountAddress,
      params.isEmergency
    )
    
    // Emergency operations always worth executing
    const worthExecuting = params.isEmergency ? true : (
      feeLimitStatus.withinLimit &&
      (costUSD / params.amountUSD < 0.02) &&
      daysToBreakEven < 30
    )
    
    console.log('[TxCost] Analysis complete:', {
      costUSD: costUSD.toFixed(2),
      dailyYield: dailyYield.toFixed(2),
      daysToBreakEven: daysToBreakEven.toFixed(1),
      worthExecuting
    })
    
    return {
      estimatedGasUnits: gasUnits,
      currentGasPriceGwei: currentGas,
      estimatedCostUSD: Math.round(costUSD * 100) / 100,
      optimizedGasPriceGwei: optimizedGas,
      optimizedCostUSD: optimizedCostUSD ? Math.round(optimizedCostUSD * 100) / 100 : undefined,
      potentialSavingsUSD: savingsUSD ? Math.round(savingsUSD * 100) / 100 : undefined,
      hoursToWait,
      dailyYieldUSD: Math.round(dailyYield * 100) / 100,
      daysToBreakEven: Math.round(daysToBreakEven * 10) / 10,
      worthExecuting,
      feeLimitStatus
    }
  }

  async checkFeeLimit(
    proposedCostUSD: number,
    portfolioTotalUSD: number,
    aiManagedCapitalUSD: number,
    accountAddress: string,
    isEmergency?: boolean
  ): Promise<FeeLimitStatus> {
    const portfolioLimit = portfolioTotalUSD * 0.003
    const aiCapitalLimit = aiManagedCapitalUSD * 0.01
    const calculatedLimit = Math.min(portfolioLimit, aiCapitalLimit)
    // ✅ Minimum fee limit: $10 (allows transactions even for small portfolios)
    const monthlyLimit = Math.max(10, calculatedLimit)
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let spent30Days = 0
    
    try {
      const feeTransactions = await prisma.feeTransaction.findMany({
        where: {
          accountAddress,
          createdAt: { gte: thirtyDaysAgo }
        },
        select: { amountUSD: true }
      })
      
      spent30Days = feeTransactions.reduce((sum: number, tx: any) => sum + tx.amountUSD, 0)
    } catch (error) {
      console.debug('[TxCost] Fee transaction query skipped (model may not exist yet)')
    }
    
    const remaining = monthlyLimit - spent30Days
    const actualWithinLimit = (spent30Days + proposedCostUSD) <= monthlyLimit
    const percentUsed = monthlyLimit > 0 ? (spent30Days / monthlyLimit) * 100 : 0
    
    // Emergency operations bypass limits but still track usage
    const withinLimit = isEmergency ? true : actualWithinLimit
    const bypassedDueToEmergency = isEmergency && !actualWithinLimit
    
    console.log('[TxCost] Fee limit check:', {
      monthlyLimit: monthlyLimit.toFixed(2),
      spent30Days: spent30Days.toFixed(2),
      remaining: remaining.toFixed(2),
      withinLimit,
      percentUsed: percentUsed.toFixed(1),
      isEmergency: isEmergency || false,
      bypassedDueToEmergency
    })
    
    return {
      monthlyLimit: Math.round(monthlyLimit * 100) / 100,
      spent30Days: Math.round(spent30Days * 100) / 100,
      remaining: Math.round(remaining * 100) / 100,
      withinLimit,
      percentUsed: Math.round(percentUsed * 10) / 10,
      bypassedDueToEmergency
    }
  }

  private estimateGasUnits(action: string, protocol: string): number {
    const estimates: Record<string, number> = {
      'aave:deposit': 200000,
      'aave:withdraw': 180000,
      'yearn:deposit': 250000,
      'yearn:withdraw': 220000,
      'nabla:swap': 150000,
      'nabla:addLiquidity': 300000,
      'nabla:removeLiquidity': 250000,
      'compound:deposit': 180000,
      'compound:withdraw': 160000
    }
    
    const protocolType = protocol.split(':')[0]
    const key = `${protocolType}:${action}`
    
    return estimates[key] || 200000
  }

  async recordFeeTransaction(params: {
    accountAddress: string
    txHash: string
    action: string
    protocol: string
    gasUsed: bigint
    gasPriceGwei: number
    ethPrice: number
  }): Promise<void> {
    const amountUSD = (Number(params.gasUsed) * params.gasPriceGwei / 1e9) * params.ethPrice
    
    try {
      await prisma.feeTransaction.create({
        data: {
          accountAddress: params.accountAddress,
          txHash: params.txHash,
          action: params.action,
          protocol: params.protocol,
          gasUsed: params.gasUsed,
          gasPriceGwei: params.gasPriceGwei,
          ethPrice: params.ethPrice,
          amountUSD: Math.round(amountUSD * 100) / 100
        }
      })
      
      console.log('[TxCost] Fee transaction recorded:', { txHash: params.txHash, amountUSD: amountUSD.toFixed(2) })
    } catch (error) {
      console.debug('[TxCost] Fee transaction record skipped (model may not exist yet)')
    }
  }
}

export const txCostService = new TransactionCostService()
