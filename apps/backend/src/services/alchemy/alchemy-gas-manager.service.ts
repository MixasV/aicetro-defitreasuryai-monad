/**
 * Alchemy Gas Manager Service for Monad Testnet
 * 
 * Provides ERC-4337 Bundler + Gas Manager (sponsorship) integration
 * with spending rules, allowlist/blocklist, and per-user limits
 */

import { env } from '../../config/env'

interface GasSponsorshipRequest {
  userOperation: any
  entryPoint: string
}

interface GasSponsorshipResponse {
  paymasterAndData: string
  preVerificationGas: string
  verificationGasLimit: string
  callGasLimit: string
}

interface GasEstimate {
  preVerificationGas: bigint
  verificationGasLimit: bigint
  callGasLimit: bigint
}

interface PolicyStats {
  totalSpentUsd: number
  remainingUsd: number
  isActive: boolean
  maxSpendPerPolicyUsd: number
}

export class AlchemyGasManagerService {
  private apiKey: string
  private policyId: string
  private accessToken: string
  private bundlerUrl: string
  private adminApiUrl: string

  constructor() {
    this.apiKey = env.alchemyApiKey
    this.policyId = env.alchemyGasPolicyId
    this.accessToken = env.alchemyAccessToken
    
    // Monad testnet bundler endpoint
    this.bundlerUrl = env.bundlerUrl || 
      `https://monad-testnet.g.alchemy.com/v2/${this.apiKey}`
    
    // Admin API for policy management
    this.adminApiUrl = 'https://api.g.alchemy.com/v1'
    
    console.log('[AlchemyGasManager] Initialized for Monad testnet')
    console.log('[AlchemyGasManager] Policy ID:', this.policyId)
  }

  /**
   * Request gas sponsorship for UserOperation
   * 
   * Alchemy evaluates the UserOp against Gas Policy rules:
   * - maxSpendPerUoUsd
   * - maxSpendPerSender
   * - senderAllowlist/Blocklist
   * 
   * Returns paymaster data if approved
   */
  async requestGasSponsorship(
    userOp: any,
    entryPoint: string = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  ): Promise<GasSponsorshipResponse> {
    try {
      // ✅ CRITICAL: Extract signature and pass as dummySignature separately
      const dummySignature = userOp.signature || ('0x' + 'ff'.repeat(65))
      const userOpWithoutSig = { ...userOp }
      delete userOpWithoutSig.signature
      
      const response = await fetch(this.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_requestGasAndPaymasterAndData',
          params: [
            {
              policyId: this.policyId,
              entryPoint,
              dummySignature,  // ✅ Separate parameter!
              userOperation: userOpWithoutSig,
            },
          ],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('[AlchemyGasManager] ===== SPONSORSHIP ERROR DEBUG =====')
        console.error('[AlchemyGasManager] Error:', data.error)
        console.error('[AlchemyGasManager] UserOp sender:', userOpWithoutSig.sender)
        console.error('[AlchemyGasManager] UserOp initCode:', userOpWithoutSig.initCode?.slice(0, 66))
        console.error('[AlchemyGasManager] UserOp nonce:', userOpWithoutSig.nonce)
        console.error('[AlchemyGasManager] UserOp callData length:', userOpWithoutSig.callData?.length)
        console.error('[AlchemyGasManager] ===========================================')
        throw new Error(`Gas sponsorship denied: ${data.error.message}`)
      }

      console.log('[AlchemyGasManager] Sponsorship approved for sender:', userOp.sender)
      return data.result
    } catch (error) {
      console.error('[AlchemyGasManager] Sponsorship error:', error)
      throw error
    }
  }

  /**
   * Send UserOperation via Alchemy Bundler
   * 
   * Bundler validates, simulates, and submits to Monad network
   */
  async sendUserOperation(
    userOp: any,
    entryPoint: string = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  ): Promise<string> {
    try {
      const response = await fetch(this.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_sendUserOperation',
          params: [userOp, entryPoint],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        console.error('[AlchemyGasManager] Send error:', data.error)
        throw new Error(`Failed to send UserOperation: ${data.error.message}`)
      }

      const userOpHash = data.result
      console.log('[AlchemyGasManager] UserOperation sent:', userOpHash)
      
      return userOpHash
    } catch (error) {
      console.error('[AlchemyGasManager] Send error:', error)
      throw error
    }
  }

  /**
   * Get UserOperation receipt (wait for inclusion)
   */
  async getUserOperationReceipt(userOpHash: string): Promise<any> {
    try {
      const response = await fetch(this.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getUserOperationReceipt',
          params: [userOpHash],
          id: 1,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Receipt error: ${data.error.message}`)
      }
      
      return data.result
    } catch (error) {
      console.error('[AlchemyGasManager] Receipt error:', error)
      throw error
    }
  }

  /**
   * Estimate gas for UserOperation
   */
  async estimateUserOperationGas(
    userOp: any,
    entryPoint: string = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  ): Promise<GasEstimate> {
    try {
      const response = await fetch(this.bundlerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateUserOperationGas',
          params: [userOp, entryPoint],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(`Gas estimation error: ${data.error.message}`)
      }

      return {
        preVerificationGas: BigInt(data.result.preVerificationGas),
        verificationGasLimit: BigInt(data.result.verificationGasLimit),
        callGasLimit: BigInt(data.result.callGasLimit),
      }
    } catch (error) {
      console.error('[AlchemyGasManager] Gas estimation error:', error)
      throw error
    }
  }

  /**
   * Get policy statistics (spending, limits, status)
   * 
   * Requires ALCHEMY_ACCESS_TOKEN for Admin API
   */
  async getPolicyStats(): Promise<PolicyStats> {
    if (!this.accessToken) {
      throw new Error('ALCHEMY_ACCESS_TOKEN required for Admin API')
    }

    try {
      const response = await fetch(
        `${this.adminApiUrl}/policies/${this.policyId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Admin API error: ${response.statusText}`)
      }

      const data = await response.json()
      const policyData = data.data || data
      
      const totalSpent = policyData.totalSpentUsd || 0
      const maxSpend = policyData.maxSpendPerPolicyUsd || 0
      
      return {
        totalSpentUsd: totalSpent,
        remainingUsd: maxSpend - totalSpent,
        isActive: policyData.status === 'active',
        maxSpendPerPolicyUsd: maxSpend,
      }
    } catch (error) {
      console.error('[AlchemyGasManager] Policy stats error:', error)
      throw error
    }
  }

  /**
   * Add Smart Account to allowlist
   * 
   * Only allowlisted addresses can receive gas sponsorship
   * Good for verified users, preventing Sybil attacks
   */
  async addToAllowlist(smartAccountAddress: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('ALCHEMY_ACCESS_TOKEN required for Admin API')
    }

    try {
      const response = await fetch(
        `${this.adminApiUrl}/policies/${this.policyId}/allowlist`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addresses: [smartAccountAddress],
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Allowlist error: ${errorData.message || response.statusText}`)
      }

      console.log(`[AlchemyGasManager] ✅ Added to allowlist: ${smartAccountAddress}`)
    } catch (error) {
      console.error('[AlchemyGasManager] Allowlist error:', error)
      throw error
    }
  }

  /**
   * Remove from allowlist
   */
  async removeFromAllowlist(smartAccountAddress: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('ALCHEMY_ACCESS_TOKEN required for Admin API')
    }

    try {
      const response = await fetch(
        `${this.adminApiUrl}/policies/${this.policyId}/allowlist/${smartAccountAddress}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Remove error: ${response.statusText}`)
      }

      console.log(`[AlchemyGasManager] ❌ Removed from allowlist: ${smartAccountAddress}`)
    } catch (error) {
      console.error('[AlchemyGasManager] Remove error:', error)
      throw error
    }
  }

  /**
   * Check if address is in allowlist
   */
  async isInAllowlist(smartAccountAddress: string): Promise<boolean> {
    if (!this.accessToken) {
      return false // Can't check without access token
    }

    try {
      const response = await fetch(
        `${this.adminApiUrl}/policies/${this.policyId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      const policyData = data.data || data
      const allowlist = policyData.senderAllowlist || []
      
      return allowlist.includes(smartAccountAddress.toLowerCase())
    } catch (error) {
      console.error('[AlchemyGasManager] Allowlist check error:', error)
      return false
    }
  }

  /**
   * Wait for UserOperation receipt with timeout
   */
  async waitForReceipt(
    userOpHash: string,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const receipt = await this.getUserOperationReceipt(userOpHash)
        
        if (receipt) {
          console.log('[AlchemyGasManager] ✅ Receipt received:', receipt.transactionHash)
          return receipt
        }
      } catch (error) {
        // Receipt not found yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
    
    throw new Error(`Receipt timeout for UserOp: ${userOpHash}`)
  }

  /**
   * Monitor policy spending (call periodically)
   */
  async monitorSpending(): Promise<void> {
    try {
      const stats = await this.getPolicyStats()
      
      console.log('[AlchemyGasManager] 📊 Policy Stats:')
      console.log(`  Total spent: $${stats.totalSpentUsd.toFixed(2)}`)
      console.log(`  Remaining: $${stats.remainingUsd.toFixed(2)}`)
      console.log(`  Status: ${stats.isActive ? 'ACTIVE' : 'INACTIVE'}`)
      
      // Alert if low balance
      const percentRemaining = (stats.remainingUsd / stats.maxSpendPerPolicyUsd) * 100
      
      if (percentRemaining < 10) {
        console.warn(`⚠️ [AlchemyGasManager] LOW BUDGET: ${percentRemaining.toFixed(1)}% remaining!`)
      }
    } catch (error) {
      console.error('[AlchemyGasManager] Monitor error:', error)
    }
  }
}

export const alchemyGasManager = new AlchemyGasManagerService()
