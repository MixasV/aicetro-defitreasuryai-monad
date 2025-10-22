/**
 * UserOperation Service - Execute ERC-4337 UserOperations via Delegation
 * 
 * IMPORTANT: This service DOES NOT sign transactions with user's keys.
 * Instead, it executes delegated actions using signed delegations from users.
 * 
 * Architecture:
 * 1. User creates Smart Account via MetaMask
 * 2. User signs delegation for AI agent
 * 3. AI agent executes via DelegationManager.redeemDelegations()
 * 4. NO private keys stored or used by AI
 */

import { bundlerService } from './bundler.service'
import { alchemyGasManager } from '../alchemy/alchemy-gas-manager.service'
import { env } from '../../config/env'
import { monadTestnet } from '../../chains'
import { createPublicClient, http, type Address, type Hex, encodeFunctionData } from 'viem'
import { getProtocolABI, AAVE_POOL_ABI, YEARN_VAULT_ABI, NABLA_POOL_ABI } from '../../abis/protocol-abis'
import { getProtocolAddress, getTokenAddress, getPoolAddress } from '../../config/protocol-addresses'
import { DelegationManager } from '@metamask/delegation-toolkit/dist/contracts/index.js'
import { ExecutionMode } from '@metamask/delegation-toolkit'

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

// DelegationManager deployed on Sepolia (will be on Monad when available)
// For now using Sepolia address: https://docs.metamask.io/delegation-toolkit/
const DELEGATION_MANAGER_ADDRESS = '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24' as Address

interface UserOperationParams {
  smartAccount: Address
  action: 'deposit' | 'withdraw' | 'swap'
  protocol: string
  token: Address
  amount: bigint
  toToken?: Address
}

interface UserOperation {
  sender: Address
  nonce: bigint
  initCode: Hex
  callData: Hex
  callGasLimit: bigint
  verificationGasLimit: bigint
  preVerificationGas: bigint
  maxFeePerGas: bigint
  maxPriorityFeePerGas: bigint
  paymasterAndData: Hex
  signature: Hex
}

class UserOperationService {
  private publicClient: any
  
  constructor() {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })
    
    console.log('[UserOp] Delegation-based UserOperation service initialized')
    console.log('[UserOp] AI agent does NOT store private keys')
  }
  
  /**
   * Execute action via delegation (non-custodial)
   * 
   * @param params - Action parameters
   * @param signedDelegation - Signed delegation from user (from database)
   * @returns Transaction hash
   */
  async executeViaDelegation(
    params: UserOperationParams, 
    signedDelegation: any
  ): Promise<string> {
    console.log('[UserOp] Executing via delegation (non-custodial)...', { 
      action: params.action, 
      protocol: params.protocol,
      smartAccount: params.smartAccount
    })
    
    // 1. Build execution for the action
    const execution = this.buildExecution(params)
    
    // 2. Build DelegationManager.redeemDelegations() calldata
    const redeemCalldata = this.buildRedeemDelegationsCalldata({
      delegations: [signedDelegation],
      executions: [execution]
    })
    
    // 3. Create UserOperation (calls DelegationManager)
    let userOp = await this.buildUserOperation({
      sender: params.smartAccount,
      callData: redeemCalldata
    })
    
    // 3.5. Request gas sponsorship from Alchemy (gasless!)
    console.log('[UserOp] Requesting gas sponsorship from Alchemy...')
    try {
      const gasData = await alchemyGasManager.requestGasSponsorship(userOp)
      
      // Update UserOp with sponsored gas
      userOp = {
        ...userOp,
        paymasterAndData: gasData.paymasterAndData as Hex,
        preVerificationGas: BigInt(gasData.preVerificationGas),
        verificationGasLimit: BigInt(gasData.verificationGasLimit),
        callGasLimit: BigInt(gasData.callGasLimit),
      }
      
      console.log('[UserOp] ✅ Gas sponsorship approved! Transaction will be gasless.')
    } catch (error) {
      console.warn('[UserOp] ⚠️ Gas sponsorship denied, user will pay gas:', error)
      // Continue without sponsorship - user pays gas
    }
    
    // 4. Send to bundler via Alchemy
    console.log('[UserOp] Sending UserOperation via Alchemy Bundler...')
    const userOpHash = await alchemyGasManager.sendUserOperation(userOp)
    
    // 5. Wait for receipt
    console.log('[UserOp] Waiting for confirmation...')
    const receipt = await alchemyGasManager.waitForReceipt(userOpHash)
    
    console.log('[UserOp] ✅ Delegation execution successful!', {
      userOpHash,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.actualGasUsed
    })
    
    return receipt.transactionHash
  }
  
  // Old buildCallData methods removed - replaced with delegation-based execution
  
  /**
   * Build UserOperation
   */
  private async buildUserOperation(params: {
    sender: Address
    callData: Hex
  }): Promise<Omit<UserOperation, 'signature'>> {
    console.log('[UserOp] Building UserOperation structure...')
    
    // Get nonce (would need to query on-chain)
    const nonce = 0n // TODO: Get from contract
    
    // Estimate gas
    const partial = {
      sender: params.sender,
      nonce,
      initCode: '0x' as Hex,
      callData: params.callData,
      callGasLimit: 200000n,
      verificationGasLimit: 150000n,
      preVerificationGas: 50000n,
      maxFeePerGas: 0n,
      maxPriorityFeePerGas: 0n,
      paymasterAndData: '0x' as Hex,
      signature: '0x' as Hex
    }
    
    try {
      const gasEstimate = await bundlerService.estimateUserOperationGas(partial)
      partial.callGasLimit = gasEstimate.callGasLimit * 12n / 10n // +20% buffer
      partial.verificationGasLimit = gasEstimate.verificationGasLimit * 12n / 10n
      partial.preVerificationGas = gasEstimate.preVerificationGas * 12n / 10n
    } catch (error) {
      console.warn('[UserOp] Gas estimation failed, using defaults')
    }
    
    // Get gas prices
    try {
      const gasPrice = await this.publicClient.getGasPrice()
      partial.maxFeePerGas = gasPrice
      partial.maxPriorityFeePerGas = gasPrice / 10n // 10% of maxFee
    } catch (error) {
      console.warn('[UserOp] Failed to get gas price, using defaults')
      partial.maxFeePerGas = 20000000000n // 20 gwei
      partial.maxPriorityFeePerGas = 2000000000n // 2 gwei
    }
    
    return {
      sender: partial.sender,
      nonce: partial.nonce,
      initCode: partial.initCode,
      callData: partial.callData,
      callGasLimit: partial.callGasLimit,
      verificationGasLimit: partial.verificationGasLimit,
      preVerificationGas: partial.preVerificationGas,
      maxFeePerGas: partial.maxFeePerGas,
      maxPriorityFeePerGas: partial.maxPriorityFeePerGas,
      paymasterAndData: partial.paymasterAndData
    }
  }
  
  /**
   * Build execution object for delegation
   */
  private buildExecution(params: UserOperationParams): any {
    const { action, protocol, token, amount, toToken } = params
    
    let target: Address
    let calldata: Hex
    
    try {
      switch (action) {
        case 'deposit':
          target = getPoolAddress(protocol, token.toString())
          calldata = this.buildDepositCalldata(protocol, token, amount)
          console.log('[UserOp] Built deposit execution:', { protocol, token, amount: amount.toString() })
          break
          
        case 'withdraw':
          target = getPoolAddress(protocol, token.toString())
          calldata = this.buildWithdrawCalldata(protocol, token, amount)
          console.log('[UserOp] Built withdraw execution:', { protocol, token, amount: amount.toString() })
          break
          
        case 'swap':
          if (!toToken) throw new Error('toToken required for swap')
          target = getProtocolAddress(protocol)
          calldata = this.buildSwapCalldata(protocol, token, toToken, amount)
          console.log('[UserOp] Built swap execution:', { protocol, fromToken: token, toToken, amount: amount.toString() })
          break
          
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      
      return { 
        target, 
        value: 0n, 
        calldata 
      }
    } catch (error) {
      console.error('[UserOp] Failed to build execution:', error)
      throw error
    }
  }
  
  /**
   * Build DelegationManager.redeemDelegations() calldata
   */
  private buildRedeemDelegationsCalldata(params: {
    delegations: any[]
    executions: any[]
  }): Hex {
    // Use MetaMask Delegation Toolkit DelegationManager
    // ExecutionMode.SingleDefault = execute single action per delegation
    const modes = params.executions.map(() => ExecutionMode.SingleDefault)
    
    try {
      const calldata = DelegationManager.encode.redeemDelegations({
        delegations: [params.delegations],  // Array of delegation arrays
        modes,
        executions: [params.executions]  // Array of execution arrays
      })
      
      console.log('[UserOp] Built redeemDelegations calldata:', {
        delegationCount: params.delegations.length,
        executionCount: params.executions.length
      })
      
      return calldata
    } catch (error) {
      console.error('[UserOp] Failed to build redeemDelegations calldata:', error)
      throw error
    }
  }
  
  /**
   * Build deposit calldata for protocol
   */
  private buildDepositCalldata(protocol: string, token: Address, amount: bigint): Hex {
    const protocolNorm = protocol.toLowerCase()
    const poolAddress = getPoolAddress(protocol, token.toString())
    
    if (protocolNorm.includes('aave')) {
      // Aave: supply(asset, amount, onBehalfOf, referralCode)
      return encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: 'supply',
        args: [token, amount, poolAddress, 0] // referralCode = 0
      })
    }
    
    if (protocolNorm.includes('yearn')) {
      // Yearn: deposit(amount, recipient)
      return encodeFunctionData({
        abi: YEARN_VAULT_ABI,
        functionName: 'deposit',
        args: [amount, poolAddress]
      })
    }
    
    if (protocolNorm.includes('nabla')) {
      // Nabla: addLiquidity(token, amount)
      return encodeFunctionData({
        abi: NABLA_POOL_ABI,
        functionName: 'addLiquidity',
        args: [token, amount]
      })
    }
    
    throw new Error(`Unsupported protocol for deposit: ${protocol}`)
  }
  
  /**
   * Build withdraw calldata for protocol
   */
  private buildWithdrawCalldata(protocol: string, token: Address, amount: bigint): Hex {
    const protocolNorm = protocol.toLowerCase()
    const poolAddress = getPoolAddress(protocol, token.toString())
    
    if (protocolNorm.includes('aave')) {
      // Aave: withdraw(asset, amount, to)
      return encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: 'withdraw',
        args: [token, amount, poolAddress]
      })
    }
    
    if (protocolNorm.includes('yearn')) {
      // Yearn: withdraw(shares, recipient, maxLoss)
      // maxLoss = 1 (0.01% = 1 basis point)
      return encodeFunctionData({
        abi: YEARN_VAULT_ABI,
        functionName: 'withdraw',
        args: [amount, poolAddress, 1n]
      })
    }
    
    if (protocolNorm.includes('nabla')) {
      // Nabla: removeLiquidity(shares, minAmount)
      // minAmount = 0 (no slippage protection for now)
      return encodeFunctionData({
        abi: NABLA_POOL_ABI,
        functionName: 'removeLiquidity',
        args: [amount, 0n]
      })
    }
    
    throw new Error(`Unsupported protocol for withdraw: ${protocol}`)
  }
  
  /**
   * Build swap calldata for protocol
   */
  private buildSwapCalldata(protocol: string, fromToken: Address, toToken: Address, amount: bigint): Hex {
    // Swaps are handled via Uniswap V2 Router (not individual protocol pools)
    // This is a simplified implementation
    // For production, should use proper DEX aggregator or routing
    
    throw new Error('Swap not implemented yet - use Uniswap V2 Router integration')
  }
}

export const userOperationService = new UserOperationService()
