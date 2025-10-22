import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '../../../db/prisma'
import { txCostService } from '../transaction-cost.service'

const testAccount = '0xTEST_TXCOST_' + Date.now()

// Mock Alchemy prices service
vi.mock('../../alchemy/alchemy-prices.service', () => ({
  alchemyPricesService: {
    getTokenPriceUSD: vi.fn().mockResolvedValue(2500)
  }
}))

describe('TransactionCostService', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.feeTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
  })

  afterEach(async () => {
    await prisma.feeTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
  })

  describe('Fee Limit Calculation', () => {
    it('should calculate monthly limit correctly', async () => {
      const result = await txCostService.checkFeeLimit(
        0, // Just checking current state
        100000, // Portfolio
        20000,  // AI capital
        testAccount
      )

      // MIN(100000 * 0.003, 20000 * 0.01) = MIN(300, 200) = 200
      expect(result.monthlyLimit).toBe(200)
      expect(result.spent30Days).toBe(0)
      expect(result.remaining).toBe(200)
      expect(result.withinLimit).toBe(true)
    })

    it('should use portfolio limit when it is smaller', async () => {
      const result = await txCostService.checkFeeLimit(
        0,
        50000,  // Portfolio * 0.003 = 150
        20000,  // AI capital * 0.01 = 200
        testAccount
      )

      // MIN(150, 200) = 150
      expect(result.monthlyLimit).toBe(150)
    })

    it('should use AI capital limit when it is smaller', async () => {
      const result = await txCostService.checkFeeLimit(
        0,
        200000, // Portfolio * 0.003 = 600
        10000,  // AI capital * 0.01 = 100
        testAccount
      )

      // MIN(600, 100) = 100
      expect(result.monthlyLimit).toBe(100)
    })
  })

  describe('Fee Tracking (30-day Rolling Window)', () => {
    it('should track fees within 30-day window', async () => {
      // Create fee transactions
      for (let i = 0; i < 3; i++) {
        await prisma.feeTransaction.create({
          data: {
            accountAddress: testAccount,
            txHash: `0xFEE_${i}`,
            action: 'deposit',
            protocol: 'aave:usdc',
            gasUsed: BigInt(200000),
            gasPriceGwei: 20,
            ethPrice: 2500,
            amountUSD: 50,
            createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Last 3 days
          }
        })
      }

      const result = await txCostService.checkFeeLimit(
        0,
        100000,
        20000,
        testAccount
      )

      expect(result.spent30Days).toBe(150) // 3 * 50
      expect(result.remaining).toBe(50)    // 200 - 150
      expect(result.percentUsed).toBe(75)  // 150/200 * 100
    })

    it('should not count fees older than 30 days', async () => {
      // Recent fee
      await prisma.feeTransaction.create({
        data: {
          accountAddress: testAccount,
          txHash: '0xRECENT',
          action: 'deposit',
          protocol: 'aave:usdc',
          gasUsed: BigInt(200000),
          gasPriceGwei: 20,
          ethPrice: 2500,
          amountUSD: 50,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
      })

      // Old fee (31 days ago)
      await prisma.feeTransaction.create({
        data: {
          accountAddress: testAccount,
          txHash: '0xOLD',
          action: 'deposit',
          protocol: 'aave:usdc',
          gasUsed: BigInt(200000),
          gasPriceGwei: 20,
          ethPrice: 2500,
          amountUSD: 100,
          createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) // 31 days ago
        }
      })

      const result = await txCostService.checkFeeLimit(
        0,
        100000,
        20000,
        testAccount
      )

      // Should only count the recent $50, not the old $100
      expect(result.spent30Days).toBe(50)
    })

    it('should detect when fee limit exceeded', async () => {
      // Add $250 in fees (exceeds $200 limit)
      for (let i = 0; i < 5; i++) {
        await prisma.feeTransaction.create({
          data: {
            accountAddress: testAccount,
            txHash: `0xEXCEED_${i}`,
            action: 'deposit',
            protocol: 'aave:usdc',
            gasUsed: BigInt(200000),
            gasPriceGwei: 20,
            ethPrice: 2500,
            amountUSD: 50
          }
        })
      }

      const result = await txCostService.checkFeeLimit(
        10, // Proposed new transaction
        100000,
        20000,
        testAccount
      )

      expect(result.spent30Days).toBe(250)
      expect(result.withinLimit).toBe(false)
      expect(result.percentUsed).toBeGreaterThan(100)
    })

    it('should check if proposed cost fits within limit', async () => {
      // Spent $150 so far
      for (let i = 0; i < 3; i++) {
        await prisma.feeTransaction.create({
          data: {
            accountAddress: testAccount,
            txHash: `0xPROPOSED_${i}`,
            action: 'deposit',
            protocol: 'aave:usdc',
            gasUsed: BigInt(200000),
            gasPriceGwei: 20,
            ethPrice: 2500,
            amountUSD: 50
          }
        })
      }

      // Try to spend $60 more (would exceed $200 limit)
      const result = await txCostService.checkFeeLimit(
        60,
        100000,
        20000,
        testAccount
      )

      expect(result.remaining).toBe(50)
      expect(result.withinLimit).toBe(false) // $150 + $60 > $200
    })
  })

  describe('Transaction Cost Analysis', () => {
    it('should calculate transaction cost in USD', async () => {
      const result = await txCostService.analyzeCost({
        action: 'deposit',
        protocol: 'aave:usdc',
        amountUSD: 10000,
        expectedAPY: 8,
        portfolioTotalUSD: 100000,
        aiManagedCapitalUSD: 20000,
        accountAddress: testAccount
      })

      expect(result.estimatedCostUSD).toBeGreaterThan(0)
      expect(result.estimatedGasUnits).toBeGreaterThan(0)
      expect(result.currentGasPriceGwei).toBeGreaterThan(0)
    })

    it('should calculate break-even period', async () => {
      const result = await txCostService.analyzeCost({
        action: 'deposit',
        protocol: 'aave:usdc',
        amountUSD: 10000,
        expectedAPY: 8, // 8% APY
        portfolioTotalUSD: 100000,
        aiManagedCapitalUSD: 20000,
        accountAddress: testAccount
      })

      // Daily yield = 10000 * 0.08 / 365 ≈ $2.19 per day
      expect(result.dailyYieldUSD).toBeGreaterThan(0)
      
      // Break-even = cost / dailyYield
      expect(result.daysToBreakEven).toBeGreaterThan(0)
      expect(result.daysToBreakEven).toBeLessThan(365) // Should be reasonable
    })

    it('should mark transaction as worth executing if ROI is good', async () => {
      const result = await txCostService.analyzeCost({
        action: 'deposit',
        protocol: 'aave:usdc',
        amountUSD: 10000,
        expectedAPY: 10, // Good APY
        portfolioTotalUSD: 100000,
        aiManagedCapitalUSD: 20000,
        accountAddress: testAccount
      })

      // Should be worth executing if:
      // - Within fee limit
      // - Cost < 2% of amount
      // - Break-even < 30 days
      expect(result.feeLimitStatus.withinLimit).toBe(true)
      expect(result.worthExecuting).toBeDefined()
    })
  })

  describe('Gas Estimation', () => {
    it('should estimate gas for Aave deposit', () => {
      const gasUnits = txCostService['estimateGasUnits']('deposit', 'aave')
      
      expect(gasUnits).toBeGreaterThan(100000)
      expect(gasUnits).toBeLessThan(300000)
    })

    it('should estimate gas for Yearn deposit', () => {
      const gasUnits = txCostService['estimateGasUnits']('deposit', 'yearn')
      
      expect(gasUnits).toBeGreaterThan(150000)
      expect(gasUnits).toBeLessThan(350000)
    })

    it('should estimate gas for swap', () => {
      const gasUnits = txCostService['estimateGasUnits']('swap', 'uniswap')
      
      expect(gasUnits).toBeGreaterThan(100000)
      expect(gasUnits).toBeLessThan(250000)
    })

    it('should use default estimate for unknown protocol', () => {
      const gasUnits = txCostService['estimateGasUnits']('deposit', 'unknown')
      
      expect(gasUnits).toBe(200000) // Default
    })
  })

  describe('Fee Recording', () => {
    it('should record fee transaction after execution', async () => {
      await txCostService.recordFeeTransaction({
        accountAddress: testAccount,
        txHash: '0xRECORD1',
        action: 'deposit',
        protocol: 'aave:usdc',
        gasUsed: BigInt(200000),
        gasPriceGwei: 20,
        ethPrice: 2500
      })

      const fees = await prisma.feeTransaction.findMany({
        where: { accountAddress: testAccount }
      })

      expect(fees).toHaveLength(1)
      expect(fees[0].txHash).toBe('0xRECORD1')
      expect(fees[0].amountUSD).toBeGreaterThan(0)
    })
  })
})
