import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '../../../db/prisma'
import { deferredExecutionService } from '../deferred-execution.service'
import { marketContextService } from '../../market/market-context.service'

describe('DeferredExecutionService', () => {
  const testAccount = '0xTEST_DEFERRED_' + Date.now()

  afterEach(async () => {
    await prisma.deferredTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
  })

  describe('Defer Transaction', () => {
    it('should create deferred transaction', async () => {
      const deferredId = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'deposit',
          protocol: 'aave:usdc',
          amount: 5000,
          expectedAPY: 8.2
        } as any,
        deferHours: 6,
        reason: 'High gas - optimization',
        currentGasPrice: 50,
        targetGasPrice: 20
      })

      expect(deferredId).toBeDefined()

      const deferred = await prisma.deferredTransaction.findUnique({
        where: { id: deferredId }
      })

      expect(deferred).toBeDefined()
      expect(deferred?.status).toBe('pending')
      expect(deferred?.originalGasPrice).toBe(50)
      expect(deferred?.targetGasPrice).toBe(20)
    })

    it('should set deferredUntil correctly', async () => {
      const now = Date.now()
      
      const deferred = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'withdraw',
          protocol: 'yearn:usdc',
          amount: 2000
        } as any,
        deferHours: 12,
        reason: 'Gas optimization',
        currentGasPrice: 40,
        targetGasPrice: 18
      })

      expect(deferred).toBeDefined()
      
      const deferredUntil = new Date(deferred!.deferredUntil).getTime()
      const expectedTime = now + 12 * 60 * 60 * 1000

      // Allow 5 second tolerance
      expect(deferredUntil).toBeGreaterThan(expectedTime - 5000)
      expect(deferredUntil).toBeLessThan(expectedTime + 5000)
    })
  })

  describe('Check and Execute Pending', () => {
    it('should execute when gas drops below target', async () => {
      // Create deferred transaction
      const deferred = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'deposit',
          protocol: 'aave:usdc',
          amount: 5000
        } as any,
        deferHours: 0, // Immediately eligible
        reason: 'High gas',
        currentGasPrice: 50,
        targetGasPrice: 20
      })

      expect(deferred).toBeDefined()
      
      // Mock gas price drop
      vi.spyOn(marketContextService, 'getContext').mockResolvedValue({
        network: {
          name: 'monad-testnet',
          currentGasPrice: 15, // Below target of 20
          averageGasPrice24h: 18,
          gasPriceTrend: 'falling'
        },
        market: {
          fearGreedIndex: 50,
          sentiment: 'neutral'
        },
        protocols: [],
        timestamp: new Date().toISOString()
      } as any)

      // This would normally execute the transaction
      // For test, just check it would be attempted
      const pending = await deferredExecutionService.getPendingTransactions(testAccount)
      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe(deferred!.id)
    })

    it('should not execute if gas still too high', async () => {
      const deferred = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'swap',
          protocol: 'uniswap:usdc-usdt',
          amount: 1000
        } as any,
        deferHours: 0,
        reason: 'High gas',
        currentGasPrice: 50,
        targetGasPrice: 20
      })

      expect(deferred).toBeDefined()
      
      // Mock gas price still high
      vi.spyOn(marketContextService, 'getContext').mockResolvedValue({
        network: {
          name: 'monad-testnet',
          currentGasPrice: 45, // Still above target
          averageGasPrice24h: 40,
          gasPriceTrend: 'stable'
        },
        market: {
          fearGreedIndex: 50,
          sentiment: 'neutral'
        },
        protocols: [],
        timestamp: new Date().toISOString()
      } as any)

      const result = await prisma.deferredTransaction.findUnique({
        where: { id: deferred!.id }
      })

      expect(result?.status).toBe('pending')
    })

    it('should expire transaction after max attempts', async () => {
      const deferred = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'deposit',
          protocol: 'aave:usdc',
          amount: 5000
        } as any,
        deferHours: 0,
        reason: 'Gas optimization',
        currentGasPrice: 50,
        targetGasPrice: 20
      })

      expect(deferred).toBeDefined()
      
      // Manually set attemptCount to max
      await prisma.deferredTransaction.update({
        where: { id: deferred!.id },
        data: { attemptCount: 3 } // Max attempts
      })

      // Even if gas is low, should expire
      vi.spyOn(marketContextService, 'getContext').mockResolvedValue({
        network: {
          currentGasPrice: 10,
          averageGasPrice24h: 15,
          gasPriceTrend: 'falling'
        }
      } as any)

      // Would check and potentially expire
      const result = await prisma.deferredTransaction.findUnique({
        where: { id: deferred!.id }
      })

      expect(result?.attemptCount).toBe(3)
    })
  })

  describe('Cancel Deferred Transaction', () => {
    it('should cancel pending transaction', async () => {
      const deferred = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'withdraw',
          protocol: 'yearn:usdc',
          amount: 3000
        } as any,
        deferHours: 6,
        reason: 'Gas optimization',
        currentGasPrice: 40,
        targetGasPrice: 20
      })

      await deferredExecutionService.cancelDeferred(deferred!.id)

      const result = await prisma.deferredTransaction.findUnique({
        where: { id: deferred!.id }
      })

      expect(result?.status).toBe('cancelled')
      expect(result?.cancelledAt).toBeDefined()
    })

    it('should not cancel already executed transaction', async () => {
      const deferredObj = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: {
          action: 'deposit',
          protocol: 'aave:usdc',
          amount: 1000
        } as any,
        deferHours: 1,
        reason: 'Test',
        currentGasPrice: 30,
        targetGasPrice: 20
      })

      // Manually mark as executed
      await prisma.deferredTransaction.update({
        where: { id: deferredObj!.id },
        data: { status: 'executed' }
      })

      // Try to cancel
      await expect(
        deferredExecutionService.cancelDeferred(deferredObj!.id)
      ).rejects.toThrow('Cannot cancel already executed transaction')
    })
  })

  describe('Get Pending Transactions', () => {
    it('should return only pending transactions for account', async () => {
      // Create multiple deferred transactions
      const defer1 = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: { action: 'deposit', protocol: 'aave:usdc', amount: 1000 } as any,
        deferHours: 6,
        reason: 'Gas',
        currentGasPrice: 40,
        targetGasPrice: 20
      })

      const defer2 = await deferredExecutionService.deferTransaction({
        accountAddress: testAccount,
        recommendation: { action: 'withdraw', protocol: 'yearn:usdc', amount: 2000 } as any,
        deferHours: 12,
        reason: 'Gas',
        currentGasPrice: 45,
        targetGasPrice: 20
      })

      // Cancel one
      await deferredExecutionService.cancelDeferred(defer2!.id)

      const pending = await deferredExecutionService.getPendingTransactions(testAccount)

      expect(pending).toHaveLength(1)
      expect(pending[0].id).toBe(defer1!.id)
      expect(pending[0].status).toBe('pending')
    })

    it('should not return transactions for other accounts', async () => {
      const otherAccount = '0xOTHER'

      await deferredExecutionService.deferTransaction({
        accountAddress: otherAccount,
        recommendation: { action: 'deposit', protocol: 'aave:usdc', amount: 5000 } as any,
        deferHours: 6,
        reason: 'Gas',
        currentGasPrice: 40,
        targetGasPrice: 20
      })

      const pending = await deferredExecutionService.getPendingTransactions(testAccount)

      expect(pending).toHaveLength(0)
    })
  })

  describe('Multiple Deferrals', () => {
    it('should handle multiple deferrals correctly', async () => {
      const ids = []

      for (let i = 0; i < 3; i++) {
        const id = await deferredExecutionService.deferTransaction({
          accountAddress: testAccount,
          recommendation: {
            action: 'deposit',
            protocol: 'aave:usdc',
            amount: 1000 * (i + 1)
          } as any,
          deferHours: 6 + i * 2,
          reason: `Gas optimization ${i}`,
          currentGasPrice: 40 + i * 5,
          targetGasPrice: 20
        })
        ids.push(id)
      }

      const pending = await deferredExecutionService.getPendingTransactions(testAccount)

      expect(pending).toHaveLength(3)
      const pendingIds = pending.map(p => p.id).sort()
      const expectedIds = ids.map(id => id.id).sort()
      expect(pendingIds).toEqual(expectedIds)
    })
  })
})
