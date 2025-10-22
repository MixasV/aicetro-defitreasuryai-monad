/**
 * Bundler Service - Integration with Stackup or self-hosted bundler
 * 
 * This service handles UserOperation submission to a bundler for ERC-4337.
 * The bundler batches UserOperations and submits them to the EntryPoint contract.
 */

import axios from 'axios'
import { env } from '../../config/env'

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
const BUNDLER_URL = env.bundlerUrl || 'https://api.stackup.sh/v1/node'
const BUNDLER_API_KEY = env.bundlerApiKey

interface SendUserOperationResult {
  userOpHash: string
}

interface GetUserOperationReceiptResult {
  userOpHash: string
  sender: string
  nonce: bigint
  actualGasCost: bigint
  actualGasUsed: bigint
  success: boolean
  logs: any[]
  receipt: {
    transactionHash: string
    blockNumber: number
    blockHash: string
  }
}

class BundlerService {
  /**
   * Send UserOperation to bundler
   */
  async sendUserOperation(userOp: any): Promise<SendUserOperationResult> {
    console.log('[Bundler] Sending UserOperation to bundler...')
    
    if (!BUNDLER_API_KEY) {
      console.warn('[Bundler] No bundler API key configured - using mock')
      return {
        userOpHash: '0xmock' + Date.now().toString(16)
      }
    }
    
    try {
      // Convert BigInt to hex string for JSON serialization
      const serializedUserOp = {
        sender: userOp.sender,
        nonce: typeof userOp.nonce === 'bigint' ? `0x${userOp.nonce.toString(16)}` : userOp.nonce,
        initCode: userOp.initCode,
        callData: userOp.callData,
        callGasLimit: typeof userOp.callGasLimit === 'bigint' ? `0x${userOp.callGasLimit.toString(16)}` : userOp.callGasLimit,
        verificationGasLimit: typeof userOp.verificationGasLimit === 'bigint' ? `0x${userOp.verificationGasLimit.toString(16)}` : userOp.verificationGasLimit,
        preVerificationGas: typeof userOp.preVerificationGas === 'bigint' ? `0x${userOp.preVerificationGas.toString(16)}` : userOp.preVerificationGas,
        maxFeePerGas: typeof userOp.maxFeePerGas === 'bigint' ? `0x${userOp.maxFeePerGas.toString(16)}` : userOp.maxFeePerGas,
        maxPriorityFeePerGas: typeof userOp.maxPriorityFeePerGas === 'bigint' ? `0x${userOp.maxPriorityFeePerGas.toString(16)}` : userOp.maxPriorityFeePerGas,
        paymasterAndData: userOp.paymasterAndData,
        signature: userOp.signature
      }

      const response = await axios.post(
        BUNDLER_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_sendUserOperation',
          params: [serializedUserOp, ENTRY_POINT_ADDRESS]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BUNDLER_API_KEY}`
          },
          timeout: 30000
        }
      )
      
      if (response.data.error) {
        throw new Error(`Bundler error: ${response.data.error.message}`)
      }
      
      const userOpHash = response.data.result
      
      console.log('[Bundler] UserOperation sent:', { userOpHash })
      
      return { userOpHash }
      
    } catch (error: any) {
      console.error('[Bundler] Failed to send UserOperation:', error.message)
      throw new Error(`Failed to send UserOperation: ${error.message}`)
    }
  }
  
  /**
   * Get UserOperation receipt
   */
  async getUserOperationReceipt(userOpHash: string): Promise<GetUserOperationReceiptResult | null> {
    console.log('[Bundler] Getting UserOperation receipt...', { userOpHash })
    
    if (!BUNDLER_API_KEY) {
      console.warn('[Bundler] No bundler API key - returning mock receipt')
      return {
        userOpHash,
        sender: '0x0000000000000000000000000000000000000000',
        nonce: 0n,
        actualGasCost: 200000n,
        actualGasUsed: 180000n,
        success: true,
        logs: [],
        receipt: {
          transactionHash: '0xmock' + Date.now().toString(16),
          blockNumber: 1,
          blockHash: '0xmock'
        }
      }
    }
    
    try {
      const response = await axios.post(
        BUNDLER_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getUserOperationReceipt',
          params: [userOpHash]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BUNDLER_API_KEY}`
          },
          timeout: 10000
        }
      )
      
      if (response.data.error) {
        console.warn('[Bundler] Error getting receipt:', response.data.error.message)
        return null
      }
      
      return response.data.result
      
    } catch (error: any) {
      console.warn('[Bundler] Failed to get receipt:', error.message)
      return null
    }
  }
  
  /**
   * Wait for UserOperation to be included on-chain
   */
  async waitForUserOperationReceipt(
    userOpHash: string,
    timeoutMs: number = 300000 // 5 minutes
  ): Promise<GetUserOperationReceiptResult> {
    console.log('[Bundler] Waiting for UserOperation receipt...', { userOpHash, timeoutMs })
    
    const startTime = Date.now()
    const pollInterval = 5000 // 5 seconds
    
    while (Date.now() - startTime < timeoutMs) {
      const receipt = await this.getUserOperationReceipt(userOpHash)
      
      if (receipt) {
        console.log('[Bundler] UserOperation confirmed!', { 
          txHash: receipt.receipt.transactionHash,
          success: receipt.success
        })
        return receipt
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
    
    throw new Error(`UserOperation timeout - not confirmed after ${timeoutMs}ms`)
  }
  
  /**
   * Estimate UserOperation gas
   */
  async estimateUserOperationGas(userOp: any): Promise<{
    preVerificationGas: bigint
    verificationGasLimit: bigint
    callGasLimit: bigint
  }> {
    console.log('[Bundler] Estimating UserOperation gas...')
    
    if (!BUNDLER_API_KEY) {
      console.warn('[Bundler] No bundler API key - returning default estimates')
      return {
        preVerificationGas: 50000n,
        verificationGasLimit: 150000n,
        callGasLimit: 200000n
      }
    }
    
    try {
      const response = await axios.post(
        BUNDLER_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_estimateUserOperationGas',
          params: [userOp, ENTRY_POINT_ADDRESS]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BUNDLER_API_KEY}`
          },
          timeout: 30000
        }
      )
      
      if (response.data.error) {
        throw new Error(`Bundler error: ${response.data.error.message}`)
      }
      
      const estimate = response.data.result
      
      return {
        preVerificationGas: BigInt(estimate.preVerificationGas),
        verificationGasLimit: BigInt(estimate.verificationGasLimit),
        callGasLimit: BigInt(estimate.callGasLimit)
      }
      
    } catch (error: any) {
      console.warn('[Bundler] Gas estimation failed, using defaults:', error.message)
      return {
        preVerificationGas: 50000n,
        verificationGasLimit: 150000n,
        callGasLimit: 200000n
      }
    }
  }
  
  /**
   * Check bundler health
   */
  async healthCheck(): Promise<boolean> {
    console.log('[Bundler] Checking bundler health...')
    
    if (!BUNDLER_API_KEY) {
      console.warn('[Bundler] No bundler API key configured')
      return false
    }
    
    try {
      const response = await axios.post(
        BUNDLER_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_supportedEntryPoints'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BUNDLER_API_KEY}`
          },
          timeout: 5000
        }
      )
      
      const entryPoints = response.data.result || []
      const supportsOurEntryPoint = entryPoints.includes(ENTRY_POINT_ADDRESS)
      
      console.log('[Bundler] Health check result:', { 
        healthy: supportsOurEntryPoint,
        entryPoints
      })
      
      return supportsOurEntryPoint
      
    } catch (error: any) {
      console.error('[Bundler] Health check failed:', error.message)
      return false
    }
  }
}

export const bundlerService = new BundlerService()
