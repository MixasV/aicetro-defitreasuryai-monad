/**
 * Smart Account Creation Service (ERC-4337 + Gas Manager)
 * 
 * Creates Smart Accounts with GAS SPONSORSHIP from Alchemy Gas Manager
 * 
 * Flow:
 * 1. Build initCode for Factory.createAccount(owner, salt)
 * 2. Create UserOp with initCode
 * 3. Request gas sponsorship from Gas Manager
 * 4. Send UserOp via bundler
 * 5. Smart Account deployed gasless!
 */

import { encodeFunctionData, type Address, type Hex } from 'viem'
import { alchemyGasManager } from '../alchemy/alchemy-gas-manager.service'
import { env } from '../../config/env'

const FACTORY_ADDRESS = '0xf2200e301d66a3E77C370A813bea612d064EB64D' as Address
const ENTRY_POINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address

const FactoryABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'uint256' }
    ],
    name: 'createAccount',
    outputs: [{ name: 'account', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'salt', type: 'uint256' }
    ],
    name: 'getAddress',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

interface CreateSmartAccountParams {
  owner: Address
  salt?: bigint
}

interface CreateSmartAccountResult {
  success: boolean
  smartAccountAddress?: Address
  userOpHash?: string
  error?: string
}

class SmartAccountCreationService {
  /**
   * Create Smart Account with GAS SPONSORSHIP
   * 
   * @param owner User's EOA address (will own Smart Account)
   * @param salt Optional salt for deterministic address
   * @returns Smart Account address + UserOp hash
   */
  async createSmartAccountSponsored(
    params: CreateSmartAccountParams
  ): Promise<CreateSmartAccountResult> {
    try {
      const { owner, salt = 0n } = params

      console.log('[SmartAccountCreation] Creating Smart Account for owner:', owner)
      console.log('[SmartAccountCreation] Salt:', salt.toString())

      // Build initCode: Factory.createAccount(owner, salt)
      const createAccountCalldata = encodeFunctionData({
        abi: FactoryABI,
        functionName: 'createAccount',
        args: [owner, salt]
      })

      const initCode = (FACTORY_ADDRESS + createAccountCalldata.slice(2)) as Hex
      
      console.log('[SmartAccountCreation] initCode:', initCode)

      // Calculate Smart Account address (deterministic)
      // NOTE: In production, call Factory.getAddress(owner, salt) to get address
      // For now, we'll use placeholder (will be filled by bundler)
      
      // Build UserOp
      const userOp = {
        sender: '0x0000000000000000000000000000000000000000' as Address, // Will be replaced with computed address
        nonce: '0x0',
        initCode, // Factory call
        callData: '0x', // No execution on first transaction
        callGasLimit: '0x0', // Will be filled by Gas Manager
        verificationGasLimit: '0x0',
        preVerificationGas: '0x0',
        maxFeePerGas: '0x0',
        maxPriorityFeePerGas: '0x0',
        paymasterAndData: '0x',
        signature: '0x' // Will be signed after gas sponsorship
      }

      console.log('[SmartAccountCreation] Requesting gas sponsorship...')

      // Request gas sponsorship
      const sponsorship = await alchemyGasManager.requestGasSponsorship(
        userOp,
        ENTRY_POINT
      )

      console.log('[SmartAccountCreation] Gas sponsorship approved!')
      console.log('[SmartAccountCreation] Paymaster:', sponsorship.paymasterAndData)

      // Update UserOp with sponsorship data
      userOp.callGasLimit = sponsorship.callGasLimit
      userOp.verificationGasLimit = sponsorship.verificationGasLimit
      userOp.preVerificationGas = sponsorship.preVerificationGas
      userOp.paymasterAndData = sponsorship.paymasterAndData

      // TODO: Sign UserOp with owner's signature
      // For now, return initCode for frontend to complete

      return {
        success: false,
        error: 'Smart Account creation requires user signature. Use frontend to complete.'
      }

      // After signature:
      // const userOpHash = await alchemyGasManager.sendUserOperation(userOp, ENTRY_POINT)
      // const receipt = await alchemyGasManager.getUserOperationReceipt(userOpHash)
      // return { success: true, smartAccountAddress: receipt.sender, userOpHash }

    } catch (error: any) {
      console.error('[SmartAccountCreation] Error:', error)
      return {
        success: false,
        error: error.message || 'Unknown error'
      }
    }
  }

  /**
   * Get Smart Account address without deploying
   * 
   * @param owner Owner address
   * @param salt Salt value
   * @returns Computed Smart Account address
   */
  async getSmartAccountAddress(owner: Address, salt: bigint = 0n): Promise<Address> {
    // TODO: Call Factory.getAddress(owner, salt) via RPC
    // For now return placeholder
    throw new Error('Not implemented - use Factory.getAddress on-chain')
  }
}

export const smartAccountCreationService = new SmartAccountCreationService()
