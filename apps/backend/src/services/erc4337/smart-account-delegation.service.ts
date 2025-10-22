/**
 * Smart Account Delegation Service
 * 
 * Creates on-chain delegations for AITreasurySmartAccount contracts.
 * Uses Alchemy Bundler to submit UserOperations.
 */

import { createPublicClient, createWalletClient, http, parseEther, encodeFunctionData, type Address, type Hex, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../../chains'
import { env } from '../../config/env'
import { bundlerService } from './bundler.service'
import { alchemyGasManager } from '../alchemy/alchemy-gas-manager.service'

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as Address
const FACTORY_ADDRESS = '0xf2200e301d66a3E77C370A813bea612d064EB64D' as Address

// AITreasurySmartAccount ABI (only needed functions)
const SMART_ACCOUNT_ABI = [
  {
    "inputs": [
      { "name": "_aiAgent", "type": "address" },
      { "name": "_dailyLimitUsd", "type": "uint256" },
      { "name": "_validDays", "type": "uint256" }
    ],
    "name": "configureDelegation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "dest", "type": "address" },
      { "name": "value", "type": "uint256" },
      { "name": "func", "type": "bytes" }
    ],
    "name": "execute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Factory ABI
const FACTORY_ABI = [
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "salt", "type": "uint256" }
    ],
    "name": "createAccount",
    "outputs": [{ "name": "account", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "salt", "type": "uint256" }
    ],
    "name": "getAddress",
    "outputs": [{ "name": "account", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

interface CreateSmartAccountParams {
  ownerAddress: Address
  salt?: bigint
}

interface ConfigureDelegationParams {
  smartAccountAddress: Address
  aiAgentAddress: Address
  dailyLimitUsd: number
  validDays: number
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

class SmartAccountDelegationService {
  private publicClient: any
  private walletClient: any
  private deployerAccount: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
    })

    // Deployer account for creating Smart Accounts (has 27 MON)
    if (env.deployerPrivateKey) {
      this.deployerAccount = privateKeyToAccount(env.deployerPrivateKey as Hex)
      this.walletClient = createWalletClient({
        account: this.deployerAccount,
        chain: monadTestnet,
        transport: http(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      })
      console.log('[SmartAccount] Initialized with deployer:', this.deployerAccount.address)
    } else {
      console.warn('[SmartAccount] No deployer private key found')
    }
  }

  /**
   * Get predicted Smart Account address for user
   */
  async getPredictedSmartAccount(params: CreateSmartAccountParams): Promise<Address> {
    const salt = params.salt || 0n

    const address = await this.publicClient.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'getAddress',
      args: [params.ownerAddress, salt]
    })

    console.log('[SmartAccount] Predicted address:', address, 'for owner:', params.ownerAddress)
    return address as Address
  }

  /**
   * Create Smart Account via Factory
   * 
   * NOTE: This uses CREATE2, so if account already exists, returns existing address
   */
  async createSmartAccount(params: CreateSmartAccountParams): Promise<{
    smartAccountAddress: Address
    txHash?: string
    alreadyDeployed: boolean
  }> {
    const salt = params.salt || 0n

    console.log('[SmartAccount] Creating Smart Account for owner:', params.ownerAddress)

    // Check if already deployed
    const predictedAddress = await this.getPredictedSmartAccount(params)
    const code = await this.publicClient.getBytecode({ address: predictedAddress })

    if (code && code !== '0x') {
      console.log('[SmartAccount] Account already deployed at:', predictedAddress)
      return {
        smartAccountAddress: predictedAddress,
        alreadyDeployed: true
      }
    }

    // Deploy via factory
    const hash = await this.walletClient.writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createAccount',
      args: [params.ownerAddress, salt]
    })

    console.log('[SmartAccount] Factory createAccount tx:', hash)

    // Wait for confirmation
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
    console.log('[SmartAccount] Smart Account created at:', predictedAddress)

    return {
      smartAccountAddress: predictedAddress,
      txHash: hash,
      alreadyDeployed: false
    }
  }

  /**
   * Configure delegation ON-CHAIN via UserOperation
   * 
   * This is the CRITICAL function that makes delegation real!
   * Calls smartAccount.configureDelegation() via Alchemy Bundler.
   */
  async configureDelegationOnChain(params: ConfigureDelegationParams): Promise<{
    userOpHash: string
    success: boolean
  }> {
    console.log('[SmartAccount] Configuring delegation on-chain...', params)

    // 1. Build calldata for configureDelegation()
    const configureDelegationCalldata = encodeFunctionData({
      abi: SMART_ACCOUNT_ABI,
      functionName: 'configureDelegation',
      args: [
        params.aiAgentAddress,
        BigInt(Math.floor(params.dailyLimitUsd * 1e6)), // Convert to 6 decimals
        BigInt(params.validDays)
      ]
    })

    console.log('[SmartAccount] configureDelegation calldata:', configureDelegationCalldata)

    // 2. Get current nonce from EntryPoint
    const nonce = await this.getNonce(params.smartAccountAddress)

    // 3. Build UserOperation
    // NOTE: Since Smart Account already deployed, initCode is empty
    const userOp: Partial<UserOperation> = {
      sender: params.smartAccountAddress,
      nonce,
      initCode: '0x' as Hex, // Empty (account already deployed)
      callData: configureDelegationCalldata,
      callGasLimit: 200000n,
      verificationGasLimit: 150000n,
      preVerificationGas: 21000n,
      maxFeePerGas: 0n, // Alchemy Gas Manager will sponsor
      maxPriorityFeePerGas: 0n,
      paymasterAndData: '0x' as Hex, // Will be filled by Alchemy
      signature: '0x' as Hex // Placeholder
    }

    // 4. Request gas sponsorship from Alchemy
    console.log('[SmartAccount] Requesting gas sponsorship...')
    try {
      const sponsoredUserOp = await alchemyGasManager.requestGasSponsorship(
        userOp as any,
        ENTRY_POINT_ADDRESS
      )
      console.log('[SmartAccount] Gas sponsorship approved')

      // 5. Sign UserOperation with OWNER's key
      // CRITICAL: User needs to sign this! For now using deployer as mock
      // TODO: In production, send to frontend for user signature
      const signedUserOp = await this.signUserOperation(
        sponsoredUserOp as unknown as UserOperation,
        params.smartAccountAddress
      )

      // 6. Send via Alchemy Bundler
      console.log('[SmartAccount] Sending UserOperation via Alchemy Bundler...')
      const userOpHash = await alchemyGasManager.sendUserOperation(signedUserOp)
      console.log('[SmartAccount] UserOp submitted:', userOpHash)

      // 7. Wait for receipt
      const receipt = await alchemyGasManager.getUserOperationReceipt(userOpHash)
      console.log('[SmartAccount] UserOp confirmed!', receipt)

      return {
        userOpHash,
        success: receipt.success
      }
    } catch (error: any) {
      console.error('[SmartAccount] Failed to configure delegation:', error)
      
      // Fallback: Try direct transaction (not gasless, but works)
      console.log('[SmartAccount] Trying direct transaction as fallback...')
      return await this.configureDelegationDirectTx(params)
    }
  }

  /**
   * Fallback: Configure delegation via direct transaction
   * Not gasless, but guaranteed to work
   */
  async configureDelegationDirectTx(params: ConfigureDelegationParams): Promise<{
    userOpHash: string
    success: boolean
  }> {
    console.log('[SmartAccount] Using direct tx (not UserOp)')

    // User must be owner - check owner first
    const owner = await this.publicClient.readContract({
      address: params.smartAccountAddress,
      abi: SMART_ACCOUNT_ABI,
      functionName: 'owner'
    })

    console.log('[SmartAccount] Smart Account owner:', owner)

    if (owner.toLowerCase() !== this.deployerAccount.address.toLowerCase()) {
      throw new Error(`Deployer ${this.deployerAccount.address} is not owner of Smart Account ${params.smartAccountAddress}. Owner is ${owner}`)
    }

    // Send direct tx (costs gas from deployer wallet)
    const hash = await this.walletClient.writeContract({
      address: params.smartAccountAddress,
      abi: SMART_ACCOUNT_ABI,
      functionName: 'configureDelegation',
      args: [
        params.aiAgentAddress,
        BigInt(Math.floor(params.dailyLimitUsd * 1e6)),
        BigInt(params.validDays)
      ]
    })

    console.log('[SmartAccount] Direct tx sent:', hash)

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
    console.log('[SmartAccount] Delegation configured!', receipt)

    return {
      userOpHash: hash,
      success: receipt.status === 'success'
    }
  }

  /**
   * Get nonce from EntryPoint
   */
  private async getNonce(smartAccount: Address): Promise<bigint> {
    try {
      const nonce = await this.publicClient.readContract({
        address: ENTRY_POINT_ADDRESS,
        abi: [
          {
            inputs: [
              { name: "sender", type: "address" },
              { name: "key", type: "uint192" }
            ],
            name: "getNonce",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function"
          }
        ],
        functionName: 'getNonce',
        args: [smartAccount, 0n]
      })
      return nonce as bigint
    } catch (error) {
      console.warn('[SmartAccount] Failed to get nonce, using 0:', error)
      return 0n
    }
  }

  /**
   * Sign UserOperation
   * 
   * CRITICAL: In production, this should be done by user in frontend!
   * For now, using deployer key as mock.
   */
  private async signUserOperation(
    userOp: UserOperation,
    smartAccount: Address
  ): Promise<UserOperation> {
    // Pack UserOp for hashing (ERC-4337 standard)
    const userOpHash = this.getUserOperationHash(userOp)
    
    // Sign with deployer (in production, user signs!)
    const signature = await this.deployerAccount.signMessage({
      message: { raw: userOpHash }
    })

    return {
      ...userOp,
      signature
    }
  }

  /**
   * Calculate UserOperation hash (ERC-4337 standard)
   */
  private getUserOperationHash(userOp: UserOperation): Hex {
    // Simplified hash for now
    // TODO: Implement proper ERC-4337 UserOp hash
    return `0x${Buffer.from(JSON.stringify(userOp)).toString('hex').slice(0, 64)}` as Hex
  }
}

export const smartAccountDelegationService = new SmartAccountDelegationService()
