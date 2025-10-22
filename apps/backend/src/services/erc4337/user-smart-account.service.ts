/**
 * User Smart Account Service
 * 
 * Creates and manages INDIVIDUAL MetaMask Smart Accounts for EACH user.
 * Each user gets their own SA for delegation to AI Agent.
 * 
 * Architecture (CORRECT for hackathon):
 * - User creates THEIR OWN Smart Account
 * - User SA deployed on Monad Testnet
 * - Delegation: User SA → AI Agent (delegate)
 * - UserOp sender = User SA (NOT AI Agent SA!)
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit'

interface UserSAConfig {
  userAddress: Address // User's EOA address
  smartAccountAddress: Address // User's SA address
  isDeployed: boolean
  initCode?: Hex
}

class UserSmartAccountService {
  private publicClient: any
  private walletClient: any
  private deployerAccount: any

  // Cache: userEOA → Smart Account config
  private cache: Map<Address, UserSAConfig> = new Map()

  constructor() {
    // Setup clients
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    // Deployer account for gas sponsorship
    if (env.deployerPrivateKey) {
      this.deployerAccount = privateKeyToAccount(env.deployerPrivateKey as Hex)
      this.walletClient = createWalletClient({
        account: this.deployerAccount,
        chain: monadTestnet,
        transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      })
      console.log('[UserSA Service] Deployer address:', this.deployerAccount.address)
    } else {
      console.warn('[UserSA Service] DEPLOYER_PRIVATE_KEY not set - deployment disabled')
    }
  }

  /**
   * Generate deterministic salt for user
   * 
   * CRITICAL: Always returns SAME salt for same user!
   * This ensures ONE User SA per user (not multiple SAs with different salts)
   * 
   * @param userEOA User's EOA address
   * @returns Deterministic salt (32 bytes)
   */
  private generateDeterministicSalt(userEOA: Address): Hex {
    const { keccak256, toHex } = require('viem')
    // Create deterministic salt: keccak256(userEOA + "aicetro-user-sa")
    const data = `${userEOA.toLowerCase()}aicetro-user-sa`
    return keccak256(toHex(data))
  }

  /**
   * Create User Smart Account (counterfactual)
   * 
   * Creates MetaMask Smart Account for user with their EOA as owner.
   * Does NOT deploy on-chain yet (counterfactual).
   * 
   * IMPORTANT: ALWAYS uses deterministic salt for each user!
   * This ensures one SA per user (not multiple with different salts)
   * 
   * @param userEOA User's externally owned account address
   * @param deploySalt IGNORED! We use deterministic salt
   * @returns Smart Account config with address
   */
  async createUserSmartAccount(
    userEOA: Address,
    deploySalt?: string
  ): Promise<UserSAConfig> {
    console.log('[UserSA] Creating Smart Account for user:', userEOA)
    
    // ✅ IGNORE frontend salt! Use deterministic salt instead
    if (deploySalt) {
      console.log('[UserSA] ⚠️ Ignoring frontend salt:', deploySalt)
      console.log('[UserSA] Using deterministic salt for consistency')
    }

    // ✅ Cache key = userEOA ONLY (no salt!)
    const cacheKey = userEOA.toLowerCase() as Address

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      console.log('[UserSA] Using cached SA:', cached.smartAccountAddress)
      return cached
    }

    // ✅ Generate deterministic salt (ALWAYS same for this user!)
    const finalSalt = this.generateDeterministicSalt(userEOA)
    console.log('[UserSA] Deterministic salt:', finalSalt)

    // Create MetaMask Smart Account (Hybrid implementation)
    // Owner = user's EOA, no additional signers
    const smartAccount = await toMetaMaskSmartAccount({
      client: this.publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [userEOA, [], [], []], // owner, P256 signers, thresholds, delays
      deploySalt: finalSalt, // ✅ Use salt from frontend!
      signer: { 
        account: this.deployerAccount // Deployer signs for deployment
      }
    })

    const smartAccountAddress = smartAccount.address

    console.log('[UserSA] User EOA:', userEOA)
    console.log('[UserSA] Smart Account:', smartAccountAddress)

    // Check if already deployed
    const code = await this.publicClient.getBytecode({ address: smartAccountAddress })
    const isDeployed = !!(code && code !== '0x')

    console.log('[UserSA] Deployed:', isDeployed)

    // Get initCode for deployment (if not deployed)
    let initCode: Hex | undefined
    if (!isDeployed) {
      const factoryArgs = await smartAccount.getFactoryArgs()
      if (factoryArgs && factoryArgs.factoryData) {
        initCode = (factoryArgs.factory + factoryArgs.factoryData.slice(2)) as Hex
        console.log('[UserSA] initCode ready, length:', initCode.length)
      }
    }

    const config: UserSAConfig = {
      userAddress: userEOA,
      smartAccountAddress,
      isDeployed,
      initCode: isDeployed ? undefined : initCode
    }

    // Cache it (with salt in key)
    this.cache.set(cacheKey, config)

    return config
  }

  /**
   * Deploy User Smart Account via UserOp
   * 
   * Deploys SA by sending a UserOp with initCode.
   * This should be done BEFORE creating delegation.
   * 
   * @param userEOA User's EOA address
   * @returns Deployment result
   */
  async deployUserSmartAccount(
    userEOA: Address
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    console.log('[UserSA] Deploying Smart Account for:', userEOA)

    const config = await this.createUserSmartAccount(userEOA)

    if (config.isDeployed) {
      console.log('[UserSA] Already deployed, skipping')
      return { success: true }
    }

    if (!this.walletClient) {
      return {
        success: false,
        error: 'DEPLOYER_PRIVATE_KEY not configured'
      }
    }

    if (!config.initCode) {
      return {
        success: false,
        error: 'initCode not available'
      }
    }

    try {
      // Check deployer balance
      const balance = await this.publicClient.getBalance({ 
        address: this.deployerAccount.address 
      })
      
      console.log('[UserSA] Deployer balance:', balance.toString())

      if (balance === 0n) {
        return {
          success: false,
          error: 'Deployer has 0 balance. Get MON from faucet: https://discord.gg/monad'
        }
      }

      // Deploy Smart Account using initCode
      // initCode = factory address + factory calldata
      // Format: 0x<factory><createAccount calldata>
      
      console.log('[UserSA] Parsing initCode...')
      const factoryAddress = ('0x' + config.initCode.slice(2, 42)) as Address
      const factoryCalldata = ('0x' + config.initCode.slice(42)) as Hex
      
      console.log('[UserSA] Factory:', factoryAddress)
      console.log('[UserSA] Calldata length:', factoryCalldata.length)

      // Call factory contract to deploy SA
      const hash = await this.walletClient.sendTransaction({
        to: factoryAddress,
        data: factoryCalldata,
        value: 0n,
        gas: 3000000n // High gas limit for contract creation
      })

      console.log('[UserSA] Deployment TX:', hash)
      console.log('[UserSA] Waiting for confirmation...')

      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000
      })

      if (receipt.status === 'success') {
        console.log('[UserSA] ✅ Transaction confirmed!')
        console.log('[UserSA] Block:', receipt.blockNumber)
        console.log('[UserSA] Gas used:', receipt.gasUsed.toString())

        // Verify deployment - check if SA has code
        const code = await this.publicClient.getBytecode({ 
          address: config.smartAccountAddress 
        })
        const actuallyDeployed = !!(code && code !== '0x')

        console.log('[UserSA] Verification - SA has code:', actuallyDeployed)
        console.log('[UserSA] Code length:', code?.length || 0)

        if (!actuallyDeployed) {
          console.error('[UserSA] ⚠️ Transaction succeeded but no code at SA address!')
          console.error('[UserSA] Expected address:', config.smartAccountAddress)
          console.error('[UserSA] Factory:', factoryAddress)
          return {
            success: false,
            error: 'Deployment transaction succeeded but Smart Account has no code',
            txHash: hash
          }
        }

        // ✅ Update cache (with correct key - userEOA only, no salt!)
        config.isDeployed = true
        config.initCode = undefined
        const cacheKey = userEOA.toLowerCase() as Address
        this.cache.set(cacheKey, config)

        console.log('[UserSA] ✅ Smart Account deployed successfully!')
        return { success: true, txHash: hash }
      } else {
        console.error('[UserSA] ❌ Deployment failed!')
        return { 
          success: false, 
          error: 'Transaction reverted',
          txHash: hash 
        }
      }

    } catch (error: any) {
      console.error('[UserSA] Deployment error:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  /**
   * Get User Smart Account config
   * 
   * @param userEOA User's EOA address
   * @returns Smart Account config or null
   */
  async getUserSmartAccount(userEOA: Address): Promise<UserSAConfig | null> {
    try {
      return await this.createUserSmartAccount(userEOA)
    } catch (error: any) {
      console.error('[UserSA] Error getting SA:', error)
      return null
    }
  }

  /**
   * Check if User Smart Account is deployed
   * 
   * @param userEOA User's EOA address
   * @returns true if deployed
   */
  async isDeployed(userEOA: Address): Promise<boolean> {
    const config = await this.getUserSmartAccount(userEOA)
    return config?.isDeployed || false
  }

  /**
   * Get User Smart Account address (even if not deployed)
   * 
   * @param userEOA User's EOA address
   * @returns Smart Account address
   */
  async getSmartAccountAddress(userEOA: Address): Promise<Address | null> {
    const config = await this.getUserSmartAccount(userEOA)
    return config?.smartAccountAddress || null
  }

  /**
   * Refresh deployment status from blockchain
   * 
   * @param userEOA User's EOA address
   */
  async refresh(userEOA: Address): Promise<void> {
    const config = this.cache.get(userEOA.toLowerCase() as Address)
    if (!config) return

    const code = await this.publicClient.getBytecode({ 
      address: config.smartAccountAddress 
    })
    const isDeployed = !!(code && code !== '0x')

    if (isDeployed && !config.isDeployed) {
      console.log('[UserSA] Status changed: NOW DEPLOYED!', config.smartAccountAddress)
      config.isDeployed = true
      config.initCode = undefined
      this.cache.set(userEOA.toLowerCase() as Address, config)
    }
  }

  /**
   * Clear cache (for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
export const userSmartAccountService = new UserSmartAccountService()
