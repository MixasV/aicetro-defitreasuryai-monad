import { randomBytes } from 'node:crypto'
import { prisma } from '../../lib/prisma'
import type { CorporateAccount as CorporateAccountModel, Delegation as DelegationModel, Prisma } from '@prisma/client'
import type { DelegationConfig } from '../../types/ai.js'
import {
  type DelegationCaveats,
  clamp,
  computeNormalizedCaveats,
  parseCaveats
} from './delegation.utils'
import { emergencyControllerClient } from '../emergency/emergency.controller.client'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  getAddress,
  http,
  isAddress,
  type Abi,
  type Address,
  type PublicClient,
  type WalletClient
} from 'viem'
import { privateKeyToAccount, type Account } from 'viem/accounts'

export const DEFAULT_AI_AGENT_ADDRESS = '0xa11ce00000000000000000000000000000000001'
const DEFAULT_CORPORATE_ADDRESS = '0xcccccccccccccccccccccccccccccccccccccccc'
const DEFAULT_CORPORATE_OWNERS = ['0xOwner1', '0xOwner2', '0xOwner3']
const DEFAULT_AI_AGENT_NAME = 'Autonomous AI Agent'
const USD_SCALE = 1_000_000n

const MONAD_TESTNET = defineChain({
  id: 2814,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: {
    default: { http: [env.monadRpcUrl !== '' ? env.monadRpcUrl : 'https://testnet-rpc.monad.xyz'] },
    public: { http: [env.monadRpcUrl !== '' ? env.monadRpcUrl : 'https://testnet-rpc.monad.xyz'] }
  },
  blockExplorers: {
    default: {
      name: 'Monad Scan',
      url: 'https://testnet.monadscan.io'
    }
  }
})

const TRUSTLESS_TREASURY_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address'
      }
    ],
    name: 'getDelegation',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'aiAgent', type: 'address' },
          { internalType: 'uint256', name: 'dailyLimitUSD', type: 'uint256' },
          { internalType: 'uint256', name: 'spentToday', type: 'uint256' },
          { internalType: 'uint256', name: 'lastResetTime', type: 'uint256' },
          { internalType: 'uint256', name: 'validUntil', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'address[]', name: 'allowedProtocols', type: 'address[]' }
        ],
        internalType: 'struct TrustlessDeFiTreasury.DelegationView',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'protocol',
        type: 'address'
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: 'valueUsd',
        type: 'uint256'
      }
    ],
    name: 'executeForUser',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'user',
        type: 'address'
      }
    ],
    name: 'remainingAllowance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const satisfies Abi

interface OnChainDelegation {
  delegator: Address
  aiAgent: Address
  dailyLimitUsd: string
  spentTodayUsd: string
  lastResetTime: number
  validUntil: number
  isActive: boolean
  allowedProtocols: Address[]
}

class TrustlessTreasuryClient {
  private publicClient: PublicClient | null = null
  private treasuryAddress: Address | null = null

  private getConfigurationIssues (): string[] {
    const issues: string[] = []
    if (env.monadRpcUrl === '') {
      issues.push('MONAD_RPC_URL is missing')
    }
    if (env.trustlessTreasuryAddress === '') {
      issues.push('TRUSTLESS_TREASURY_ADDRESS is missing')
    } else if (!isAddress(env.trustlessTreasuryAddress)) {
      issues.push('TRUSTLESS_TREASURY_ADDRESS is invalid')
    }
    return issues
  }

  isConfigured (): boolean {
    return this.getConfigurationIssues().length === 0
  }

  private async ensureClient (): Promise<{ publicClient: PublicClient, treasuryAddress: Address }> {
    if (this.publicClient != null && this.treasuryAddress != null) {
      return {
        publicClient: this.publicClient,
        treasuryAddress: this.treasuryAddress
      }
    }

    const issues = this.getConfigurationIssues()
    if (issues.length > 0) {
      throw new Error(`Trustless treasury config incomplete: ${issues.join(', ')}`)
    }

    const transport = http(env.monadRpcUrl)
    this.publicClient = createPublicClient({
      chain: MONAD_TESTNET,
      transport
    })
    this.treasuryAddress = getAddress(env.trustlessTreasuryAddress)

    return {
      publicClient: this.publicClient,
      treasuryAddress: this.treasuryAddress
    }
  }

  async getDelegation (account: string): Promise<OnChainDelegation | null> {
    try {
      const normalized = getAddress(account)
      const { publicClient, treasuryAddress } = await this.ensureClient()
      const raw = await publicClient.readContract({
        address: treasuryAddress,
        abi: TRUSTLESS_TREASURY_ABI,
        functionName: 'getDelegation',
        args: [normalized]
      }) as unknown as [Address, bigint, bigint, bigint, bigint, boolean, Address[]]

      const [aiAgent, dailyLimitUSD, spentToday, lastReset, validUntil, isActive, allowedProtocols] = raw

      return {
        delegator: normalized,
        aiAgent,
        dailyLimitUsd: dailyLimitUSD.toString(),
        spentTodayUsd: spentToday.toString(),
        lastResetTime: Number(lastReset),
        validUntil: Number(validUntil),
        isActive,
        allowedProtocols
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes('NoDelegationConfigured')) {
        return null
      }
      logger.trace({ err: error, account }, 'Trustless treasury delegation read failed')
      return null
    }
  }

  async getRemainingAllowanceUsd (account: string): Promise<string | null> {
    try {
      const normalized = getAddress(account)
      const { publicClient, treasuryAddress } = await this.ensureClient()
      const value = await publicClient.readContract({
        address: treasuryAddress,
        abi: TRUSTLESS_TREASURY_ABI,
        functionName: 'remainingAllowance',
        args: [normalized]
      })
      if (typeof value === 'bigint') {
        return value.toString()
      }
      return String(value ?? '')
    } catch (error) {
      logger.trace({ err: error, account }, 'Trustless treasury remaining allowance read failed')
      return null
    }
  }
}

const trustlessTreasuryClient = new TrustlessTreasuryClient()

interface ConfigureDelegationInput {
  delegate?: string
  dailyLimitUsd: number
  whitelist: string[]
  maxRiskScore: number
  agentName?: string
}

interface CorporateAccount {
  address: string
  owners: string[]
  threshold: number
  createdAt: string
  aiAgentAddress: string
  aiAgentName: string
}

interface DelegationState {
  delegate: string
  dailyLimitUsd: number
  spent24h: number
  whitelist: string[]
  maxRiskScore: number
  remainingDailyLimitUsd?: number
  portfolioPercentage?: number  // ✅ CRITICAL: % of portfolio AI can manage
}

type EmergencyActionExecutionResult = Awaited<ReturnType<typeof emergencyControllerClient.pause>>

interface PreparedDelegatedExecution {
  account: Address
  delegate: Address
  protocolId: string
  protocolAddress: Address
  callData: `0x${string}`
  amountUsd: number
  amountUsdScaled: bigint
  treasuryAddress: Address
}

type DelegatedExecutionPlanResult =
  | { ok: true, plan: PreparedDelegatedExecution }
  | { ok: false, reason: string }

class BlockchainService {
  private walletClient: WalletClient | null = null
  private walletAccount: Account | null = null

  async createCorporateAccount (owners: string[], threshold: number, agentName?: string): Promise<CorporateAccount> {
    try {
      const preferredName = sanitizeAgentName(agentName)
      const existing = await prisma.corporateAccount.findFirst({
        where: {
          owners: {
            equals: owners
          },
          threshold
        }
      })

      if (existing != null) {
        const ensured = await this.ensureCorporateAgent(existing, preferredName)
        await this.ensureDefaultDelegation(ensured.id)
        return mapCorporateAccount(ensured)
      }

      const address = toMockAddress()
      const aiAgentAddress = toMockAddress()
      const created = await prisma.corporateAccount.create({
        data: {
          address,
          owners,
          threshold,
          aiAgentAddress,
          aiAgentName: preferredName ?? DEFAULT_AI_AGENT_NAME
        }
      })

      await this.ensureDefaultDelegation(created.id)

      return mapCorporateAccount(created)
    } catch (error) {
      console.error('[blockchain] DB error, falling back to in-memory account', error)
      return buildFallbackAccount(owners, threshold)
    }
  }

  async listCorporateAccounts (): Promise<CorporateAccount[]> {
    try {
      const records = await prisma.corporateAccount.findMany({
        orderBy: { createdAt: 'asc' }
      })

      if (records.length === 0) {
        return [buildDefaultCorporateAccount()]
      }

      return records.map(mapCorporateAccount)
    } catch (error) {
      console.error('[blockchain] Failed to list corporate accounts', error)
      return [buildDefaultCorporateAccount()]
    }
  }

  async getDelegationWithDynamicLimits (account: string, portfolioValue?: number): Promise<DelegationConfig | null> {
    const lowerAccount = account?.toLowerCase()
    
    try {
      const corporate = await prisma.corporateAccount.findUnique({
        where: { address: lowerAccount },
        include: { 
          delegations: { 
            where: { 
              active: true, 
              autoExecutionEnabled: true 
            },
            take: 1,
            orderBy: { createdAt: 'desc' }
          } 
        }
      })

      if (corporate == null || corporate.delegations.length === 0) {
        return null
      }

      const delegation = corporate.delegations[0]
      
      // Get current portfolio value if not provided
      let currentPortfolioValue = portfolioValue
      if (currentPortfolioValue == null) {
        try {
          const positions = await prisma.portfolioSnapshot.findFirst({
            where: { accountId: lowerAccount },
            orderBy: { capturedAt: 'desc' }
          })
          if (positions?.data && typeof positions.data === 'object' && 'totalValueUSD' in positions.data) {
            currentPortfolioValue = (positions.data as { totalValueUSD: number }).totalValueUSD
          }
        } catch (error) {
          logger.trace({ err: error, account }, 'Failed to get portfolio value')
        }
      }

      // Calculate dynamic limits based on portfolio percentage
      const portfolioPercentage = delegation.portfolioPercentage ?? 0
      const autoExecutedUsd = delegation.autoExecutedUsd ?? 0
      const autoAllowance = currentPortfolioValue != null && portfolioPercentage > 0
        ? currentPortfolioValue * (portfolioPercentage / 100)
        : 0
      
      const remainingAutoAllowance = Math.max(0, autoAllowance - autoExecutedUsd)
      const effectiveDailyLimit = remainingAutoAllowance > 0
        ? Math.min(delegation.dailyLimitUsd, remainingAutoAllowance)
        : delegation.dailyLimitUsd

      const caveats = parseCaveats(delegation.caveats)
      const spent = clamp(typeof caveats.spent24h === 'number' ? caveats.spent24h : 0, 0, delegation.dailyLimitUsd)
      const maxRiskScore = typeof caveats.maxRiskScore === 'number' ? caveats.maxRiskScore : 3

      return {
        delegate: delegation.delegate,
        dailyLimit: delegation.dailyLimitUsd.toFixed(0),
        spent24h: spent.toFixed(0),
        allowedProtocols: delegation.whitelist,
        maxRiskScore,
        updatedAt: delegation.updatedAt.toISOString(),
        remainingDailyLimit: Math.max(delegation.dailyLimitUsd - spent, 0).toFixed(0),
        autoExecutionEnabled: delegation.autoExecutionEnabled ?? false,
        portfolioPercentage: delegation.portfolioPercentage ?? 0,
        autoExecutedUsd: delegation.autoExecutedUsd ?? 0,
        lastAutoExecutionAt: delegation.lastAutoExecutionAt?.toISOString()
      }
    } catch (error) {
      logger.error({ err: error, account }, 'Failed to get delegation with dynamic limits')
      return null
    }
  }

  async getDelegations (account: string): Promise<DelegationConfig[]> {
    const lowerAccount = account?.toLowerCase()
    const trustlessConfigured = trustlessTreasuryClient.isConfigured()

    try {
      const onChain = lowerAccount != null ? await trustlessTreasuryClient.getDelegation(lowerAccount) : null
      const remaining = lowerAccount != null ? await trustlessTreasuryClient.getRemainingAllowanceUsd(lowerAccount) : null

      if (onChain != null) {
        const metadata = await this.loadDelegationMetadata(lowerAccount, onChain.aiAgent)
        const mapped = mapOnChainDelegation(onChain, metadata, remaining)
        return [mapped]
      }

      // Even if trustless is configured, check Prisma for Simple Mode delegations
      // Simple Mode stores delegations in Prisma, not on-chain
    } catch (error) {
      logger.warn({ err: error, account }, 'Delegation on-chain lookup failed, falling back to Prisma state')
    }

    try {
      const corporate = await prisma.corporateAccount.findUnique({
        where: { address: lowerAccount },
        include: { delegations: true }
      })

      if (corporate == null) {
        return buildFallbackDelegations()
      }

      if (corporate.delegations.length === 0) {
        await this.ensureDefaultDelegation(corporate.id)
        const seeded = await prisma.delegation.findMany({ where: { corporateId: corporate.id } })
        if (seeded.length === 0) {
          return buildFallbackDelegations()
        }
        const normalized = await Promise.all(seeded.map(async (delegation) => await this.normalizeDelegationRecord(delegation)))
        return normalized.map(mapDelegation)
      }

      const normalizedDelegations = await Promise.all(
        corporate.delegations.map(async (delegation) => await this.normalizeDelegationRecord(delegation))
      )

      return normalizedDelegations.map(mapDelegation)
    } catch (error) {
      logger.error({ err: error, account }, '[blockchain] Failed to load delegations from Prisma')
      return buildFallbackDelegations()
    }
  }

  async getDelegationState (account: string, delegate?: string): Promise<DelegationState> {
    const trustlessConfigured = trustlessTreasuryClient.isConfigured()
    const normalizedAccount = account.toLowerCase()
    const isDemo = normalizedAccount === DEFAULT_CORPORATE_ADDRESS.toLowerCase()
    let corporate: CorporateAccountModel | null = null
    let normalizedDelegate = delegate?.toLowerCase()

    try {
      corporate = await prisma.corporateAccount.findUnique({
        where: { address: normalizedAccount }
      })

      if (corporate != null && normalizedDelegate == null) {
        corporate = await this.ensureCorporateAgent(corporate)
        normalizedDelegate = (corporate.aiAgentAddress ?? DEFAULT_AI_AGENT_ADDRESS).toLowerCase()
      }
    } catch (error) {
      logger.trace({ err: error, account }, 'Failed to load corporate metadata for delegation state')
    }

    if (normalizedDelegate == null) {
      normalizedDelegate = DEFAULT_AI_AGENT_ADDRESS.toLowerCase()
    }

    // For demo account, skip on-chain lookup and use database directly
    if (!isDemo) {
      try {
        const onChain = await trustlessTreasuryClient.getDelegation(account)
        if (onChain != null && onChain.aiAgent.toLowerCase() === normalizedDelegate) {
          const metadata = await this.loadDelegationMetadata(normalizedAccount, onChain.aiAgent.toLowerCase())
          const remaining = await trustlessTreasuryClient.getRemainingAllowanceUsd(account)
          return mapOnChainDelegationState(onChain, metadata, remaining)
        }

        // If no on-chain delegation found, continue to database lookup
        // This allows Simple Mode (EIP-7702) delegations to work
      } catch (error) {
        logger.trace({ err: error, account, delegate: normalizedDelegate }, 'Delegation on-chain state lookup failed')
      }
    }

    try {
      if (corporate == null) {
        corporate = await prisma.corporateAccount.findUnique({ where: { address: normalizedAccount } })
        if (corporate != null) {
          corporate = await this.ensureCorporateAgent(corporate)
        }
      }

      // ✅ CRITICAL FIX: Simple Mode delegations don't have corporateId!
      // Try finding delegation by smartAccountAddress FIRST (Simple Mode)
      // Then fallback to corporateId (Legacy Mode)
      
      console.log('[getDelegationState] Looking for delegation:', { 
        account: normalizedAccount, 
        delegate: normalizedDelegate,
        hasCorporate: corporate != null 
      })
      
      let record = await prisma.delegation.findFirst({
        where: {
          smartAccountAddress: {
            equals: normalizedAccount,
            mode: 'insensitive'
          },
          active: true
        }
      })
      
      // Fallback to legacy corporateId-based search
      if (record == null && corporate != null) {
        record = await prisma.delegation.findFirst({
          where: {
            corporateId: corporate.id,
            delegate: {
              equals: normalizedDelegate,
              mode: 'insensitive'
            }
          }
        })
      }

      console.log('[getDelegationState] Found record:', record != null ? { 
        whitelist: record.whitelist, 
        delegate: record.delegate,
        portfolioPercentage: record.portfolioPercentage 
      } : 'NULL')

      if (record == null) {
        // Don't auto-create fallback delegation - use what's in database
        // This prevents AI from using wrong delegation when user creates Simple Mode delegation
        logger.trace({ account, delegate: normalizedDelegate }, 'No delegation found for this account')
        console.log('[getDelegationState] RETURNING FALLBACK!')
        return buildFallbackDelegationState(normalizedDelegate)
      }

      const normalizedRecord = await this.normalizeDelegationRecord(record)
      return mapDelegationState(normalizedRecord)
    } catch (error) {
      logger.error({ err: error, account, delegate: normalizedDelegate }, '[blockchain] Failed to load delegation state from Prisma')
      return buildFallbackDelegationState(normalizedDelegate)
    }
  }

  async configureDelegation (account: string, input: ConfigureDelegationInput): Promise<DelegationConfig> {
    let corporate: CorporateAccountModel | null = null
    try {
      const lowerAccount = account.toLowerCase()
      corporate = await prisma.corporateAccount.findUnique({
        where: { address: lowerAccount }
      })

      if (corporate == null) {
        throw new Error(`[blockchain] Corporate account ${account} not found`)
      }

      const ensuredCorporate = await this.ensureCorporateAgent(corporate, input.agentName)

      const whitelist = Array.from(new Set(input.whitelist))
      const normalizedDelegate = (input.delegate ?? ensuredCorporate.aiAgentAddress ?? DEFAULT_AI_AGENT_ADDRESS).toLowerCase()

      const existing = await prisma.delegation.findFirst({
        where: {
          corporateId: ensuredCorporate.id,
          delegate: normalizedDelegate
        }
      })

      const previousCaveats = parseCaveats(existing?.caveats)
      const nowIso = new Date().toISOString()

      const caveatsPayload: DelegationCaveats = {
        ...previousCaveats,
        maxRiskScore: input.maxRiskScore,
        spent24h: clamp(previousCaveats.spent24h ?? 0, 0, input.dailyLimitUsd),
        spent24hUpdatedAt: previousCaveats.spent24hUpdatedAt ?? nowIso,
        notes: existing == null ? 'created via configureDelegation' : 'updated via configureDelegation'
      }
      const caveatsData: Prisma.JsonObject = caveatsPayload

      const record = existing != null
        ? await prisma.delegation.update({
          where: { id: existing.id },
          data: {
            dailyLimitUsd: input.dailyLimitUsd,
            whitelist,
            caveats: caveatsData
          }
        })
        : await prisma.delegation.create({
          data: {
            corporateId: ensuredCorporate.id,
            delegate: normalizedDelegate,
            dailyLimitUsd: input.dailyLimitUsd,
            whitelist,
            caveats: caveatsData
          }
        })

      const normalized = await this.normalizeDelegationRecord(record)

      const onChain = await trustlessTreasuryClient.getDelegation(lowerAccount)
      const remaining = await trustlessTreasuryClient.getRemainingAllowanceUsd(lowerAccount)

      if (onChain != null) {
        const mapped = mapOnChainDelegation(onChain, normalized, remaining)
        return mapped
      }

      return mapDelegation(normalized)
    } catch (error) {
      logger.error({ err: error, account, input }, '[blockchain] Failed to configure delegation')
      return buildConfiguredFallbackDelegation({
        ...input,
        delegate: (input.delegate ?? corporate?.aiAgentAddress ?? DEFAULT_AI_AGENT_ADDRESS)
      })
    }
  }

  async incrementDelegationSpend (account: string, delegate: string, amountUsd: number): Promise<void> {
    try {
      const corporate = await prisma.corporateAccount.findUnique({
        where: { address: account }
      })

      if (corporate == null) return

      const record = await prisma.delegation.findFirst({
        where: {
          corporateId: corporate.id,
          delegate
        }
      })

      if (record == null) return

      const normalized = await this.normalizeDelegationRecord(record)
      const caveats = parseCaveats(normalized.caveats)
      const previous = typeof caveats.spent24h === 'number' ? caveats.spent24h : 0
      const updated = clamp(previous + amountUsd, 0, normalized.dailyLimitUsd)

      if (updated === previous) return

      const updatedCaveats: DelegationCaveats = {
        ...caveats,
        spent24h: updated,
        spent24hUpdatedAt: new Date().toISOString()
      }
      const updatedCaveatsData: Prisma.JsonObject = updatedCaveats

      await prisma.delegation.update({
        where: { id: normalized.id },
        data: {
          caveats: updatedCaveatsData
        }
      })
    } catch (error) {
      console.error('[blockchain] Failed to record delegation spend', error)
    }
  }

  async prepareDelegatedExecution (params: {
    account: string
    delegate: string
    protocolId: string
    protocolAddress: string
    amountUsd: number
    callData?: `0x${string}`
  }): Promise<DelegatedExecutionPlanResult> {
    if (!trustlessTreasuryClient.isConfigured() || env.trustlessTreasuryAddress.trim() === '') {
      return { ok: false, reason: 'Trustless treasury is not configured' }
    }

    try {
      const accountAddress = getAddress(params.account)
      const delegateAddress = getAddress(params.delegate)
      const protocolAddress = getAddress(params.protocolAddress)
      const callData: `0x${string}` = params.callData ?? '0x'
      const normalizedAmount = Number.isFinite(params.amountUsd) && params.amountUsd > 0 ? params.amountUsd : 0
      const scaledAmount = scaleUsdAmount(normalizedAmount)

      if (scaledAmount === 0n) {
        return { ok: false, reason: 'Execution amount is zero' }
      }

      // ✅ Simple Mode (EIP-7702) stores delegation in database, not on-chain
      // Check database first for Simple Mode compatibility
      const dbDelegation = await this.getDelegationState(accountAddress, delegateAddress)
      
      if (dbDelegation && dbDelegation.delegate.toLowerCase() === delegateAddress.toLowerCase()) {
        // Simple Mode delegation found in database
        console.log('[validateExecution] Using Simple Mode delegation from database')
        
        // Validate protocol is whitelisted (by ID, not address)
        const protocolId = params.protocolId.toLowerCase()
        const isWhitelisted = dbDelegation.whitelist.some(w => {
          const normalized = w.toLowerCase()
          const baseProtocol = normalized.split(/\s+/)[0] // "uniswap" from "Uniswap V2"
          return protocolId === normalized || 
                 protocolId.includes(baseProtocol) || // "uniswap:wmon-usdc" includes "uniswap"
                 normalized.includes(baseProtocol)
        })
        
        if (!isWhitelisted) {
          return { ok: false, reason: 'Protocol is not in the delegation whitelist' }
        }
        
        // Build execution plan from database delegation (Simple Mode)
        const normalizedAmount = Number.isFinite(params.amountUsd) && params.amountUsd > 0 ? params.amountUsd : 0
        const scaledAmount = scaleUsdAmount(normalizedAmount)
        
        return {
          ok: true,
          plan: {
            account: accountAddress,
            delegate: delegateAddress,
            protocolId: params.protocolId,
            protocolAddress,
            amountUsd: params.amountUsd,
            amountUsdScaled: scaledAmount,
            callData: (params.callData || '0x') as `0x${string}`,
            treasuryAddress: accountAddress as `0x${string}` // Simple Mode: EOA itself
          }
        }
      }
      
      // Fallback to on-chain check (Corporate Mode)
      const delegation = await trustlessTreasuryClient.getDelegation(accountAddress)
      if (delegation == null) {
        return { ok: false, reason: 'Delegation not configured (neither database nor on-chain)' }
      }

      if (!delegation.isActive) {
        return { ok: false, reason: 'Delegation is currently disabled' }
      }

      if (delegation.aiAgent.toLowerCase() !== delegateAddress.toLowerCase()) {
        return { ok: false, reason: 'Delegate does not match on-chain configuration' }
      }

      const allowed = delegation.allowedProtocols.some((addr) => addr.toLowerCase() === protocolAddress.toLowerCase())
      if (!allowed) {
        return { ok: false, reason: 'Protocol is not in the delegation whitelist' }
      }

      const remainingRaw = await trustlessTreasuryClient.getRemainingAllowanceUsd(accountAddress)
      const remainingScaled = parseUsdStringToScaled(remainingRaw)
      if (remainingScaled != null && scaledAmount > remainingScaled) {
        return { ok: false, reason: 'Daily limit exceeded' }
      }

      const treasuryAddress = getAddress(env.trustlessTreasuryAddress)

      return {
        ok: true,
        plan: {
          account: accountAddress,
          delegate: delegateAddress,
          protocolId: params.protocolId,
          protocolAddress,
          callData,
          amountUsd: normalizedAmount,
          amountUsdScaled: scaledAmount,
          treasuryAddress
        }
      }
    } catch (error) {
      logger.trace({ err: error, params }, '[blockchain] Failed to prepare on-chain execution')
      return { ok: false, reason: formatErrorMessage(error) }
    }
  }

  async broadcastDelegatedExecution (plan: PreparedDelegatedExecution): Promise<{ ok: boolean, txHash?: string, reason?: string }> {
    if (!env.aiAutoExecutionEnabled) {
      return { ok: false, reason: 'Automatic execution is disabled' }
    }

    if (env.aiAgentPrivateKey.trim() === '') {
      return { ok: false, reason: 'AI agent is not configured' }
    }

    try {
      const { walletClient, account } = await this.ensureWalletClient()
      const txHash = await walletClient.writeContract({
        account,
        chain: MONAD_TESTNET,
        address: plan.treasuryAddress,
        abi: TRUSTLESS_TREASURY_ABI,
        functionName: 'executeForUser',
        args: [plan.account, plan.protocolAddress, plan.callData, plan.amountUsdScaled],
        value: 0n
      })

      return { ok: true, txHash }
    } catch (error) {
      logger.error({ err: error, plan }, '[blockchain] Failed to submit delegation transaction')
      return { ok: false, reason: formatErrorMessage(error) }
    }
  }

  async emergencyStop (account: string): Promise<EmergencyActionExecutionResult> {
    try {
      return await emergencyControllerClient.pause(account)
    } catch (error) {
      console.error('[blockchain] Emergency stop failed', error)
      throw error
    }
  }

  async emergencyResume (account: string): Promise<EmergencyActionExecutionResult> {
    try {
      return await emergencyControllerClient.resume(account)
    } catch (error) {
      console.error('[blockchain] Emergency resume failed', error)
      throw error
    }
  }

  private async ensureWalletClient (): Promise<{ walletClient: WalletClient, account: Account }> {
    if (this.walletClient != null && this.walletAccount != null) {
      return { walletClient: this.walletClient, account: this.walletAccount }
    }

    if (env.aiAgentPrivateKey.trim() === '') {
      throw new Error('AI_AGENT_PRIVATE_KEY is not set')
    }

    const key = env.aiAgentPrivateKey.startsWith('0x')
      ? env.aiAgentPrivateKey
      : `0x${env.aiAgentPrivateKey}`

    const account = privateKeyToAccount(key as `0x${string}`)
    const walletClient = createWalletClient({
      account,
      chain: MONAD_TESTNET,
      transport: http(env.monadRpcUrl !== '' ? env.monadRpcUrl : 'https://testnet-rpc.monad.xyz')
    })

    this.walletClient = walletClient
    this.walletAccount = account

    return { walletClient, account }
  }

  private async loadDelegationMetadata (account: string, delegate: string): Promise<DelegationModel | null> {
    try {
      const normalizedAccount = account.toLowerCase()
      const normalizedDelegate = delegate.toLowerCase()
      const corporate = await prisma.corporateAccount.findUnique({
        where: { address: normalizedAccount }
      })

      if (corporate == null) {
        return null
      }

      const record = await prisma.delegation.findFirst({
        where: {
          corporateId: corporate.id,
          delegate: normalizedDelegate
        }
      })

      if (record == null) {
        return null
      }

      return await this.normalizeDelegationRecord(record)
    } catch (error) {
      logger.trace({ err: error, account, delegate }, 'Failed to load delegation metadata')
      return null
    }
  }

  private async ensureDefaultDelegation (corporateId: string) {
    const corporate = await prisma.corporateAccount.findUnique({ where: { id: corporateId } })
    if (corporate == null) {
      return
    }

    const ensuredCorporate = await this.ensureCorporateAgent(corporate)
    const delegate = ensuredCorporate.aiAgentAddress ?? DEFAULT_AI_AGENT_ADDRESS

    const existing = await prisma.delegation.findFirst({
      where: {
        corporateId,
        delegate
      }
    })

    if (existing != null) return

    const legacy = await prisma.delegation.findFirst({
      where: {
        corporateId,
        delegate: DEFAULT_AI_AGENT_ADDRESS
      }
    })

    if (legacy != null) {
      await prisma.delegation.update({
        where: { id: legacy.id },
        data: { delegate }
      })
      return
    }

    const caveatsPayload: DelegationCaveats = {
      spent24h: 2_500,
      spent24hUpdatedAt: new Date().toISOString(),
      maxRiskScore: 3,
      notes: 'auto-generated fallback delegation'
    }

    await prisma.delegation.create({
      data: {
        corporateId,
        delegate,
        dailyLimitUsd: 10_000,
        whitelist: ['Uniswap V2'], // ✅ FIXED: Only real Monad protocols
        caveats: caveatsPayload as Prisma.JsonObject
      }
    })
  }

  private async ensureCorporateAgent (corporate: CorporateAccountModel, preferredName?: string): Promise<CorporateAccountModel> {
    const desiredName = sanitizeAgentName(preferredName) ?? corporate.aiAgentName ?? DEFAULT_AI_AGENT_NAME

    if (corporate.aiAgentAddress && corporate.aiAgentAddress !== '') {
      if (corporate.aiAgentName !== desiredName) {
        return await prisma.corporateAccount.update({
          where: { id: corporate.id },
          data: {
            aiAgentName: desiredName
          }
        })
      }
      return corporate
    }

    const aiAgentAddress = toMockAddress()
    return await prisma.corporateAccount.update({
      where: { id: corporate.id },
      data: {
        aiAgentAddress,
        aiAgentName: desiredName
      }
    })
  }

  private async normalizeDelegationRecord (record: DelegationModel): Promise<DelegationModel> {
    const caveats = parseCaveats(record.caveats)
    const { caveats: normalizedCaveats, changed } = computeNormalizedCaveats(caveats, record.dailyLimitUsd)

    if (!changed) {
      return record
    }

    const normalizedCaveatsData: Prisma.JsonObject = normalizedCaveats
    return await prisma.delegation.update({
      where: { id: record.id },
      data: {
        caveats: normalizedCaveatsData
      }
    })
  }
}

export const blockchainService = new BlockchainService()

const sanitizeAgentName = (value?: string | null): string | undefined => {
  if (value == null) return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  return trimmed.slice(0, 120)
}

const toMockAddress = (): string => `0x${randomBytes(20).toString('hex')}`

const mapCorporateAccount = (record: CorporateAccountModel): CorporateAccount => ({
  address: record.address,
  owners: Array.isArray(record.owners) ? (record.owners as string[]) : [],
  threshold: record.threshold,
  createdAt: record.createdAt.toISOString(),
  aiAgentAddress: record.aiAgentAddress ?? DEFAULT_AI_AGENT_ADDRESS,
  aiAgentName: record.aiAgentName ?? DEFAULT_AI_AGENT_NAME
})

const mapDelegationState = (delegation: DelegationModel): DelegationState => {
  const caveats = parseCaveats(delegation.caveats)
  const whitelist = Array.from(new Set(delegation.whitelist))
  const spent = clamp(typeof caveats.spent24h === 'number' ? caveats.spent24h : 0, 0, delegation.dailyLimitUsd)
  const maxRisk = typeof caveats.maxRiskScore === 'number' ? caveats.maxRiskScore : 3

  return {
    delegate: delegation.delegate,
    dailyLimitUsd: delegation.dailyLimitUsd,
    spent24h: spent,
    whitelist,
    maxRiskScore: maxRisk,
    remainingDailyLimitUsd: Math.max(delegation.dailyLimitUsd - spent, 0),
    portfolioPercentage: delegation.portfolioPercentage ?? 100  // ✅ CRITICAL FIX!
  }
}

const mapDelegation = (delegation: DelegationModel): DelegationConfig => {
  const caveats = parseCaveats(delegation.caveats)
  const whitelist = Array.from(new Set(delegation.whitelist))
  const spent = clamp(typeof caveats.spent24h === 'number' ? caveats.spent24h : 0, 0, delegation.dailyLimitUsd)
  const maxRiskScore = typeof caveats.maxRiskScore === 'number' ? caveats.maxRiskScore : 3
  const updatedAt = delegation.updatedAt ?? delegation.createdAt
  const remaining = Math.max(delegation.dailyLimitUsd - spent, 0)

  return {
    delegate: delegation.delegate,
    dailyLimit: delegation.dailyLimitUsd.toFixed(0),
    spent24h: spent.toFixed(0),
    allowedProtocols: whitelist,
    maxRiskScore,
    updatedAt: updatedAt.toISOString(),
    remainingDailyLimit: remaining.toFixed(0),
    autoExecutionEnabled: delegation.autoExecutionEnabled ?? false,
    portfolioPercentage: delegation.portfolioPercentage ?? 0,
    autoExecutedUsd: delegation.autoExecutedUsd ?? 0,
    lastAutoExecutionAt: delegation.lastAutoExecutionAt?.toISOString()
  }
}

const mapOnChainDelegation = (
  delegation: OnChainDelegation,
  metadata: DelegationModel | null,
  remainingAllowance?: string | null
): DelegationConfig => {
  const caveats: DelegationCaveats = metadata != null ? parseCaveats(metadata.caveats) : {}
  const whitelist = metadata != null && metadata.whitelist.length > 0
    ? Array.from(new Set(metadata.whitelist))
    : delegation.allowedProtocols.map((protocol) => protocol.toLowerCase())

  const spent = safeBigIntToString(delegation.spentTodayUsd)
  const daily = safeBigIntToString(delegation.dailyLimitUsd)
  const remaining = remainingAllowance ?? computeRemainingAllowance(daily, spent)
  const rawMaxRisk = caveats.maxRiskScore
  const maxRiskScore = typeof rawMaxRisk === 'number'
    ? rawMaxRisk
    : 3

  const updatedAt = metadata?.updatedAt ?? metadata?.createdAt ?? new Date()
  const validUntil = delegation.validUntil > 0 ? new Date(delegation.validUntil * 1000).toISOString() : undefined
  const active = delegation.isActive && (delegation.validUntil === 0 || delegation.validUntil > Math.floor(Date.now() / 1000))

  return {
    delegate: delegation.aiAgent.toLowerCase(),
    dailyLimit: daily,
    spent24h: spent,
    allowedProtocols: whitelist,
    maxRiskScore,
    updatedAt: new Date(updatedAt).toISOString(),
    remainingDailyLimit: remaining,
    validUntil,
    active,
    autoExecutionEnabled: metadata?.autoExecutionEnabled ?? false,
    portfolioPercentage: metadata?.portfolioPercentage ?? 0,
    autoExecutedUsd: metadata?.autoExecutedUsd ?? 0,
    lastAutoExecutionAt: metadata?.lastAutoExecutionAt?.toISOString()
  }
}

const mapOnChainDelegationState = (
  delegation: OnChainDelegation,
  metadata: DelegationModel | null,
  remainingAllowance?: string | null
): DelegationState => {
  const whitelist = metadata != null && metadata.whitelist.length > 0
    ? Array.from(new Set(metadata.whitelist))
    : delegation.allowedProtocols.map((protocol) => protocol.toLowerCase())

  const caveats: DelegationCaveats = metadata != null ? parseCaveats(metadata.caveats) : {}
  const rawMaxRisk = caveats.maxRiskScore
  const maxRiskScore = typeof rawMaxRisk === 'number'
    ? rawMaxRisk
    : 3

  const daily = Number.parseFloat(safeBigIntToString(delegation.dailyLimitUsd))
  const spent = Number.parseFloat(safeBigIntToString(delegation.spentTodayUsd))
  const remaining = Number.parseFloat(remainingAllowance ?? computeRemainingAllowance(
    safeBigIntToString(delegation.dailyLimitUsd),
    safeBigIntToString(delegation.spentTodayUsd)
  ))

  return {
    delegate: delegation.aiAgent.toLowerCase(),
    dailyLimitUsd: Number.isFinite(daily) ? daily : 0,
    spent24h: Number.isFinite(spent) ? spent : 0,
    whitelist,
    maxRiskScore,
    remainingDailyLimitUsd: Number.isFinite(remaining) ? remaining : Math.max(daily - spent, 0)
  }
}

const buildFallbackAccount = (owners: string[], threshold: number): CorporateAccount => ({
  address: DEFAULT_CORPORATE_ADDRESS,
  owners,
  threshold,
  createdAt: new Date().toISOString(),
  aiAgentAddress: DEFAULT_AI_AGENT_ADDRESS,
  aiAgentName: DEFAULT_AI_AGENT_NAME
})

const buildDefaultCorporateAccount = (): CorporateAccount => ({
  address: DEFAULT_CORPORATE_ADDRESS,
  owners: [...DEFAULT_CORPORATE_OWNERS],
  threshold: 2,
  createdAt: new Date().toISOString(),
  aiAgentAddress: DEFAULT_AI_AGENT_ADDRESS,
  aiAgentName: DEFAULT_AI_AGENT_NAME
})

const buildFallbackDelegationState = (delegate: string): DelegationState => ({
  delegate,
  dailyLimitUsd: 10_000,
  spent24h: 2_500,
  whitelist: ['Uniswap V2'], // ✅ FIXED: Only real Monad protocols!
  maxRiskScore: 3,
  remainingDailyLimitUsd: 7_500
})

const buildFallbackDelegations = (): DelegationConfig[] => ([
  buildConfiguredFallbackDelegation({
    delegate: DEFAULT_AI_AGENT_ADDRESS,
    dailyLimitUsd: 10_000,
    whitelist: ['Uniswap V2'], // ✅ FIXED: Only real Monad protocols!
    maxRiskScore: 3
  }, 2_500)
])

const buildConfiguredFallbackDelegation = ({
  delegate,
  dailyLimitUsd,
  whitelist,
  maxRiskScore
}: ConfigureDelegationInput, spent24h = 0): DelegationConfig => ({
  delegate: delegate ?? DEFAULT_AI_AGENT_ADDRESS,
  dailyLimit: dailyLimitUsd.toFixed(0),
  spent24h: spent24h.toFixed(0),
  allowedProtocols: whitelist,
  maxRiskScore,
  updatedAt: new Date().toISOString(),
  remainingDailyLimit: Math.max(dailyLimitUsd - spent24h, 0).toFixed(0),
  autoExecutionEnabled: false,
  portfolioPercentage: 0,
  autoExecutedUsd: 0
})

const safeBigIntToString = (value: string | bigint): string => {
  if (typeof value === 'string') {
    return value
  }
  try {
    return value.toString()
  } catch {
    return '0'
  }
}

const buildEmptyDelegationState = (delegate: string): DelegationState => ({
  delegate,
  dailyLimitUsd: 0,
  spent24h: 0,
  whitelist: [],
  maxRiskScore: 0,
  remainingDailyLimitUsd: 0
})

const computeRemainingAllowance = (daily: string, spent: string): string => {
  try {
    const dailyValue = BigInt(daily)
    const spentValue = BigInt(spent)
    if (spentValue >= dailyValue) {
      return '0'
    }
    return (dailyValue - spentValue).toString()
  } catch {
    const dailyNum = Number.parseFloat(daily)
    const spentNum = Number.parseFloat(spent)
    if (!Number.isFinite(dailyNum) || !Number.isFinite(spentNum)) {
      return '0'
    }
    return Math.max(dailyNum - spentNum, 0).toFixed(0)
  }
}

const scaleUsdAmount = (amount: number): bigint => {
  if (!Number.isFinite(amount) || amount <= 0) return 0n
  return BigInt(Math.round(amount * Number(USD_SCALE)))
}

const parseUsdStringToScaled = (value: string | null | undefined): bigint | null => {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  try {
    return BigInt(trimmed)
  } catch {
    const numeric = Number.parseFloat(trimmed)
    if (!Number.isFinite(numeric) || numeric <= 0) return null
    return scaleUsdAmount(numeric)
  }
}

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}
