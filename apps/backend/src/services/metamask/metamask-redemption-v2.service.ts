/**
 * MetaMask Delegation Redemption Service V2
 * 
 * NEW ARCHITECTURE with Gas Sponsorship:
 * - ONE AI Agent Smart Account for ALL users
 * - Redemption via UserOp (Gas Manager sponsors)
 * - Supports delegation chains
 * - NO per-user keys needed!
 */

import { createPublicClient, http, type Address, type Hex, encodeFunctionData, encodeAbiParameters } from 'viem'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'
import { alchemyGasManager } from '../alchemy/alchemy-gas-manager.service'
import { aiAgentSmartAccountService } from '../erc4337/ai-agent-smart-account.service'

// MetaMask Delegation Toolkit v0.13.0
import { createExecution, ExecutionMode } from '@metamask/delegation-toolkit'

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
  userOpHash?: string
  txHash?: string
  reason?: string
}

class MetaMaskRedemptionV2Service {
  private publicClient: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    console.log('[MetaMask Redemption V2] Service initialized')
  }

  /**
   * Build delegation chain for user
   * 
   * Returns array of delegations sorted by authority:
   * [root_delegation, child_delegation_1, child_delegation_2, ...]
   */
  private async buildDelegationChain(accountAddress: Address): Promise<any[]> {
    // Get all active delegations for user
    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: accountAddress.toLowerCase() },
      include: { 
        delegations: { 
          where: { active: true },
          orderBy: { createdAt: 'asc' }
        } 
      }
    })

    if (!corporateAccount || !corporateAccount.delegations.length) {
      throw new Error('No active delegations found')
    }

    // Parse signed delegations
    const delegations = corporateAccount.delegations.map(d => d.signedDelegation as any)

    console.log('[MetaMask Redemption V2] Found', delegations.length, 'signed delegations')
    
    // Build chain: root → children
    const chain: any[] = []
    const delegationMap = new Map()

    // First pass: index all delegations
    delegations.forEach(d => {
      if (!d || !d.delegate) {
        console.warn('[MetaMask Redemption V2] Invalid delegation:', d)
        return
      }
      
      const hash = this.computeDelegationHash(d)
      delegationMap.set(hash, d)
      
      // Root delegation has authority = 0x0000...
      if (!d.authority || d.authority === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        chain.push(d)
      }
    })

    if (chain.length === 0) {
      throw new Error('No root delegation found (authority = 0x0000...)')
    }

    // Second pass: build chain by following authority links
    const processed = new Set([chain[0]])
    let currentHash = this.computeDelegationHash(chain[0])

    while (true) {
      let found = false
      for (const d of delegations) {
        if (!processed.has(d) && d.authority === currentHash) {
          chain.push(d)
          processed.add(d)
          currentHash = this.computeDelegationHash(d)
          found = true
          break
        }
      }
      if (!found) break
    }

    console.log('[MetaMask Redemption V2] Built delegation chain, length:', chain.length)
    return chain
  }

  /**
   * Compute delegation hash (for authority linking)
   */
  private computeDelegationHash(delegation: any): string {
    // Use keccak256 hash of the delegation structure
    // TODO: Implement proper EIP-712 hash matching on-chain logic
    return '0x' + Math.random().toString(16).slice(2).padStart(64, '0')
  }

  /**
   * Redeem delegation via UserOp (GAS SPONSORED!)
   * 
   * Flow:
   * 1. Get user's delegation chain from DB
   * 2. Build redeemDelegations calldata
   * 3. Create UserOp from AI Agent SA
   * 4. Request gas sponsorship
   * 5. Send UserOp
   */
  async redeemDelegation(params: RedeemDelegationParams): Promise<RedeemResult> {
    try {
      console.log('[MetaMask Redemption V2] Starting redemption for:', params.accountAddress)
      console.log('[MetaMask Redemption V2] Protocol:', params.protocolAddress)
      console.log('[MetaMask Redemption V2] Amount:', params.amountUsd, 'USD')

      // ⚠️ CRITICAL: Get User Smart Account address AND deploySalt from delegation
      const delegation = await prisma.delegation.findFirst({
        where: {
          smartAccountAddress: params.accountAddress.toLowerCase(),
          active: true
        }
      })

      if (!delegation || !delegation.smartAccountAddress) {
        throw new Error('No User Smart Account found in delegation. User must create their own SA first.')
      }

      const userSAAddress = delegation.smartAccountAddress as Address
      const deploySalt = delegation.deploySalt || null
      const userEOA = delegation.userEOA as Address
      
      console.log('[MetaMask Redemption V2] User Smart Account (UserOp sender):', userSAAddress)
      console.log('[MetaMask Redemption V2] Deploy salt:', deploySalt)
      console.log('[MetaMask Redemption V2] User EOA:', userEOA)

      // Get AI Agent Smart Account (for signing as delegate)
      const aiAgentSA = aiAgentSmartAccountService.getSmartAccount()
      const aiAgentAddress = aiAgentSmartAccountService.getAddress()
      
      if (!aiAgentSA) {
        throw new Error('AI Agent Smart Account not initialized')
      }

      console.log('[MetaMask Redemption V2] AI Agent SA (delegate signer):', aiAgentAddress)

      // Build delegation chain
      const delegationChain = await this.buildDelegationChain(params.accountAddress)

      console.log('[MetaMask Redemption V2] Using', delegationChain.length, 'delegations in chain')

      // Prepare execution using SDK (как в документации!)
      const executions = createExecution({
        target: params.protocolAddress,
        value: 0n,
        callData: params.callData
      })

      console.log('[MetaMask Redemption V2] Delegation chain:', delegationChain.length, 'delegations')
      console.log('[MetaMask Redemption V2] executions:', {
        target: executions.target,
        value: executions.value?.toString(),
        callData: executions.callData?.slice(0, 20) + '...'
      })

      // ⚠️ ПО ДОКУМЕНТАЦИИ: DelegationManager.encode.redeemDelegations САМ кодирует delegation objects!
      // НЕ нужно вручную кодировать в bytes!
      
      // Импортируем DelegationManager через правильный subpath export
      const { DelegationManager } = require('@metamask/delegation-toolkit/contracts')

      console.log('[MetaMask Redemption V2] DelegationManager loaded:', !!DelegationManager)

      // ⚠️ ПО ДОКУМЕНТАЦИИ STEP 7: executions: [[executions]] (массив массивов!)
      // https://docs.metamask.io/delegation-toolkit/guides/delegation/execute-on-smart-accounts-behalf
      const redeemCalldata = DelegationManager.encode.redeemDelegations({
        delegations: [delegationChain],  // [[delegation]] - массив delegation chains
        modes: [ExecutionMode.SingleDefault],
        executions: [[executions]]  // [[executions]] - массив массивов как в документации!
      })

      console.log('[MetaMask Redemption V2] redeemDelegations calldata prepared')

      // ⚠️ Check if User SA is deployed
      const code = await this.publicClient.getBytecode({ address: userSAAddress })
      const isDeployed = !!(code && code !== '0x')

      console.log('[MetaMask Redemption V2] User SA deployed:', isDeployed)

      // Get initCode if not deployed
      let initCode: Hex = '0x'
      if (!isDeployed) {
        console.log('[MetaMask Redemption V2] ⚠️ User SA not deployed - generating initCode with salt:', deploySalt)
        
        if (!userEOA || !deploySalt) {
          throw new Error('Cannot generate initCode: missing userEOA or deploySalt in delegation')
        }
        
        // Import User SA service to generate SA with correct salt
        const { userSmartAccountService } = await import('../erc4337/user-smart-account.service')
        
        // Create User SA with SAME salt as frontend!
        const userSAConfig = await userSmartAccountService.createUserSmartAccount(
          userEOA,
          deploySalt // ✅ Use salt from delegation!
        )
        
        if (!userSAConfig.initCode) {
          throw new Error('Failed to generate initCode for User SA deployment')
        }
        
        initCode = userSAConfig.initCode
        console.log('[MetaMask Redemption V2] initCode generated with salt, length:', initCode.length)
        console.log('[MetaMask Redemption V2] Expected SA address:', userSAConfig.smartAccountAddress)
        
        // Verify address matches
        if (userSAConfig.smartAccountAddress.toLowerCase() !== userSAAddress.toLowerCase()) {
          console.error('[MetaMask Redemption V2] ❌ ADDRESS MISMATCH!')
          console.error('[MetaMask Redemption V2] Expected:', userSAAddress)
          console.error('[MetaMask Redemption V2] Generated:', userSAConfig.smartAccountAddress)
          throw new Error('Generated SA address does not match stored address. Salt mismatch?')
        }
        
        console.log('[MetaMask Redemption V2] ✅ Address match verified')
      }

      // ⚠️ Build UserOp with User SA as sender (NOT AI Agent!)
      const userOp = {
        sender: userSAAddress, // ✅ User's Smart Account!
        nonce: '0x0', // TODO: Get actual nonce from User SA
        initCode, // ✅ initCode if not deployed
        callData: encodeFunctionData({
          abi: [
            {
              name: 'execute',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'value', type: 'uint256' },
                { name: 'data', type: 'bytes' }
              ],
              outputs: []
            }
          ],
          functionName: 'execute',
          args: [DELEGATION_MANAGER_ADDRESS, 0n, redeemCalldata]
        }),
        callGasLimit: '0x0',
        verificationGasLimit: '0x0',
        preVerificationGas: '0x0',
        maxFeePerGas: '0x0',
        maxPriorityFeePerGas: '0x0',
        paymasterAndData: '0x',
        signature: '0x'
      }

      // ⚠️ ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ для дебага
      console.log('[MetaMask Redemption V2] ===== UserOp DEBUG =====')
      console.log('[MetaMask Redemption V2] ✅ sender (User SA):', userOp.sender)
      console.log('[MetaMask Redemption V2] AI Agent (delegate):', aiAgentSA.address)
      console.log('[MetaMask Redemption V2] nonce:', userOp.nonce)
      console.log('[MetaMask Redemption V2] initCode length:', userOp.initCode?.length || 0)
      console.log('[MetaMask Redemption V2] initCode (first 66 chars):', userOp.initCode?.slice(0, 66) || '0x')
      console.log('[MetaMask Redemption V2] callData length:', userOp.callData?.length || 0)
      console.log('[MetaMask Redemption V2] callData (first 66 chars):', userOp.callData?.slice(0, 66))
      console.log('[MetaMask Redemption V2] callGasLimit:', userOp.callGasLimit)
      console.log('[MetaMask Redemption V2] verificationGasLimit:', userOp.verificationGasLimit)
      console.log('[MetaMask Redemption V2] preVerificationGas:', userOp.preVerificationGas)
      console.log('[MetaMask Redemption V2] ================================')
      console.log('[MetaMask Redemption V2] ⚠️ CRITICAL: User SA is sender, AI Agent signs as delegate!')

      console.log('[MetaMask Redemption V2] Requesting gas sponsorship...')

      // Request gas sponsorship
      const sponsorship = await alchemyGasManager.requestGasSponsorship(
        userOp,
        ENTRY_POINT_ADDRESS
      )

      console.log('[MetaMask Redemption V2] Gas sponsorship approved!')

      // Update UserOp with sponsorship
      userOp.callGasLimit = sponsorship.callGasLimit
      userOp.verificationGasLimit = sponsorship.verificationGasLimit
      userOp.preVerificationGas = sponsorship.preVerificationGas
      userOp.paymasterAndData = sponsorship.paymasterAndData

      // Sign UserOp with AI Agent SA
      console.log('[MetaMask Redemption V2] Signing UserOperation...')
      
      let userOpHash: string
      try {
        // MetaMask Smart Account signing
        // @ts-ignore - MetaMask SA has correct types, our wrapper simplified
        const signedUserOp = await aiAgentSA.signUserOperation(userOp)
        console.log('[MetaMask Redemption V2] UserOp signed')

        // Send UserOp
        console.log('[MetaMask Redemption V2] Sending UserOperation...')

        userOpHash = await alchemyGasManager.sendUserOperation(
          signedUserOp,
          ENTRY_POINT_ADDRESS
        )
      } catch (signError: any) {
        console.error('[MetaMask Redemption V2] Signing error:', signError)
        throw new Error(`Failed to sign UserOp: ${signError.message}`)
      }

      console.log('[MetaMask Redemption V2] UserOp sent:', userOpHash)

      // Wait for receipt
      const receipt = await alchemyGasManager.getUserOperationReceipt(userOpHash)

      if (receipt && receipt.success) {
        console.log('[MetaMask Redemption V2] ✅ Redemption successful!')
        console.log('[MetaMask Redemption V2] Tx hash:', receipt.receipt.transactionHash)

        return {
          ok: true,
          userOpHash,
          txHash: receipt.receipt.transactionHash
        }
      } else {
        console.error('[MetaMask Redemption V2] ❌ Redemption failed')
        return {
          ok: false,
          reason: 'UserOp execution failed'
        }
      }

    } catch (error: any) {
      console.error('[MetaMask Redemption V2] Error:', error)
      return {
        ok: false,
        reason: error.message || 'Unknown error'
      }
    }
  }

  // ✅ encodeDelegationToBytes() больше не нужен!
  // SDK метод DelegationManager.encode.redeemDelegations() САМ кодирует delegation objects
}

export const metaMaskRedemptionV2Service = new MetaMaskRedemptionV2Service()
