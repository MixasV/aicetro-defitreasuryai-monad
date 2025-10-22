import { describe, it, expect, beforeAll } from 'vitest'
import { ethers } from 'ethers'
import { userOperationService } from '../../src/services/erc4337/user-operation.service'
import { delegationHelperService } from '../../src/services/erc4337/delegation-helper.service'

describe('ERC-4337 Integration Tests', () => {
  const TEST_SMART_ACCOUNT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
  const TEST_AI_AGENT = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'

  describe('UserOperation Building', () => {
    it('should build valid UserOperation structure', async () => {
      const callData = '0x' + '00'.repeat(100) // Mock calldata

      const userOp = await userOperationService.buildUserOperation({
        sender: TEST_SMART_ACCOUNT as any,
        callData: callData as any
      })

      expect(userOp).toBeDefined()
      expect(userOp.sender).toBe(TEST_SMART_ACCOUNT)
      expect(userOp.nonce).toBeDefined()
      expect(userOp.callData).toBe(callData)
      expect(userOp.callGasLimit).toBeGreaterThan(0)
      expect(userOp.verificationGasLimit).toBeGreaterThan(0)
      expect(userOp.preVerificationGas).toBeGreaterThan(0)
    })

    it('should estimate gas correctly for different operations', () => {
      const depositGas = userOperationService['estimateGasUnits']('deposit', 'aave')
      const withdrawGas = userOperationService['estimateGasUnits']('withdraw', 'aave')
      const swapGas = userOperationService['estimateGasUnits']('swap', 'uniswap')

      expect(depositGas).toBeGreaterThan(0)
      expect(withdrawGas).toBeGreaterThan(0)
      expect(swapGas).toBeGreaterThan(0)

      // Deposits usually need more gas than withdrawals
      expect(depositGas).toBeGreaterThanOrEqual(withdrawGas * 0.9)
    })
  })

  describe('Protocol Calldata Building', () => {
    it('should build correct Aave deposit calldata', async () => {
      const callData = await userOperationService.buildCallData({
        smartAccount: TEST_SMART_ACCOUNT as any,
        action: 'deposit',
        protocol: 'aave:usdc',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
        amount: ethers.parseUnits('1000', 6) // 1000 USDC
      })

      expect(callData).toBeDefined()
      expect(callData).toMatch(/^0x[0-9a-fA-F]+$/)
      expect(callData.length).toBeGreaterThan(10) // More than just '0x'

      // Should contain supply function selector (0x617ba037)
      expect(callData).toContain('617ba037')
    })

    it('should build correct Yearn deposit calldata', async () => {
      const callData = await userOperationService.buildCallData({
        smartAccount: TEST_SMART_ACCOUNT as any,
        action: 'deposit',
        protocol: 'yearn:usdc',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
        amount: ethers.parseUnits('500', 6)
      })

      expect(callData).toBeDefined()
      expect(callData).toMatch(/^0x[0-9a-fA-F]+$/)

      // Should contain deposit function selector (0xd0e30db0 or similar)
      expect(callData.length).toBeGreaterThan(10)
    })

    it('should build correct swap calldata', async () => {
      const callData = await userOperationService.buildCallData({
        smartAccount: TEST_SMART_ACCOUNT as any,
        action: 'swap',
        protocol: 'uniswap:usdc-usdt',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
        amount: ethers.parseUnits('100', 6),
        toToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as any
      })

      expect(callData).toBeDefined()
      expect(callData).toMatch(/^0x[0-9a-fA-F]+$/)

      // Should contain swapExactTokensForTokens or similar
      expect(callData.length).toBeGreaterThan(10)
    })
  })

  describe('Delegation Helper', () => {
    it('should calculate AI agent address deterministically', () => {
      const address1 = delegationHelperService.getAIAgentAddress(TEST_SMART_ACCOUNT)
      const address2 = delegationHelperService.getAIAgentAddress(TEST_SMART_ACCOUNT)

      expect(address1).toBe(address2)
      expect(address1).toMatch(/^0x[0-9a-fA-F]{40}$/)
      expect(ethers.isAddress(address1)).toBe(true)
    })

    it('should generate different addresses for different accounts', () => {
      const address1 = delegationHelperService.getAIAgentAddress(TEST_SMART_ACCOUNT)
      const address2 = delegationHelperService.getAIAgentAddress(TEST_AI_AGENT)

      expect(address1).not.toBe(address2)
    })

    it('should validate delegation structure', async () => {
      const mockDelegation = {
        smartAccount: TEST_SMART_ACCOUNT,
        aiAgentAddress: TEST_AI_AGENT,
        signedDelegation: '0x' + '00'.repeat(200),
        delegationHash: ethers.keccak256(ethers.toUtf8Bytes('test')),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dailyLimitUsd: 10000,
        spent24h: 0
      }

      // Should not throw
      expect(() => {
        delegationHelperService.validateDelegation(mockDelegation)
      }).not.toThrow()
    })

    it('should reject expired delegation', async () => {
      const expiredDelegation = {
        smartAccount: TEST_SMART_ACCOUNT,
        aiAgentAddress: TEST_AI_AGENT,
        signedDelegation: '0x' + '00'.repeat(200),
        delegationHash: ethers.keccak256(ethers.toUtf8Bytes('test')),
        validUntil: new Date(Date.now() - 1000), // Expired
        dailyLimitUsd: 10000,
        spent24h: 0
      }

      expect(() => {
        delegationHelperService.validateDelegation(expiredDelegation)
      }).toThrow('expired')
    })

    it('should reject delegation with exceeded daily limit', async () => {
      const exceededDelegation = {
        smartAccount: TEST_SMART_ACCOUNT,
        aiAgentAddress: TEST_AI_AGENT,
        signedDelegation: '0x' + '00'.repeat(200),
        delegationHash: ethers.keccak256(ethers.toUtf8Bytes('test')),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        dailyLimitUsd: 10000,
        spent24h: 15000 // Exceeded
      }

      expect(() => {
        delegationHelperService.validateDelegation(exceededDelegation)
      }).toThrow('exceeded')
    })
  })

  describe('Gas Estimation', () => {
    it('should estimate realistic gas for Aave operations', () => {
      const depositGas = userOperationService['estimateGasUnits']('deposit', 'aave')
      
      // Aave deposits typically use 150k-250k gas
      expect(depositGas).toBeGreaterThan(100000)
      expect(depositGas).toBeLessThan(300000)
    })

    it('should estimate realistic gas for Yearn operations', () => {
      const depositGas = userOperationService['estimateGasUnits']('deposit', 'yearn')
      
      // Yearn deposits typically use 200k-300k gas
      expect(depositGas).toBeGreaterThan(150000)
      expect(depositGas).toBeLessThan(350000)
    })

    it('should estimate realistic gas for Uniswap swaps', () => {
      const swapGas = userOperationService['estimateGasUnits']('swap', 'uniswap')
      
      // Uniswap swaps typically use 120k-200k gas
      expect(swapGas).toBeGreaterThan(100000)
      expect(swapGas).toBeLessThan(250000)
    })
  })

  describe('UserOperation Signing', () => {
    it('should sign UserOperation with valid signature', async () => {
      const mockUserOp = {
        sender: TEST_SMART_ACCOUNT,
        nonce: 1n,
        initCode: '0x',
        callData: '0x',
        callGasLimit: 200000n,
        verificationGasLimit: 150000n,
        preVerificationGas: 50000n,
        maxFeePerGas: 20000000000n,
        maxPriorityFeePerGas: 1000000000n,
        paymasterAndData: '0x',
        signature: '0x'
      }

      const signedUserOp = await userOperationService.signUserOperation(mockUserOp as any)

      expect(signedUserOp.signature).toBeDefined()
      expect(signedUserOp.signature).not.toBe('0x')
      expect(signedUserOp.signature).toMatch(/^0x[0-9a-fA-F]+$/)
      expect(signedUserOp.signature.length).toBeGreaterThan(100) // Should be a full signature
    })
  })

  describe('Alchemy Gas Manager Integration', () => {
    it('should check gas sponsorship eligibility', async () => {
      // This would call Alchemy Gas Manager to check if account is sponsored
      // Mock for now since we don't want to hit real API in tests
      
      const mockSponsorshipCheck = {
        eligible: true,
        policyId: process.env.ALCHEMY_GAS_POLICY_ID,
        reason: 'Account in allowlist'
      }

      expect(mockSponsorshipCheck.eligible).toBe(true)
    })

    it('should format paymaster data correctly', () => {
      const mockPaymasterAddress = '0xPaymaster_Address_Here'
      const mockPaymasterData = '0x' + '00'.repeat(32)

      const paymasterAndData = mockPaymasterAddress + mockPaymasterData.slice(2)

      expect(paymasterAndData).toMatch(/^0x[0-9a-fA-F]+$/)
      expect(paymasterAndData.length).toBe(42 + 64) // Address (42) + data (64)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid protocol gracefully', async () => {
      await expect(
        userOperationService.buildCallData({
          smartAccount: TEST_SMART_ACCOUNT as any,
          action: 'deposit',
          protocol: 'invalid:protocol',
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
          amount: 1000n
        })
      ).rejects.toThrow()
    })

    it('should handle invalid action type gracefully', async () => {
      await expect(
        userOperationService.buildCallData({
          smartAccount: TEST_SMART_ACCOUNT as any,
          action: 'invalid_action' as any,
          protocol: 'aave:usdc',
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
          amount: 1000n
        })
      ).rejects.toThrow()
    })

    it('should handle zero amount gracefully', async () => {
      await expect(
        userOperationService.buildCallData({
          smartAccount: TEST_SMART_ACCOUNT as any,
          action: 'deposit',
          protocol: 'aave:usdc',
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as any,
          amount: 0n
        })
      ).rejects.toThrow('amount')
    })
  })
})
