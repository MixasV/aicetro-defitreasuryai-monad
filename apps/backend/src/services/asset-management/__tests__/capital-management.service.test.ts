import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { prisma } from '../../../db/prisma'
import { assetRulesService } from '../asset-rules.service'
import { capitalManagementService } from '../capital-management.service'

describe('CapitalManagementService', () => {
  const testAccount = '0xTEST_CAPITAL_' + Date.now()

  beforeEach(async () => {
    // Setup initial rules
    await assetRulesService.setRules({
      accountAddress: testAccount,
      aiManagedCapital: 20000,
      totalCapital: 100000,
      assets: []
    })
  })

  afterEach(async () => {
    // Cleanup
    await prisma.assetManagementRules.deleteMany({
      where: { accountAddress: testAccount }
    })
    await prisma.capitalTransaction.deleteMany({
      where: { accountAddress: testAccount }
    })
  })

  describe('Profit and Loss Tracking', () => {
    it('should record profit and auto-reinvest', async () => {
      await capitalManagementService.recordProfit({
        accountAddress: testAccount,
        amountUSD: 500,
        source: 'aave:usdc',
        txHash: '0xPROFIT1'
      })

      const rules = await assetRulesService.getRules(testAccount)
      expect(rules?.aiManagedCapital).toBe(20500) // 20000 + 500

      // Check transaction record
      const transactions = await capitalManagementService.getHistory(testAccount, 10)
      const profitTx = transactions.find(t => t.type === 'profit')

      expect(profitTx).toBeDefined()
      expect(profitTx?.amount).toBe(500)
      expect(profitTx?.balanceAfter).toBe(20500)
    })

    it('should record loss and decrease capital', async () => {
      await capitalManagementService.recordLoss({
        accountAddress: testAccount,
        amountUSD: 200,
        source: 'yearn:usdt',
        txHash: '0xLOSS1'
      })

      const rules = await assetRulesService.getRules(testAccount)
      expect(rules?.aiManagedCapital).toBe(19800) // 20000 - 200

      // Check transaction record
      const transactions = await capitalManagementService.getHistory(testAccount, 10)
      const lossTx = transactions.find(t => t.type === 'loss')

      expect(lossTx).toBeDefined()
      expect(lossTx?.amount).toBe(200)
      expect(lossTx?.balanceAfter).toBe(19800)
    })

    it('should not go below zero on loss', async () => {
      await capitalManagementService.recordLoss({
        accountAddress: testAccount,
        amountUSD: 25000, // More than available
        source: 'test',
        txHash: '0xBIGLOSS'
      })

      const rules = await assetRulesService.getRules(testAccount)
      expect(rules?.aiManagedCapital).toBe(0)
    })
  })

  describe('Manual Capital Adjustments', () => {
    it('should allow user to allocate more capital', async () => {
      await capitalManagementService.allocateCapital({
        accountAddress: testAccount,
        amountUSD: 5000,
        txHash: '0xALLOCATE1'
      })

      const rules = await assetRulesService.getRules(testAccount)
      expect(rules?.aiManagedCapital).toBe(25000) // 20000 + 5000

      const transactions = await capitalManagementService.getHistory(testAccount, 10)
      const allocateTx = transactions.find(t => t.type === 'allocate_to_ai')

      expect(allocateTx).toBeDefined()
      expect(allocateTx?.amount).toBe(5000)
    })

    it('should allow user to withdraw capital', async () => {
      await capitalManagementService.withdrawCapital({
        accountAddress: testAccount,
        amountUSD: 3000,
        txHash: '0xWITHDRAW1'
      })

      const rules = await assetRulesService.getRules(testAccount)
      expect(rules?.aiManagedCapital).toBe(17000) // 20000 - 3000

      const transactions = await capitalManagementService.getHistory(testAccount, 10)
      const withdrawTx = transactions.find(t => t.type === 'withdraw_from_ai')

      expect(withdrawTx).toBeDefined()
      expect(withdrawTx?.amount).toBe(3000)
    })

    it('should reject withdrawal exceeding available capital', async () => {
      await expect(
        capitalManagementService.withdrawCapital({
          accountAddress: testAccount,
          amountUSD: 50000, // More than available
          txHash: '0xINVALID'
        })
      ).rejects.toThrow('Cannot withdraw')
    })
  })

  describe('Capital Summary', () => {
    beforeEach(async () => {
      // Create some transactions
      await capitalManagementService.recordProfit({
        accountAddress: testAccount,
        amountUSD: 500,
        source: 'aave:usdc'
      })

      await capitalManagementService.recordLoss({
        accountAddress: testAccount,
        amountUSD: 200,
        source: 'yearn:usdc'
      })

      await capitalManagementService.withdrawCapital({
        accountAddress: testAccount,
        amountUSD: 1000,
        txHash: '0xWITHDRAW'
      })
    })

    it('should calculate 30-day summary correctly', async () => {
      const summary = await capitalManagementService.getSummary(testAccount)

      expect(summary).toBeDefined()
      expect(summary?.currentCapital).toBe(19300) // 20000 + 500 - 200 - 1000
      expect(summary?.netProfit30d).toBe(300) // 500 - 200
      expect(summary?.totalProfit).toBe(500)
      expect(summary?.totalLoss).toBe(200)
    })

    it('should return transaction history in correct order', async () => {
      const history = await capitalManagementService.getHistory(testAccount, 10)

      expect(history).toHaveLength(3)
      // Most recent first
      expect(history[0].type).toBe('withdraw_from_ai')
      expect(history[1].type).toBe('loss')
      expect(history[2].type).toBe('profit')
    })

    it('should calculate ROI correctly', async () => {
      const summary = await capitalManagementService.getSummary(testAccount)

      // ROI = netProfit / capital * 100 = 300 / 19300 * 100 ≈ 1.55%
      expect(summary?.roi30d).toBeCloseTo(1.55, 1)
    })
  })

  describe('Multiple Operations', () => {
    it('should handle multiple profits and losses correctly', async () => {
      // Series of operations
      await capitalManagementService.recordProfit({
        accountAddress: testAccount,
        amountUSD: 1000,
        source: 'aave'
      })

      await capitalManagementService.recordProfit({
        accountAddress: testAccount,
        amountUSD: 500,
        source: 'yearn'
      })

      await capitalManagementService.recordLoss({
        accountAddress: testAccount,
        amountUSD: 300,
        source: 'nabla'
      })

      await capitalManagementService.withdrawCapital({
        accountAddress: testAccount,
        amountUSD: 2000,
        txHash: '0xWD'
      })

      const rules = await assetRulesService.getRules(testAccount)
      // 20000 + 1000 + 500 - 300 - 2000 = 19200
      expect(rules?.aiManagedCapital).toBe(19200)

      const summary = await capitalManagementService.getSummary(testAccount)
      expect(summary?.netProfit30d).toBe(1200) // 1000 + 500 - 300
    })
  })
})
