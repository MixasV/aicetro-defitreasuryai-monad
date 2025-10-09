import { createPublicClient, createWalletClient, defineChain, getAddress, http, isAddress, type Hex, type PublicClient, type WalletClient } from 'viem'
import { privateKeyToAccount, type Account } from 'viem/accounts'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import type { EmergencyStopMode } from '../../types/ai'

const MONAD_TESTNET = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
})

const emergencyControllerAbi = [
  {
    type: 'function',
    name: 'pause',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'resume',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }]
  }
] as const

export interface EmergencyControllerActionResult {
  mode: EmergencyStopMode
  simulated: boolean
  txHash?: Hex
  reason?: string
}

interface ConfigurationStatus {
  configured: boolean
  issues: string[]
  controllerAddress?: Hex
}

interface EmergencyControllerState {
  paused: boolean
}

const normalizePrivateKey = (value: string | undefined): Hex | null => {
  if (value == null || value.trim() === '') {
    return null
  }

  const normalized = value.startsWith('0x') ? value : `0x${value}`
  if (!/^0x[0-9a-fA-F]+$/.test(normalized)) {
    return null
  }

  if (normalized.length !== 66) {
    return null
  }

  return normalized as Hex
}

class EmergencyControllerClient {
  private walletClient: WalletClient | null = null
  private publicClient: PublicClient | null = null
  private controllerAddress: Hex | null = null
  private signer: Account | null = null

  getConfigurationStatus (): ConfigurationStatus {
    const issues: string[] = []

    if (env.monadRpcUrl === '') {
      issues.push('MONAD_RPC_URL is missing')
    }

    const normalizedKey = normalizePrivateKey(env.deployerPrivateKey)
    if (normalizedKey == null) {
      issues.push('DEPLOYER_PRIVATE_KEY is missing or malformed')
    }

    if (env.emergencyControllerAddress === '') {
      issues.push('EMERGENCY_CONTROLLER_ADDRESS is missing')
    } else if (!isAddress(env.emergencyControllerAddress)) {
      issues.push('EMERGENCY_CONTROLLER_ADDRESS is not a valid address')
    }

    return {
      configured: issues.length === 0,
      issues,
      controllerAddress: issues.length === 0 ? getAddress(env.emergencyControllerAddress) : undefined
    }
  }

  async getStatus (): Promise<EmergencyControllerState | null> {
    const { configured } = this.getConfigurationStatus()
    if (!configured) {
      return null
    }

    const { publicClient, controllerAddress } = await this.ensureClients()
    try {
      const paused = await publicClient.readContract({
        address: controllerAddress,
        abi: emergencyControllerAbi,
        functionName: 'paused'
      })

      return { paused }
    } catch (error) {
      logger.warn({ err: error }, 'Failed to read emergency controller status')
      return null
    }
  }

  async pause (account: string): Promise<EmergencyControllerActionResult> {
    const config = this.getConfigurationStatus()
    if (!config.configured || config.controllerAddress == null) {
      return this.buildSimulatedResult(config.issues)
    }

    const { walletClient, publicClient, controllerAddress } = await this.ensureClients()

    try {
      const hash = await walletClient.writeContract({
        address: controllerAddress,
        abi: emergencyControllerAbi,
        functionName: 'pause',
        chain: MONAD_TESTNET,
        account: this.signer ?? walletClient.account ?? getAddress(account)
      })

      await publicClient.waitForTransactionReceipt({ hash })
      logger.info({ controllerAddress, hash, account }, 'Emergency stop executed on-chain')
      return {
        mode: 'executed',
        simulated: false,
        txHash: hash
      }
    } catch (error) {
      logger.error({ err: error, controllerAddress, account }, 'Emergency pause transaction failed')
      return {
        mode: 'skipped',
        simulated: true,
        reason: `Emergency controller pause failed: ${stringifyError(error)}`
      }
    }
  }

  async resume (account: string): Promise<EmergencyControllerActionResult> {
    const config = this.getConfigurationStatus()
    if (!config.configured || config.controllerAddress == null) {
      return this.buildSimulatedResult(config.issues)
    }

    const { walletClient, publicClient, controllerAddress } = await this.ensureClients()

    try {
      const hash = await walletClient.writeContract({
        address: controllerAddress,
        abi: emergencyControllerAbi,
        functionName: 'resume',
        chain: MONAD_TESTNET,
        account: this.signer ?? walletClient.account ?? getAddress(account)
      })

      await publicClient.waitForTransactionReceipt({ hash })
      logger.info({ controllerAddress, hash, account }, 'Emergency resume executed on-chain')
      return {
        mode: 'executed',
        simulated: false,
        txHash: hash
      }
    } catch (error) {
      logger.error({ err: error, controllerAddress, account }, 'Emergency resume transaction failed')
      return {
        mode: 'skipped',
        simulated: true,
        reason: `Emergency controller resume failed: ${stringifyError(error)}`
      }
    }
  }

  private buildSimulatedResult (issues: string[]): EmergencyControllerActionResult {
    const reason = issues.length > 0
      ? `Emergency controller not configured: ${issues.join(', ')}`
      : 'Emergency controller not configured.'

    logger.warn({ issues }, 'Emergency controller action simulated due to configuration issues')
    return {
      mode: 'simulated',
      simulated: true,
      reason
    }
  }

  private async ensureClients (): Promise<{ walletClient: WalletClient, publicClient: PublicClient, controllerAddress: Hex }> {
    if (this.walletClient != null && this.publicClient != null && this.controllerAddress != null && this.signer != null) {
      return {
        walletClient: this.walletClient,
        publicClient: this.publicClient,
        controllerAddress: this.controllerAddress
      }
    }

    const status = this.getConfigurationStatus()
    if (!status.configured || status.controllerAddress == null) {
      throw new Error('Emergency controller is not configured')
    }

    const privateKey = normalizePrivateKey(env.deployerPrivateKey)
    if (privateKey == null) {
      throw new Error('DEPLOYER_PRIVATE_KEY is missing or malformed')
    }

    const account = privateKeyToAccount(privateKey)
    const transport = http(env.monadRpcUrl)

    this.signer = account
    this.controllerAddress = status.controllerAddress
    this.walletClient = createWalletClient({
      account,
      chain: MONAD_TESTNET,
      transport
    })
    this.publicClient = createPublicClient({
      chain: MONAD_TESTNET,
      transport
    })

    return {
      walletClient: this.walletClient,
      publicClient: this.publicClient,
      controllerAddress: this.controllerAddress
    }
  }
}

const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export const emergencyControllerClient = new EmergencyControllerClient()
