/**
 * MetaMask Delegation Service (EIP-7702)
 * 
 * Handles EIP-7702 EOA upgrade and delegation management
 * using MetaMask Delegation Toolkit.
 * 
 * EIP-7702: EOA becomes Smart Account WITHOUT moving funds!
 * Funds stay on EOA, AI manages EOA directly through delegation.
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import {
  toMetaMaskSmartAccount,
  createDelegation,
  Implementation,
  type MetaMaskSmartAccount,
  type Delegation
} from '@metamask/delegation-toolkit'

interface UpgradeEOAParams {
  eoaAddress: Address
}

interface CreateDelegationParams {
  eoaAddress: Address
  aiAgentAddress: Address
  dailyLimitUsd: number
  allowedProtocols: string[]
  validDays: number
}

class MetaMaskDelegationService {
  private publicClient: any
  private aiAgentWalletClient: any
  private aiAgentAccount: any

  constructor() {
    // Public client for reading blockchain state
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    // AI agent wallet client (for signing on behalf of delegations)
    // NOTE: AI agent has its own key, NOT user keys!
    if (env.deployerPrivateKey) {
      this.aiAgentAccount = privateKeyToAccount(env.deployerPrivateKey as Hex)
      this.aiAgentWalletClient = createWalletClient({
        account: this.aiAgentAccount,
        chain: monadTestnet,
        transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      })
      console.log('[MetaMask] AI Agent address:', this.aiAgentAccount.address)
    }
  }

  /**
   * Check if EOA is upgraded via EIP-7702
   * 
   * EIP-7702 sets code at EOA address: 0xef0100 + delegated_contract_address
   */
  async isEOAUpgraded(eoaAddress: Address): Promise<boolean> {
    try {
      const code = await this.publicClient.getBytecode({ address: eoaAddress })
      
      // Check if code starts with 0xef0100 (EIP-7702 marker)
      if (code && code.startsWith('0xef0100')) {
        console.log('[MetaMask EIP-7702] EOA already upgraded:', eoaAddress)
        return true
      }
      
      return false
    } catch (error) {
      console.error('[MetaMask EIP-7702] Error checking EOA upgrade:', error)
      return false
    }
  }

  /**
   * Get delegation manager address for EIP-7702
   */
  getDelegationManagerAddress(): Address {
    // Monad Testnet DelegationManager from MetaMask Delegation Framework
    return process.env.METAMASK_DELEGATION_MANAGER as Address || 
           '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a'
  }

  /**
   * Prepare EIP-7702 authorization message for user to sign
   * 
   * User will sign this with MetaMask to authorize EOA upgrade.
   * Returns message for frontend to present to user.
   */
  prepareEIP7702Authorization(params: UpgradeEOAParams): {
    message: string
    delegatorAddress: Address
  } {
    console.log('[MetaMask EIP-7702] Preparing authorization for EOA:', params.eoaAddress)

    // Get Hybrid Delegator implementation address (what EOA will point to)
    const hybridDelegatorAddress = this.getHybridDelegatorAddress()

    return {
      message: `Upgrade your account to support AI delegation via EIP-7702.\n\nYour funds stay on your account (${params.eoaAddress}).\nNo transfer required!\n\nDelegation contract: ${hybridDelegatorAddress}`,
      delegatorAddress: hybridDelegatorAddress
    }
  }

  /**
   * Create delegation for AI agent with REAL caveats (EIP-7702)
   * 
   * User signs this delegation with MetaMask, granting AI agent
   * permission to execute transactions within specified limits.
   * 
   * IMPORTANT: Signature must be created on frontend by user!
   * EOA must be upgraded via EIP-7702 BEFORE creating delegation!
   */
  createDelegationStructure(params: CreateDelegationParams): Delegation {
    console.log('[MetaMask EIP-7702] Creating delegation structure with caveats')

    // Import caveat builders
    const { combineCaveats } = require('./caveat-enforcers')

    // Build caveats array from parameters
    const caveats = combineCaveats(
      params.dailyLimitUsd,
      params.allowedProtocols as Address[],
      3, // maxRiskScore - default to 3 (medium risk)
      params.validDays
    )

    console.log('[MetaMask EIP-7702] Generated caveats:', {
      dailyLimitUsd: params.dailyLimitUsd,
      protocolsCount: params.allowedProtocols?.length || 0,
      validDays: params.validDays,
      caveatsCount: caveats.length
    })

    // Create delegation with REAL restrictions
    // Delegator = EOA address (upgraded via EIP-7702)
    // Delegate = AI agent address
    const delegation: Delegation = {
      delegate: params.aiAgentAddress,
      delegator: params.eoaAddress, // ✅ EOA, not Smart Account!
      authority: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      caveats: caveats,
      salt: `0x${Date.now().toString(16).padStart(64, '0')}` as `0x${string}`,
      signature: '0x' as `0x${string}` // Will be filled by user signing on frontend
    }

    console.log('[MetaMask EIP-7702] Delegation created with restrictions:', {
      from: delegation.delegator,
      to: delegation.delegate,
      caveatsCount: delegation.caveats.length
    })

    return delegation
  }

  /**
   * Verify delegation signature
   * 
   * Validates that user properly signed the delegation using DelegationManager contract
   */
  async verifyDelegation(delegation: Delegation, signature: Hex): Promise<boolean> {
    console.log('[MetaMask] Verifying delegation signature')

    try {
      // Import DelegationManager ABI
      const DelegationManagerABI = require('../../abis/DelegationManager.json')
      const delegationManagerAddress = this.getDelegationManagerAddress()

      // Prepare delegation structure for contract call
      const delegationStruct = {
        delegate: delegation.delegate,
        delegator: delegation.delegator,
        authority: delegation.authority || '0x0000000000000000000000000000000000000000000000000000000000000000',
        caveats: delegation.caveats.map(caveat => ({
          enforcer: caveat.enforcer,
          terms: caveat.terms,
          args: caveat.args || '0x'
        })),
        salt: delegation.salt || 0,
        signature: signature
      }

      // Call isValidDelegation on DelegationManager contract
      const isValid = await this.publicClient.readContract({
        address: delegationManagerAddress,
        abi: DelegationManagerABI,
        functionName: 'isValidDelegation',
        args: [delegationStruct]
      })

      console.log('[MetaMask] Delegation verification result:', isValid)
      return isValid as boolean
    } catch (error) {
      console.error('[MetaMask] Error verifying delegation:', error)
      // If contract call fails, reject delegation (security-first approach)
      return false
    }
  }

  /**
   * Get hybrid delegator implementation address (for EIP-7702 delegation)
   */
  getHybridDelegatorAddress(): Address {
    return process.env.METAMASK_HYBRID_DELEGATOR as Address ||
           '0x0fb901F876C65d4cc2491Cd2a0be8117E159dFee'
  }

  /**
   * Get EntryPoint address (ERC-4337 standard)
   */
  getEntryPointAddress(): Address {
    return process.env.METAMASK_ENTRY_POINT as Address ||
           '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
  }

  /**
   * Get expected code at upgraded EOA
   * Format: 0xef0100 + hybrid_delegator_address (20 bytes)
   */
  getExpectedEIP7702Code(): Hex {
    const delegatorAddress = this.getHybridDelegatorAddress().slice(2) // Remove 0x
    return `0xef0100${delegatorAddress}` as Hex
  }

  /**
   * Upgrade EOA via EIP-7702 with GAS SPONSORSHIP
   * 
   * CRITICAL FINDING: EIP-7702 type 0x04 transactions CANNOT be sent via ERC-4337 UserOp!
   * Type 0x04 is a new transaction type at protocol level, not supported by EntryPoint.
   * 
   * SOLUTION: User MUST send 0x04 transaction themselves (needs MON for gas)
   * OR: Use Monad's native support if available
   * 
   * For now: Return error explaining limitation
   */
  async upgradeEOASponsored(params: {
    eoaAddress: Address
    authorization: any
    signature: Hex
  }): Promise<{ success: boolean; txHash?: string; error?: string }> {
    return {
      success: false,
      error: 'EIP-7702 type 0x04 transactions cannot be sponsored via ERC-4337. User must send with their own MON or use alternative delegation approach.'
    }
  }
}

export const metaMaskDelegationService = new MetaMaskDelegationService()
