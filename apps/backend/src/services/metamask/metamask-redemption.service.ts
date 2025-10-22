/**
 * MetaMask Delegation Redemption Service
 * 
 * NEW ARCHITECTURE (Gas Sponsored):
 * - ONE AI Agent Smart Account for ALL users
 * - User delegations stored with signature
 * - Redemption via UserOp (Gas Manager sponsors)
 * - Supports delegation chains (expand permissions)
 * 
 * This is the CORE feature required for hackathon compliance!
 */

import { createPublicClient, createWalletClient, http, type Address, type Hex, encodeFunctionData, encodeAbiParameters } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'
import { decryptPrivateKey } from '../../utils/encryption'
import { alchemyGasManager } from '../alchemy/alchemy-gas-manager.service'
import { aiAgentSmartAccountService } from '../erc4337/ai-agent-smart-account.service'

const DelegationManagerABI = require('../../abis/DelegationManager.json')

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address
const DELEGATION_MANAGER_ADDRESS = (process.env.METAMASK_DELEGATION_MANAGER as Address) || 
                                    '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a'

interface RedeemDelegationParams {
  accountAddress: Address
  protocolAddress: Address
  callData: Hex
  amountUsd: number
}

interface RedeemResult {
  ok: boolean
  txHash?: string
  reason?: string
}

class MetaMaskRedemptionService {
  private publicClient: any
  private delegationManagerAddress: Address

  constructor() {
    this.delegationManagerAddress = DELEGATION_MANAGER_ADDRESS

    // Public client for reading blockchain
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    console.log('[MetaMask Redemption] Service initialized (OLD implementation - use V2 for Gas Manager)')
  }

  /**
   * Initialize AI Agent Smart Account (must be called before redemptions)
   */
  async initialize(): Promise<void> {
    try {
      const config = await aiAgentSmartAccountService.initialize()
      console.log('[MetaMask Redemption] AI Agent SA ready:', config.address)
      console.log('[MetaMask Redemption] Deployed:', config.isDeployed)
      
      if (!config.isDeployed) {
        console.log('[MetaMask Redemption] Will auto-deploy on first redemption (Gas Manager pays)')
      }
    } catch (error: any) {
      console.error('[MetaMask Redemption] Failed to initialize AI Agent SA:', error)
      throw error
    }
  }

  /**
   * Redeem delegation to execute AI action
   * 
   * This calls DelegationManager.redeemDelegations() with user's signed delegation
   * to execute the action on their Smart Account.
   * 
   * CRITICAL: This is the required integration for hackathon!
   */
  async redeemDelegation(params: RedeemDelegationParams): Promise<RedeemResult> {
    try {
      console.log('[MetaMask Redemption] Starting redemption for account:', params.accountAddress)

      // Get corporate account
      const corporateAccount = await prisma.corporateAccount.findUnique({
        where: { address: params.accountAddress.toLowerCase() },
        include: { delegations: { where: { active: true } } }
      })

      if (!corporateAccount || !corporateAccount.delegations.length) {
        return {
          ok: false,
          reason: 'No active delegation found'
        }
      }

      const delegation = corporateAccount.delegations[0]
      const signedDelegation = delegation.signedDelegation as any

      // ✅ CORRECT: Check if this is ERC-7710 MetaMask delegation by required fields
      // NOT by checking type === 'metamask' (that field is optional/legacy)
      const hasERC7710Fields = signedDelegation?.delegate && 
                               signedDelegation?.delegator && 
                               signedDelegation?.caveats && 
                               signedDelegation?.signature

      if (!hasERC7710Fields) {
        console.log('[MetaMask Redemption] ⚠️ Not an ERC-7710 delegation format')
        console.log('[MetaMask Redemption] Has delegate:', !!signedDelegation?.delegate)
        console.log('[MetaMask Redemption] Has delegator:', !!signedDelegation?.delegator)
        console.log('[MetaMask Redemption] Has caveats:', !!signedDelegation?.caveats)
        console.log('[MetaMask Redemption] Has signature:', !!signedDelegation?.signature)
        return {
          ok: false,
          reason: 'Not a MetaMask ERC-7710 delegation - use legacy execution'
        }
      }

      console.log('[MetaMask Redemption] ✅ Found ERC-7710 delegation with signature')
      console.log('[MetaMask Redemption] Delegate:', signedDelegation.delegate)
      console.log('[MetaMask Redemption] Delegator:', signedDelegation.delegator)

      // NOTE: This is OLD implementation that used per-user AI agent keys
      // NEW implementation uses single AI Agent Smart Account via UserOp
      // See metamask-redemption-v2.service.ts
      console.warn('[MetaMask Redemption] ⚠️ Using OLD implementation (direct call)')
      console.warn('[MetaMask Redemption] ⚠️ Switch to V2 for Gas Manager sponsorship')

      // Decrypt AI agent private key for this user
      if (!delegation.aiAgentPrivateKeyEncrypted) {
        return {
          ok: false,
          reason: 'No AI agent private key found'
        }
      }

      if (!env.masterEncryptionPassword) {
        return {
          ok: false,
          reason: 'MASTER_ENCRYPTION_PASSWORD not configured'
        }
      }

      let aiAgentPrivateKey: string
      try {
        aiAgentPrivateKey = decryptPrivateKey(delegation.aiAgentPrivateKeyEncrypted, env.masterEncryptionPassword)
      } catch (error: any) {
        console.error('[MetaMask Redemption] Failed to decrypt AI agent key:', error)
        return {
          ok: false,
          reason: 'Failed to decrypt AI agent private key'
        }
      }

      // Create wallet client with THIS USER's AI agent key
      const aiAgentAccount = privateKeyToAccount(aiAgentPrivateKey as Hex)
      const aiAgentWalletClient = createWalletClient({
        account: aiAgentAccount,
        chain: monadTestnet,
        transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      })

      console.log('[MetaMask Redemption] Using AI agent address:', aiAgentAccount.address)

      // ✅ CRITICAL: Ensure all string values are treated as Hex type by viem
      // TypeScript 'as Hex' is compile-time only - doesn't affect runtime!
      // We need to ensure strings are valid hex format at runtime
      const ensureHex = (value: string): Hex => {
        if (!value || typeof value !== 'string') {
          throw new Error(`Invalid hex value: ${value}`)
        }
        // Ensure it starts with 0x
        return (value.startsWith('0x') ? value : `0x${value}`) as Hex
      }

      // Check if MetaMask ERC-7710 delegation format
      let delegationStruct: any
      
      if (signedDelegation.delegate && signedDelegation.delegator && signedDelegation.caveats) {
        // MetaMask ERC-7710 format - use directly
        console.log('[MetaMask Redemption] ✅ Using MetaMask ERC-7710 delegation structure')
        
        delegationStruct = {
          delegate: ensureHex(signedDelegation.delegate),
          delegator: ensureHex(signedDelegation.delegator),
          authority: ensureHex(signedDelegation.authority || '0x0000000000000000000000000000000000000000000000000000000000000000'),
          caveats: signedDelegation.caveats.map((caveat: any) => ({
            enforcer: ensureHex(caveat.enforcer),
            terms: ensureHex(caveat.terms),
            args: ensureHex(caveat.args || '0x')  // ✅ CRITICAL FIX: Caveat has 3 fields!
          })),
          salt: typeof signedDelegation.salt === 'string' 
            ? BigInt(signedDelegation.salt) 
            : BigInt(signedDelegation.salt || 0),
          signature: ensureHex(signedDelegation.signature)
        }
      } else {
        // Legacy format (personal_sign) - cannot use with DelegationManager
        // User needs to recreate delegation with new format for gasless execution
        console.warn('[MetaMask Redemption] ⚠️ Legacy delegation format detected')
        console.warn('[MetaMask Redemption] User must recreate delegation at /setup/simple for gasless execution')
        
        return {
          ok: false,
          reason: 'Legacy delegation format. Please recreate delegation at /setup/simple for gasless execution.'
        }
      }

      // Encode execution (call to protocol)
      const execution = {
        target: ensureHex(params.protocolAddress),
        value: 0n, // No ETH transfer
        callData: ensureHex(params.callData) // ✅ FIX: Must be Hex type, not string!
      }

      // ExecutionMode.SingleDefault = 0x01
      const executionMode = ensureHex('0x0100000000000000000000000000000000000000000000000000000000000000')

      console.log('[MetaMask Redemption] Building UserOperation with Paymaster sponsorship')
      console.log('[MetaMask Redemption] delegationStruct.delegate:', delegationStruct.delegate, typeof delegationStruct.delegate)
      console.log('[MetaMask Redemption] delegationStruct.delegator:', delegationStruct.delegator, typeof delegationStruct.delegator)
      console.log('[MetaMask Redemption] delegationStruct.authority:', delegationStruct.authority, typeof delegationStruct.authority)
      console.log('[MetaMask Redemption] delegationStruct.salt:', delegationStruct.salt, typeof delegationStruct.salt)
      console.log('[MetaMask Redemption] delegationStruct.signature:', delegationStruct.signature, typeof delegationStruct.signature)
      console.log('[MetaMask Redemption] delegationStruct.caveats count:', delegationStruct.caveats.length)
      delegationStruct.caveats.forEach((cav: any, i: number) => {
        console.log(`[MetaMask Redemption] caveat[${i}].enforcer:`, cav.enforcer, typeof cav.enforcer)
        console.log(`[MetaMask Redemption] caveat[${i}].terms:`, cav.terms, typeof cav.terms)
        console.log(`[MetaMask Redemption] caveat[${i}].args:`, cav.args, typeof cav.args)
      })
      console.log('[MetaMask Redemption] execution.target:', execution.target, typeof execution.target)
      console.log('[MetaMask Redemption] execution.callData:', execution.callData, typeof execution.callData)
      console.log('[MetaMask Redemption] executionMode:', executionMode, typeof executionMode)

      // 1. Encode delegation struct to bytes (redeemDelegations expects bytes[][], not struct[][])
      const encodedDelegation = encodeAbiParameters(
        [
          {
            type: 'tuple',
            components: [
              { name: 'delegate', type: 'address' },
              { name: 'delegator', type: 'address' },
              { name: 'authority', type: 'bytes32' },
              {
                name: 'caveats',
                type: 'tuple[]',
                components: [
                  { name: 'enforcer', type: 'address' },
                  { name: 'terms', type: 'bytes' },
                  { name: 'args', type: 'bytes' }
                ]
              },
              { name: 'salt', type: 'uint256' },
              { name: 'signature', type: 'bytes' }
            ]
          }
        ],
        [delegationStruct]
      )

      // 2. Encode execution to bytes
      const encodedExecution = encodeAbiParameters(
        [
          {
            type: 'tuple',
            components: [
              { name: 'target', type: 'address' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' }
            ]
          }
        ],
        [execution]
      )

      console.log('[MetaMask Redemption] Encoded delegation length:', encodedDelegation.length)
      console.log('[MetaMask Redemption] Encoded execution length:', encodedExecution.length)

      // ✅ DIRECT CALL: AI agent calls DelegationManager directly (gas paid by AI agent)
      console.log('[MetaMask Redemption] Calling DelegationManager.redeemDelegations() directly...')
      
      try {
        const tx = await aiAgentWalletClient.writeContract({
          address: this.delegationManagerAddress,
          abi: DelegationManagerABI,
          functionName: 'redeemDelegations',
          args: [[[encodedDelegation]], [executionMode], [encodedExecution]],
          gas: 500000n
        })

        console.log('[MetaMask Redemption] ✅ TX sent:', tx)
        
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash: tx, timeout: 60000 })
        console.log('[MetaMask Redemption] ✅ Confirmed! Block:', receipt.blockNumber)

        return { ok: true, txHash: tx }
      } catch (txError: any) {
        console.error('[MetaMask Redemption] TX failed:', txError)
        return { ok: false, reason: `TX failed: ${txError.message}` }
      }
    } catch (error: any) {
      console.error('[MetaMask Redemption] ❌ Error:', error)
      return { ok: false, reason: error.message || 'Redemption failed' }
    }
  }

  /**
   * Check if account uses MetaMask delegation
   * ✅ CORRECT: Check ERC-7710 structure, not type field
   */
  async isMetaMaskDelegation(accountAddress: Address): Promise<boolean> {
    try {
      const corporateAccount = await prisma.corporateAccount.findUnique({
        where: { address: accountAddress.toLowerCase() },
        include: { delegations: { where: { active: true } } }
      })

      if (!corporateAccount || !corporateAccount.delegations.length) {
        return false
      }

      const delegation = corporateAccount.delegations[0]
      const signedDelegation = delegation.signedDelegation as any

      // Check ERC-7710 required fields
      return !!(signedDelegation?.delegate && 
                signedDelegation?.delegator && 
                signedDelegation?.caveats && 
                signedDelegation?.signature)
    } catch (error) {
      console.error('[MetaMask Redemption] Error checking delegation type:', error)
      return false
    }
  }
}

export const metaMaskRedemptionService = new MetaMaskRedemptionService()
