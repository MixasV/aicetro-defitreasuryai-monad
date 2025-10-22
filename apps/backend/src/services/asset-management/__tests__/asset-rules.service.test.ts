import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { prisma } from '../../../db/prisma'
import { assetRulesService } from '../asset-rules.service'

describe('AssetRulesService', () => {
  const testAccount = '0xTEST_ASSET_RULES_' + Date.now()

  afterEach(async () => {
    // Cleanup
    await prisma.assetManagementRules.deleteMany({
      where: { accountAddress: testAccount }
    })
  })

  describe('Create and Validate Rules', () => {
    it('should create asset rules with correct fee limits', async () => {
      const rules = await assetRulesService.setRules({
        accountAddress: testAccount,
        aiManagedCapital: 20000,
        totalCapital: 100000,
        assets: [
          {
            token: '0xUSDC',
            symbol: 'USDC',
            maxAllocationPercent: 80,
            currentAllocation: 0,
            allowedChains: ['monad'],
            canSwap: false,
            canBridge: false
          }
        ]
      })

      // Fee limit = MIN(100000 * 0.003, 20000 * 0.01) = MIN(300, 200) = 200
      expect(rules.maxFeesMonthly).toBe(200)
      expect(rules.aiManagedCapital).toBe(20000)
      expect(rules.assets).toHaveLength(1)
    })

    it('should reject AI capital exceeding total capital', async () => {
      await expect(
        assetRulesService.setRules({
          accountAddress: testAccount + '_invalid',
          aiManagedCapital: 150000,
          totalCapital: 100000,
          assets: []
        })
      ).rejects.toThrow('cannot exceed total capital')
    })

    it('should reject total allocation > 100%', async () => {
      await expect(
        assetRulesService.setRules({
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
      ).rejects.toThrow('exceed 100%')
    })
  })

  describe('Action Validation', () => {
    beforeEach(async () => {
      // Setup rules
      await assetRulesService.setRules({
        accountAddress: testAccount,
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
          }
        ]
      })
    })

    it('should validate deposit within allocation limits', async () => {
      // Try to deposit $3k (would exceed $10k limit)
      const result = await assetRulesService.validateAction({
        accountAddress: testAccount,
        action: 'deposit',
        asset: 'USDC',
        amountUSD: 3000
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('exceed')
    })

    it('should allow deposit within limits', async () => {
      const result = await assetRulesService.validateAction({
        accountAddress: testAccount,
        action: 'deposit',
        asset: 'USDC',
        amountUSD: 1000 // Would be $9k total, under $10k limit
      })

      expect(result.allowed).toBe(true)
    })

    it('should allow swap when permitted', async () => {
      const result = await assetRulesService.validateAction({
        accountAddress: testAccount,
        action: 'swap',
        asset: 'USDT',
        toAsset: 'USDC',
        amountUSD: 5000
      })

      expect(result.allowed).toBe(true)
    })

    it('should reject swap to non-allowed pair', async () => {
      const result = await assetRulesService.validateAction({
        accountAddress: testAccount,
        action: 'swap',
        asset: 'USDT',
        toAsset: 'DAI', // Not in swapPairs
        amountUSD: 5000
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('not allowed')
    })

    it('should reject swap when not permitted', async () => {
      const result = await assetRulesService.validateAction({
        accountAddress: testAccount,
        action: 'swap',
        asset: 'USDC', // canSwap = false
        toAsset: 'USDT',
        amountUSD: 1000
      })

      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('not allowed')
    })
  })

  describe('Allocation Updates', () => {
    beforeEach(async () => {
      await assetRulesService.setRules({
        accountAddress: testAccount,
        aiManagedCapital: 20000,
        totalCapital: 100000,
        assets: [
          {
            token: '0xUSDC',
            symbol: 'USDC',
            maxAllocationPercent: 50,
            currentAllocation: 5000,
            allowedChains: ['monad'],
            canSwap: false,
            canBridge: false
          }
        ]
      })
    })

    it('should increase allocation', async () => {
      await assetRulesService.updateAllocation({
        accountAddress: testAccount,
        asset: 'USDC',
        deltaUSD: 2000
      })

      const rules = await assetRulesService.getRules(testAccount)
      const usdcAsset = rules?.assets.find(a => a.symbol === 'USDC')

      expect(usdcAsset?.currentAllocation).toBe(7000)
    })

    it('should decrease allocation', async () => {
      await assetRulesService.updateAllocation({
        accountAddress: testAccount,
        asset: 'USDC',
        deltaUSD: -2000
      })

      const rules = await assetRulesService.getRules(testAccount)
      const usdcAsset = rules?.assets.find(a => a.symbol === 'USDC')

      expect(usdcAsset?.currentAllocation).toBe(3000)
    })

    it('should not go below zero', async () => {
      await assetRulesService.updateAllocation({
        accountAddress: testAccount,
        asset: 'USDC',
        deltaUSD: -10000 // More than current
      })

      const rules = await assetRulesService.getRules(testAccount)
      const usdcAsset = rules?.assets.find(a => a.symbol === 'USDC')

      expect(usdcAsset?.currentAllocation).toBe(0)
    })
  })
})
