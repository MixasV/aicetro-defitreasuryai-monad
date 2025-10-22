/**
 * AI Agent Smart Account Service
 * 
 * Creates and manages ONE counterfactual AI Agent Smart Account
 * for ALL users' delegations.
 * 
 * Key Features:
 * - Counterfactual deployment (no gas until first use)
 * - Gas Manager sponsorship for all redemptions
 * - Shared across all users (non-custodial)
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import type { MetaMaskSmartAccount } from '@metamask/delegation-toolkit'

interface AIAgentSAConfig {
  address: Address
  isDeployed: boolean
  initCode?: Hex
}

class AIAgentSmartAccountService {
  private publicClient: any
  private walletClient: any
  private ownerAccount: any
  private smartAccount: MetaMaskSmartAccount | null = null
  private config: AIAgentSAConfig | null = null

  constructor() {
    // Setup clients
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    // AI Agent owner = backend deployer key
    if (env.deployerPrivateKey) {
      this.ownerAccount = privateKeyToAccount(env.deployerPrivateKey as Hex)
      this.walletClient = createWalletClient({
        account: this.ownerAccount,
        chain: monadTestnet,
        transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      })
      console.log('[AI Agent SA] Owner address:', this.ownerAccount.address)
    } else {
      console.warn('[AI Agent SA] DEPLOYER_PRIVATE_KEY not set - AI Agent SA disabled')
    }
  }

  /**
   * Initialize AI Agent Smart Account (counterfactual)
   * 
   * This only computes the address, does NOT deploy on-chain!
   * Deployment happens automatically on first UserOp.
   */
  async initialize(): Promise<AIAgentSAConfig> {
    if (this.config) {
      return this.config
    }

    if (!this.ownerAccount) {
      throw new Error('DEPLOYER_PRIVATE_KEY not configured')
    }

    console.log('[AI Agent SA] Creating counterfactual Smart Account...')

    // Create MetaMask Smart Account (Hybrid implementation)
    this.smartAccount = await toMetaMaskSmartAccount({
      client: this.publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [this.ownerAccount.address, [], [], []],
      deploySalt: '0x',
      signer: { account: this.ownerAccount }
    })

    const address = this.smartAccount.address

    // Check if already deployed on-chain
    const code = await this.publicClient.getBytecode({ address })
    const isDeployed = !!(code && code !== '0x')  // !! = явное преобразование в boolean

    console.log('[AI Agent SA] Address:', address)
    console.log('[AI Agent SA] Deployed:', isDeployed)

    // Get initCode for deployment (if not deployed)
    let initCode: Hex | undefined
    if (!isDeployed) {
      const factoryArgs = await this.smartAccount.getFactoryArgs()
      if (factoryArgs && factoryArgs.factoryData) {
        initCode = (factoryArgs.factory + factoryArgs.factoryData.slice(2)) as Hex
        console.log('[AI Agent SA] initCode ready for deployment')
      }
    }

    this.config = {
      address,
      isDeployed,
      initCode: isDeployed ? undefined : initCode
    }

    return this.config
  }

  /**
   * Get AI Agent Smart Account address (must call initialize first)
   */
  getAddress(): Address {
    if (!this.config) {
      throw new Error('AI Agent SA not initialized - call initialize() first')
    }
    return this.config.address
  }

  /**
   * Get AI Agent Smart Account instance
   */
  getSmartAccount(): MetaMaskSmartAccount {
    if (!this.smartAccount) {
      throw new Error('AI Agent SA not initialized - call initialize() first')
    }
    return this.smartAccount
  }

  /**
   * Check if AI Agent SA is deployed on-chain
   */
  async isDeployed(): Promise<boolean> {
    if (!this.config) {
      await this.initialize()
    }
    return this.config!.isDeployed
  }

  /**
   * Get initCode for deployment (returns undefined if already deployed)
   */
  getInitCode(): Hex | undefined {
    if (!this.config) {
      throw new Error('AI Agent SA not initialized - call initialize() first')
    }
    return this.config.initCode
  }

  /**
   * Force refresh deployment status
   */
  async refresh(): Promise<void> {
    if (!this.config) {
      await this.initialize()
      return
    }

    const code = await this.publicClient.getBytecode({ 
      address: this.config.address 
    })
    const isDeployed = !!(code && code !== '0x')  // !! = явное преобразование в boolean

    if (isDeployed && !this.config.isDeployed) {
      console.log('[AI Agent SA] Status changed: NOW DEPLOYED!')
      this.config.isDeployed = true
      this.config.initCode = undefined
    }
  }

  /**
   * Deploy AI Agent Smart Account via simple transaction
   * 
   * Sends a small amount of MON to trigger deployment.
   * Alternative to waiting for first UserOp.
   */
  async deploy(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.config) {
      await this.initialize()
    }

    if (this.config!.isDeployed) {
      console.log('[AI Agent SA] Already deployed, skipping')
      return { success: true }
    }

    if (!this.walletClient) {
      return { 
        success: false, 
        error: 'DEPLOYER_PRIVATE_KEY not configured' 
      }
    }

    try {
      console.log('[AI Agent SA] Deploying via transaction...')
      console.log('[AI Agent SA] Target address:', this.config!.address)

      // Check deployer balance
      const balance = await this.publicClient.getBalance({ 
        address: this.ownerAccount.address 
      })
      
      console.log('[AI Agent SA] Deployer balance:', balance.toString())

      if (balance === 0n) {
        return {
          success: false,
          error: 'Deployer has 0 balance. Get MON from faucet: https://discord.gg/monad'
        }
      }

      // Send 0.001 MON to trigger deployment
      const hash = await this.walletClient.sendTransaction({
        to: this.config!.address,
        value: 1000000000000000n, // 0.001 MON
        data: '0x'
      })

      console.log('[AI Agent SA] Deployment TX sent:', hash)
      console.log('[AI Agent SA] Waiting for confirmation...')

      const receipt = await this.publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000 // 1 minute
      })

      if (receipt.status === 'success') {
        console.log('[AI Agent SA] ✅ Deployed successfully!')
        console.log('[AI Agent SA] Block:', receipt.blockNumber)
        console.log('[AI Agent SA] Gas used:', receipt.gasUsed.toString())

        // Refresh status
        await this.refresh()

        return { success: true, txHash: hash }
      } else {
        console.error('[AI Agent SA] ❌ Deployment failed!')
        return { 
          success: false, 
          error: 'Transaction reverted',
          txHash: hash 
        }
      }

    } catch (error: any) {
      console.error('[AI Agent SA] Deployment error:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  /**
   * Sign UserOperation
   * 
   * This uses MetaMask Smart Account's built-in signing method
   */
  async signUserOperation(userOp: any): Promise<any> {
    if (!this.smartAccount) {
      throw new Error('AI Agent SA not initialized')
    }

    try {
      const signedUserOp = await this.smartAccount.signUserOperation(userOp)
      return signedUserOp
    } catch (error: any) {
      console.error('[AI Agent SA] Signing error:', error)
      throw error
    }
  }
}

// Singleton instance
export const aiAgentSmartAccountService = new AIAgentSmartAccountService()
