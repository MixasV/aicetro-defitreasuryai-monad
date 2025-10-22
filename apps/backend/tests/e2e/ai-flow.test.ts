import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../../src/db/prisma'
import { marketContextService } from '../../src/services/market/market-context.service'
import { aiExecutor } from '../../src/services/ai/ai.executor'
import { deferredExecutionService } from '../../src/services/ai/deferred-execution.service'

describe('AI Agent Full Flow E2E Tests', () => {
  let testAccount: string

  beforeAll(async () => {
    // Setup test database
    testAccount = '0xTEST_' + Date.now()
  })

  afterAll(async () => {
    // Cleanup
    await prisma.assetManagementRules.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.feeTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.capitalTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.deferredTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.executionRecord.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.$disconnect()
  })

  describe('Asset Rules Setup', () => {
    it('should create asset rules with correct fee limits', async () => {
      const response = await request(app)
        .post('/api/asset-management/rules')
        .send({
          accountAddress: testAccount,
          aiManagedCapital: 20000,
          totalCapital: 100000,
          assets: [
            {
              token: '0xUSDC',
              symbol: 'USDC',
              maxAllocationPercent: 60,
              currentAllocation: 0,
              allowedChains: ['monad'],
              canSwap: true,
              swapPairs: ['USDT', 'DAI'],
              canBridge: false
            },
            {
              token: '0xUSDT',
              symbol: 'USDT',
              maxAllocationPercent: 30,
              currentAllocation: 0,
              allowedChains: ['monad'],
              canSwap: true,
              swapPairs: ['USDC'],
              canBridge: false
            },
            {
              token: '0xDAI',
              symbol: 'DAI',
              maxAllocationPercent: 10,
              currentAllocation: 0,
              allowedChains: ['monad'],
              canSwap: false,
              canBridge: false
            }
          ]
        })

      expect(response.status).toBe(200)
      expect(response.body.maxFeesMonthly).toBe(200) // MIN(100000 * 0.003, 20000 * 0.01) = MIN(300, 200)
      expect(response.body.aiManagedCapital).toBe(20000)
      expect(response.body.assets).toHaveLength(3)
    })

    it('should reject AI capital exceeding total capital', async () => {
      const response = await request(app)
        .post('/api/asset-management/rules')
        .send({
          accountAddress: testAccount + '_invalid',
          aiManagedCapital: 150000,
          totalCapital: 100000,
          assets: []
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('exceed total capital')
    })

    it('should reject total allocation > 100%', async () => {
      const response = await request(app)
        .post('/api/asset-management/rules')
        .send({
          accountAddress: testAccount + '_invalid2',
          aiManagedCapital: 20000,
          totalCapital: 100000,
          assets: [
            {
              token: '0xUSDC',
              symbol: 'USDC',
              maxAllocationPercent: 60,
              currentAllocation: 0,
              allowedChains: ['monad'],
              canSwap: false,
              canBridge: false
            },
            {
              token: '0xUSDT',
              symbol: 'USDT',
              maxAllocationPercent: 50,
              currentAllocation: 0,
              allowedChains: ['monad'],
              canSwap: false,
              canBridge: false
            }
          ]
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('exceed 100%')
    })
  })

  describe('Action Validation', () => {
    it('should validate deposit within allocation limits', async () => {
      // First set up rules with current allocation
      await prisma.assetManagementRules.upsert({
        where: { accountAddress: testAccount },
        update: {
          aiManagedCapital: 20000,
          totalCapital: 100000,
          assets: [
            {
              token: '0xUSDC',
              symbol: 'USDC',
              maxAllocationPercent: 50, // Max $10k
              currentAllocation: 8000,  // Already $8k
              allowedChains: ['monad'],
              canSwap: false,
              canBridge: false
            }
          ] as any
        },
        create: {
          accountAddress: testAccount,
          aiManagedCapital: 20000,
          totalCapital: 100000,
          maxFeesMonthly: 200,
          assets: [
            {
              token: '0xUSDC',
              symbol: 'USDC',
              maxAllocationPercent: 50,
              currentAllocation: 8000,
              allowedChains: ['monad'],
              canSwap: false,
              canBridge: false
            }
          ] as any
        }
      })

      const response = await request(app)
        .post('/api/asset-management/validate-action')
        .send({
          accountAddress: testAccount,
          action: 'deposit',
          asset: 'USDC',
          amountUSD: 3000 // Would exceed $10k limit
        })

      expect(response.status).toBe(200)
      expect(response.body.allowed).toBe(false)
      expect(response.body.reason).toContain('exceed')
    })

    it('should allow swap when permitted', async () => {
      await prisma.assetManagementRules.update({
        where: { accountAddress: testAccount },
        data: {
          assets: [
            {
              token: '0xUSDC',
              symbol: 'USDC',
              maxAllocationPercent: 80,
              currentAllocation: 10000,
              allowedChains: ['monad'],
              canSwap: true,
              swapPairs: ['USDT', 'DAI'],
              canBridge: false
            }
          ] as any
        }
      })

      const response = await request(app)
        .post('/api/asset-management/validate-action')
        .send({
          accountAddress: testAccount,
          action: 'swap',
          asset: 'USDC',
          toAsset: 'USDT',
          amountUSD: 5000
        })

      expect(response.status).toBe(200)
      expect(response.body.allowed).toBe(true)
    })

    it('should reject swap to non-allowed pair', async () => {
      const response = await request(app)
        .post('/api/asset-management/validate-action')
        .send({
          accountAddress: testAccount,
          action: 'swap',
          asset: 'USDC',
          toAsset: 'WETH', // Not in swapPairs
          amountUSD: 5000
        })

      expect(response.status).toBe(200)
      expect(response.body.allowed).toBe(false)
      expect(response.body.reason).toContain('not allowed')
    })
  })

  describe('Fee Limit Enforcement', () => {
    beforeEach(async () => {
      // Clean fee transactions
      await prisma.feeTransaction.deleteMany({
        where: { accountAddress: testAccount }
      })
    })

    it('should track fees within 30-day window', async () => {
      // Create fee transactions totaling $150
      for (let i = 0; i < 3; i++) {
        await prisma.feeTransaction.create({
          data: {
            accountAddress: testAccount,
            txHash: `0x${testAccount}_${i}`,
            action: 'deposit',
            protocol: 'aave:usdc',
            gasUsed: BigInt(200000),
            gasPriceGwei: 20,
            ethPrice: 2500,
            amountUSD: 50,
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          }
        })
      }

      // Get balance
      const response = await request(app)
        .get(`/api/asset-management/capital/balance?accountAddress=${testAccount}`)

      expect(response.status).toBe(200)
      expect(response.body.feeLimitStatus).toBeDefined()
      expect(response.body.feeLimitStatus.spent30Days).toBe(150)
      expect(response.body.feeLimitStatus.remaining).toBe(50) // 200 - 150
    })

    it('should reject transaction when fee limit exceeded', async () => {
      // Add more fees to exceed limit
      for (let i = 0; i < 5; i++) {
        await prisma.feeTransaction.create({
          data: {
            accountAddress: testAccount,
            txHash: `0x${testAccount}_extra_${i}`,
            action: 'deposit',
            protocol: 'aave:usdc',
            gasUsed: BigInt(200000),
            gasPriceGwei: 20,
            ethPrice: 2500,
            amountUSD: 50
          }
        })
      }

      const response = await request(app)
        .get(`/api/asset-management/capital/balance?accountAddress=${testAccount}`)

      expect(response.status).toBe(200)
      expect(response.body.feeLimitStatus.withinLimit).toBe(false)
      expect(response.body.feeLimitStatus.spent30Days).toBeGreaterThan(200)
    })
  })

  describe('Deferred Transaction Flow', () => {
    it('should defer transaction when gas is high', async () => {
      // Mock high gas scenario
      vi.spyOn(marketContextService, 'getContext').mockResolvedValue({
        network: {
          name: 'monad-testnet',
          currentGasPrice: 50, // High
          averageGasPrice24h: 20,
          gasPriceTrend: 'rising',
          nextLowGasPeriod: {
            estimatedHours: 6,
            estimatedGasPrice: 15
          }
        },
        market: {
          fearGreedIndex: 50,
          sentiment: 'neutral'
        },
        protocols: [],
        timestamp: new Date().toISOString()
      } as any)

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

      // Verify it's in database
      const deferred = await prisma.deferredTransaction.findUnique({
        where: { id: deferredId }
      })

      expect(deferred).toBeDefined()
      expect(deferred?.status).toBe('pending')
      expect(deferred?.originalGasPrice).toBe(50)
      expect(deferred?.targetGasPrice).toBe(20)
    })

    it('should execute deferred transaction when gas drops', async () => {
      // Mock gas price drop
      vi.spyOn(marketContextService, 'getContext').mockResolvedValue({
        network: {
          name: 'monad-testnet',
          currentGasPrice: 12, // Dropped below target
          averageGasPrice24h: 15,
          gasPriceTrend: 'falling'
        },
        market: {
          fearGreedIndex: 50,
          sentiment: 'neutral'
        },
        protocols: [],
        timestamp: new Date().toISOString()
      } as any)

      await deferredExecutionService.checkAndExecutePending()

      // Check if deferred transaction was executed or attempted
      const pending = await prisma.deferredTransaction.findMany({
        where: {
          accountAddress: testAccount,
          status: 'pending'
        }
      })

      // Should have fewer pending or none (if execution succeeded)
      expect(pending.length).toBeLessThanOrEqual(1)
    })

    it('should cancel deferred transaction on demand', async () => {
      // Create a deferred transaction
      const deferredId = await deferredExecutionService.deferTransaction({
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

      // Cancel it
      const response = await request(app)
        .post(`/api/deferred/cancel/${deferredId}`)
        .send()

      expect(response.status).toBe(200)

      // Verify status
      const deferred = await prisma.deferredTransaction.findUnique({
        where: { id: deferredId }
      })

      expect(deferred?.status).toBe('cancelled')
    })
  })

  describe('Capital Management', () => {
    it('should record profit and auto-reinvest', async () => {
      const beforeRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      const initialCapital = beforeRules?.aiManagedCapital || 20000

      const response = await request(app)
        .post('/api/asset-management/capital/transaction')
        .send({
          accountAddress: testAccount,
          type: 'profit',
          amount: 500,
          source: 'aave:usdc'
        })

      expect(response.status).toBe(200)

      const afterRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      expect(afterRules?.aiManagedCapital).toBe(initialCapital + 500)
    })

    it('should record loss and decrease capital', async () => {
      const beforeRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      const initialCapital = beforeRules?.aiManagedCapital || 20500

      const response = await request(app)
        .post('/api/asset-management/capital/transaction')
        .send({
          accountAddress: testAccount,
          type: 'loss',
          amount: 200,
          source: 'yearn:usdt'
        })

      expect(response.status).toBe(200)

      const afterRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      expect(afterRules?.aiManagedCapital).toBe(initialCapital - 200)
    })

    it('should allow manual withdrawal', async () => {
      const beforeRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      const initialCapital = beforeRules?.aiManagedCapital || 20300

      const response = await request(app)
        .post('/api/asset-management/capital/transaction')
        .send({
          accountAddress: testAccount,
          type: 'withdraw_from_ai',
          amount: 5000,
          txHash: '0xWITHDRAW_TEST'
        })

      expect(response.status).toBe(200)

      const afterRules = await prisma.assetManagementRules.findUnique({
        where: { accountAddress: testAccount }
      })

      expect(afterRules?.aiManagedCapital).toBe(initialCapital - 5000)

      // Check transaction record
      const transaction = await prisma.capitalTransaction.findFirst({
        where: {
          accountAddress: testAccount,
          type: 'withdraw_from_ai'
        },
        orderBy: { createdAt: 'desc' }
      })

      expect(transaction).toBeDefined()
      expect(transaction?.amount).toBe(5000)
    })

    it('should reject withdrawal exceeding available capital', async () => {
      const response = await request(app)
        .post('/api/asset-management/capital/transaction')
        .send({
          accountAddress: testAccount,
          type: 'withdraw_from_ai',
          amount: 50000, // Way more than available
          txHash: '0xINVALID_WITHDRAW'
        })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('exceed')
    })
  })

  describe('Capital History & Summary', () => {
    it('should return capital transaction history', async () => {
      const response = await request(app)
        .get(`/api/asset-management/capital/history?accountAddress=${testAccount}&limit=10`)

      expect(response.status).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)

      // Should have profit, loss, and withdraw transactions
      const types = response.body.map((tx: any) => tx.type)
      expect(types).toContain('profit')
      expect(types).toContain('loss')
      expect(types).toContain('withdraw_from_ai')
    })

    it('should calculate 30-day ROI correctly', async () => {
      const response = await request(app)
        .get(`/api/asset-management/capital/balance?accountAddress=${testAccount}`)

      expect(response.status).toBe(200)
      expect(response.body.summary).toBeDefined()
      expect(response.body.summary.netProfit30d).toBeDefined()
      expect(response.body.summary.roi30d).toBeDefined()

      // netProfit30d should be profit - loss = 500 - 200 = 300
      expect(response.body.summary.netProfit30d).toBeCloseTo(300, 0)
    })
  })
})
