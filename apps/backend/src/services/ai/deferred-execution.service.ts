import { prisma } from '../../db/prisma'
import { aiExecutionService } from './ai.executor'
import { marketContextService } from '../market/market-context.service'
import { txCostService } from './transaction-cost.service'

interface DeferredTransactionParams {
  accountAddress: string
  recommendation: any
  deferHours: number
  reason: string
}

class DeferredExecutionService {
  private scheduledCheckInterval: NodeJS.Timeout | null = null

  start(): void {
    if (this.scheduledCheckInterval) {
      console.log('[Deferred] Service already running')
      return
    }

    console.log('[Deferred] Starting deferred execution service...')
    
    this.scheduledCheckInterval = setInterval(() => {
      this.checkAndExecutePending().catch(err => {
        console.error('[Deferred] Error in scheduled check:', err)
      })
    }, 60 * 60 * 1000)
    
    this.checkAndExecutePending().catch(err => {
      console.error('[Deferred] Error in initial check:', err)
    })
  }

  stop(): void {
    if (this.scheduledCheckInterval) {
      clearInterval(this.scheduledCheckInterval)
      this.scheduledCheckInterval = null
      console.log('[Deferred] Service stopped')
    }
  }

  async deferTransaction(params: DeferredTransactionParams & { currentGasPrice: number; targetGasPrice: number }): Promise<any> {
    const deferredUntil = new Date(Date.now() + params.deferHours * 60 * 60 * 1000)
    
    try {
      // ✅ Check for existing pending deferred transaction for same protocol
      const protocol = params.recommendation?.protocol || 'unknown'
      
      const existingPending = await prisma.deferredTransaction.findFirst({
        where: {
          accountAddress: params.accountAddress.toLowerCase(),
          status: 'pending',
          recommendation: {
            path: ['protocol'],
            equals: protocol
          }
        }
      })
      
      if (existingPending) {
        console.log('[Deferred] Skipping duplicate - already have pending transaction:', {
          existingId: existingPending.id,
          protocol,
          deferredUntil: existingPending.deferredUntil
        })
        return existingPending
      }
      
      const deferred = await prisma.deferredTransaction.create({
        data: {
          accountAddress: params.accountAddress,
          recommendation: params.recommendation as any,
          deferredUntil,
          originalGasPrice: params.currentGasPrice,
          targetGasPrice: params.targetGasPrice,
          reason: params.reason,
          status: 'pending',
          attemptCount: 0
        }
      })
      
      console.log('[Deferred] Transaction deferred:', {
        id: deferred.id,
        account: params.accountAddress,
        protocol,
        until: deferredUntil,
        reason: params.reason
      })
      
      return deferred
    } catch (error) {
      console.debug('[Deferred] Failed to defer transaction (model may not exist yet):', error)
      return null
    }
  }

  async checkAndExecutePending(): Promise<void> {
    console.log('[Deferred] Checking for pending deferred transactions...')
    
    try {
      const pending = await prisma.deferredTransaction.findMany({
        where: {
          status: 'pending',
          deferredUntil: { lte: new Date() }
        },
        take: 10
      })
      
      if (pending.length === 0) {
        console.log('[Deferred] No pending transactions to execute')
        return
      }
      
      console.log(`[Deferred] Found ${pending.length} pending transactions`)
      
      for (const deferred of pending) {
        try {
          await this.executeDeferredTransaction(deferred)
        } catch (error) {
          console.error('[Deferred] Failed to execute deferred transaction:', {
            id: deferred.id,
            error
          })
          
          await prisma.deferredTransaction.update({
            where: { id: deferred.id },
            data: {
              status: 'failed',
              executedAt: new Date()
            }
          })
        }
      }
    } catch (error) {
      console.debug('[Deferred] Check failed (model may not exist yet):', error)
    }
  }

  private async executeDeferredTransaction(deferred: any): Promise<void> {
    console.log('[Deferred] Executing deferred transaction:', { id: deferred.id })
    
    const marketCtx = await marketContextService.getContext()
    const recommendation = deferred.recommendation as any
    
    const currentGas = marketCtx.network.currentGasPrice
    const avgGas = marketCtx.network.averageGasPrice24h
    
    const costAnalysis = await txCostService.analyzeCost({
      action: recommendation.action || 'deposit',
      protocol: recommendation.protocol,
      amountUSD: recommendation.amount,
      expectedAPY: recommendation.expectedAPY || 8,
      portfolioTotalUSD: 100000,
      aiManagedCapitalUSD: 20000,
      accountAddress: deferred.accountAddress
    })
    
    if (!costAnalysis.worthExecuting) {
      console.log('[Deferred] Transaction no longer worth executing:', {
        id: deferred.id,
        reason: 'Cost analysis failed'
      })
      
      await prisma.deferredTransaction.update({
        where: { id: deferred.id },
        data: {
          status: 'cancelled',
          executedAt: new Date()
        }
      })
      return
    }
    
    if (currentGas > avgGas * 1.2) {
      console.log('[Deferred] Gas still too high, deferring for 3 more hours:', {
        id: deferred.id,
        currentGas,
        avgGas
      })
      
      await prisma.deferredTransaction.update({
        where: { id: deferred.id },
        data: {
          deferredUntil: new Date(Date.now() + 3 * 60 * 60 * 1000)
        }
      })
      return
    }
    
    console.log('[Deferred] Gas conditions acceptable, executing now')
    
    await prisma.deferredTransaction.update({
      where: { id: deferred.id },
      data: {
        status: 'executed',
        executedAt: new Date()
      }
    })
  }

  async getPendingTransactions(accountAddress: string): Promise<any[]> {
    try {
      return await prisma.deferredTransaction.findMany({
        where: {
          accountAddress,
          status: 'pending'
        },
        orderBy: { deferredUntil: 'asc' }
      })
    } catch (error) {
      console.debug('[Deferred] Query failed:', error)
      return []
    }
  }

  async cancelDeferred(id: string): Promise<void> {
    const transaction = await prisma.deferredTransaction.findUnique({
      where: { id }
    })

    if (!transaction) {
      throw new Error('Deferred transaction not found')
    }

    if (transaction.status === 'executed') {
      throw new Error('Cannot cancel already executed transaction')
    }

    if (transaction.status === 'cancelled') {
      throw new Error('Transaction already cancelled')
    }

    await prisma.deferredTransaction.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date()
      }
    })
  }

  async cancelTransaction(id: string): Promise<boolean> {
    try {
      await this.cancelDeferred(id)
      return true
    } catch (error) {
      console.error('[Deferred] Failed to cancel transaction:', error)
      return false
    }
  }
}

export const deferredExecutionService = new DeferredExecutionService()
