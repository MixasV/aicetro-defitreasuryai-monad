import { MONAD_PROTOCOLS } from '../../config/protocols.monad'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { envioClient } from './envio.client'
import { prisma } from '../../db/prisma'
import type {
  MonadProtocolMetrics,
  MonadProtocolMetricsSource,
  MonadNablaPoolMetric,
  MonadUniswapPairMetric
} from '../../types/ai.js'

interface EnvioNablaPoolNode {
  poolAddress?: string
  asset?: string
  currentAPY?: number | string | null
  tvl?: number | string | null
  volume24h?: number | string | null
  fees24h?: number | string | null
  riskScore?: number | string | null
  lastUpdate?: string | null
  isActive?: boolean | null
}

interface EnvioUniswapPairNode {
  pairAddress?: string
  token0Symbol?: string | null
  token1Symbol?: string | null
  reserve0?: number | string | null
  reserve1?: number | string | null
  volume24h?: number | string | null
  fees24h?: number | string | null
  apr?: number | string | null
  lastUpdate?: string | null
  isActive?: boolean | null
}

interface ProtocolMetricsQuery {
  nablaPoolMetrics?: EnvioNablaPoolNode[] | null
  uniswapV2PairMetrics?: EnvioUniswapPairNode[] | null
}

interface MergeResult<T> {
  metrics: T[]
  source: MonadProtocolMetricsSource
  reasons: string[]
}

const PROTOCOL_METRICS_QUERY = `
  query MonadProtocolMetrics {
    nablaPoolMetrics {
      poolAddress
      asset
      currentAPY
      tvl
      volume24h
      fees24h
      riskScore
      lastUpdate
      isActive
    }
    uniswapV2PairMetrics {
      pairAddress
      token0Symbol
      token1Symbol
      reserve0
      reserve1
      volume24h
      fees24h
      apr
      lastUpdate
      isActive
    }
  }
`

class MonadProtocolsService {
  async getProtocolMetrics (): Promise<MonadProtocolMetrics> {
    const fetchedAt = new Date().toISOString()

    // NEW APPROACH: Use ONLY real data from Pool table (synced from Envio)
    // This eliminates fake Nabla data and uses actual on-chain Monad pools
    try {
      logger.info('[protocols] Fetching Monad pools from database (Envio-synced data)')
      
      // Query Monad pools with TVL > $100 from Pool table
      // ⚠️ CRITICAL: Monad Testnet is fresh, pools have TVL but 0 volume
      // Use TVL filter instead of volume to allow AI to trade
      const monadPools = await prisma.pool.findMany({
        where: {
          chain: 'Monad',
          isActive: true,
          tvl: { gt: 100 }  // Pools with TVL > $100 (testnet may have 0 volume)
        },
        select: {
          id: true,
          protocol: true,
          address: true,
          asset: true,
          apy: true,
          tvl: true,
          volume24h: true,
          riskScore: true,
          aiScore: true
        },
        orderBy: { apy: 'desc' },  // ⚠️ CHANGED: Sort by APY to get profitable pools first
        take: 50  // Top 50 by APY (increased to ensure we get pools with yield)
      })

      logger.info(`[protocols] Found ${monadPools.length} Monad pools with TVL > $100 from database`)

      // Convert to MonadProtocolMetrics format
      const uniswapMetrics: MonadUniswapPairMetric[] = monadPools
        .filter(p => p.protocol === 'Uniswap V2')
        .map(p => {
          // Parse asset "WMON/USDC" → token0: WMON, token1: USDC
          const tokens = (p.asset || 'UNKNOWN/UNKNOWN').split('/')
          
          return {
            id: p.id,
            pairAddress: p.address as `0x${string}`,
            token0Symbol: tokens[0] || 'UNKNOWN',
            token1Symbol: tokens[1] || 'UNKNOWN',
            volume24hUsd: p.volume24h || 0,
            fees24hUsd: (p.volume24h || 0) * 0.003,  // 0.3% Uniswap V2 fee
            apr: p.apy || 0,
            reserve0: 0,  // Can be fetched from RPC if needed
            reserve1: 0,
            lastUpdate: fetchedAt,
            isActive: true,
            source: 'envio' as const  // Changed from 'database' to match type
          }
        })

      if (uniswapMetrics.length === 0) {
        logger.warn('[protocols] No Monad Uniswap pools found in database, using fallback')
        return this.buildUniswapOnlyFallback(fetchedAt)
      }

      return {
        source: 'mixed',  // Changed from 'database' to match type
        fetchedAt,
        nablaPools: [],  // EMPTY! Nabla does not exist on Monad
        uniswapPairs: uniswapMetrics
      }

    } catch (error) {
      logger.error({ err: error }, '[protocols] Failed to fetch Monad pools from database')
      return this.buildUniswapOnlyFallback(fetchedAt)
    }
  }

  // DEPRECATED: mergeNablaMetrics - Nabla pools do not exist on Monad
  private mergeNablaMetrics (nodes: EnvioNablaPoolNode[]): MergeResult<MonadNablaPoolMetric> {
    // Return empty array - Nabla pools do not exist on Monad Testnet
    return {
      metrics: [],
      source: 'fallback',
      reasons: ['Nabla pools do not exist on Monad Testnet']
    }
    
    /* OLD CODE - commented out
    const reasons: string[] = []
    const normalizedNow = new Date().toISOString()

    const metrics: MonadNablaPoolMetric[] = MONAD_PROTOCOLS.nabla.pools.map((config) => {
      const record = nodes.find((node) => normalize(node.poolAddress) === config.address.toLowerCase())

      if (record == null) {
        usedFallback = true
        reasons.push(`Absent Nabla pool metrics for ${config.assetSymbol}`)
        return this.buildNablaMetricFromConfig(config, normalizedNow, 'fallback')
      }

      hasEnvioData = true
      const parsed = this.toNablaMetric(record, config, normalizedNow)
      if (parsed.source !== 'envio') {
        usedFallback = true
        reasons.push(`Incomplete Nabla metrics for ${config.assetSymbol}`)
      }
      return parsed
    })

    const knownAddresses = new Set(MONAD_PROTOCOLS.nabla.pools.map((pool) => pool.address.toLowerCase()))
    for (const node of nodes) {
      const address = normalize(node.poolAddress)
      if (address == null || knownAddresses.has(address)) continue

      hasEnvioData = true
      metrics.push(this.toNablaMetric(node, undefined, normalizedNow))
    }

    const source = !hasEnvioData ? 'fallback' : usedFallback ? 'mixed' : 'envio'

    return { metrics, source, reasons }
    */ // END OLD CODE
  }

  private mergeUniswapMetrics (nodes: EnvioUniswapPairNode[]): MergeResult<MonadUniswapPairMetric> {
    const reasons: string[] = []
    let hasEnvioData = false
    let usedFallback = false
    const normalizedNow = new Date().toISOString()

    const metrics: MonadUniswapPairMetric[] = MONAD_PROTOCOLS.uniswapV2.pairs.map((config) => {
      const record = nodes.find((node) => normalize(node.pairAddress) === config.pairAddress.toLowerCase())

      if (record == null) {
        usedFallback = true
        reasons.push(`Absent Uniswap pair metrics for ${config.token0.symbol}/${config.token1.symbol}`)
        return this.buildUniswapMetricFromConfig(config, normalizedNow, 'fallback')
      }

      hasEnvioData = true
      const parsed = this.toUniswapMetric(record, config, normalizedNow)
      if (parsed.source !== 'envio') {
        usedFallback = true
        reasons.push(`Incomplete Uniswap metrics for ${parsed.token0Symbol}/${parsed.token1Symbol}`)
      }
      return parsed
    })

    const knownAddresses = new Set(MONAD_PROTOCOLS.uniswapV2.pairs.map((pair) => pair.pairAddress.toLowerCase()))
    for (const node of nodes) {
      const address = normalize(node.pairAddress)
      if (address == null || knownAddresses.has(address)) continue

      hasEnvioData = true
      metrics.push(this.toUniswapMetric(node, undefined, normalizedNow))
    }

    const source = !hasEnvioData ? 'fallback' : usedFallback ? 'mixed' : 'envio'

    return { metrics, source, reasons }
  }

  // DEPRECATED: toNablaMetric - Nabla pools do not exist on Monad
  private toNablaMetric (
    node: EnvioNablaPoolNode,
    config: any | undefined,  // Was: typeof MONAD_PROTOCOLS.nabla.pools[number]
    fallbackTimestamp: string
  ): MonadNablaPoolMetric {
    const fallback = config?.fallback
    const apy = pickNumber(node.currentAPY, fallback?.currentApy)
    const tvl = pickNumber(node.tvl, fallback?.tvlUsd)
    const volume = pickNumber(node.volume24h, fallback?.volume24hUsd)
    const fees = pickNumber(node.fees24h, fallback?.fees24hUsd)
    const riskScore = pickNumber(node.riskScore, fallback?.riskScore)
    const isActive = typeof node.isActive === 'boolean' ? node.isActive : fallback?.isActive ?? false

    const hasMissing = [apy.value, tvl.value, volume.value, fees.value, riskScore.value].some((val) => val == null)
    const usedFallback = [apy.usedFallback, tvl.usedFallback, volume.usedFallback, fees.usedFallback, riskScore.usedFallback].some(Boolean)

    const source: MonadProtocolMetricsSource = !hasMissing && !usedFallback
      ? 'envio'
      : hasMissing && fallback == null
        ? 'fallback'
        : 'mixed'

    const address = node.poolAddress ?? config?.address ?? '0x0000000000000000000000000000000000000000'

    return {
      id: config?.id ?? buildMetricId(address),
      address,
      asset: node.asset ?? config?.assetSymbol ?? 'UNKNOWN',
      currentApy: apy.value ?? fallback?.currentApy ?? 0,
      tvlUsd: tvl.value ?? fallback?.tvlUsd ?? 0,
      volume24hUsd: volume.value ?? fallback?.volume24hUsd ?? 0,
      fees24hUsd: fees.value ?? fallback?.fees24hUsd ?? 0,
      riskScore: riskScore.value ?? fallback?.riskScore ?? 0,
      lastUpdate: node.lastUpdate ?? fallbackTimestamp,
      isActive,
      source
    }
  }

  private toUniswapMetric (
    node: EnvioUniswapPairNode,
    config: typeof MONAD_PROTOCOLS.uniswapV2.pairs[number] | undefined,
    fallbackTimestamp: string
  ): MonadUniswapPairMetric {
    const fallback = config?.fallback
    const volume = pickNumber(node.volume24h, fallback?.volume24hUsd)
    const fees = pickNumber(node.fees24h, fallback?.fees24hUsd)
    const apr = pickNumber(node.apr, fallback?.apr)
    const reserve0 = pickNumber(node.reserve0, 0)
    const reserve1 = pickNumber(node.reserve1, 0)
    const isActive = typeof node.isActive === 'boolean' ? node.isActive : fallback?.isActive ?? false

    const hasMissing = [volume.value, fees.value, apr.value].some((val) => val == null)
    const usedFallback = [volume.usedFallback, fees.usedFallback, apr.usedFallback].some(Boolean)

    const source: MonadProtocolMetricsSource = !hasMissing && !usedFallback
      ? 'envio'
      : hasMissing && fallback == null
        ? 'fallback'
        : 'mixed'

    const pairAddress = node.pairAddress ?? config?.pairAddress ?? '0x0000000000000000000000000000000000000000'

    return {
      id: config?.id ?? buildMetricId(pairAddress),
      pairAddress,
      token0Symbol: node.token0Symbol ?? config?.token0.symbol ?? 'TOKEN0',
      token1Symbol: node.token1Symbol ?? config?.token1.symbol ?? 'TOKEN1',
      reserve0: reserve0.value ?? 0,
      reserve1: reserve1.value ?? 0,
      volume24hUsd: volume.value ?? fallback?.volume24hUsd ?? 0,
      fees24hUsd: fees.value ?? fallback?.fees24hUsd ?? 0,
      apr: apr.value ?? fallback?.apr ?? 0,
      lastUpdate: node.lastUpdate ?? fallbackTimestamp,
      isActive,
      source
    }
  }

  // NEW: Fallback with ONLY Uniswap (no Nabla)
  private buildUniswapOnlyFallback (fetchedAt: string): MonadProtocolMetrics {
    const uniswap = MONAD_PROTOCOLS.uniswapV2.pairs.map((config) =>
      this.buildUniswapMetricFromConfig(config, fetchedAt, 'fallback')
    )

    return {
      source: 'fallback',
      fetchedAt,
      fallbackReason: 'Database unavailable - using Uniswap fallback only (Nabla removed)',
      nablaPools: [],  // EMPTY! Nabla does not exist
      uniswapPairs: uniswap
    }
  }

  // DEPRECATED: Old buildFromConfig with Nabla (no longer used)
  private buildFromConfig (fetchedAt: string): MonadProtocolMetrics {
    return this.buildUniswapOnlyFallback(fetchedAt)
  }

  // DEPRECATED: Old buildFallback with Nabla (no longer used)
  private buildFallback (reason: string, fetchedAt: string): MonadProtocolMetrics {
    return this.buildUniswapOnlyFallback(fetchedAt)
  }

  // DEPRECATED: buildNablaMetricFromConfig - Nabla pools do not exist on Monad
  private buildNablaMetricFromConfig (
    config: any,  // Was: typeof MONAD_PROTOCOLS.nabla.pools[number]
    timestamp: string,
    source: MonadProtocolMetricsSource
  ): MonadNablaPoolMetric {
    return {
      id: config.id,
      address: config.address,
      asset: config.assetSymbol,
      currentApy: config.fallback.currentApy,
      tvlUsd: config.fallback.tvlUsd,
      volume24hUsd: config.fallback.volume24hUsd,
      fees24hUsd: config.fallback.fees24hUsd,
      riskScore: config.fallback.riskScore,
      lastUpdate: timestamp,
      isActive: config.fallback.isActive ?? false,
      source
    }
  }

  private buildUniswapMetricFromConfig (
    config: typeof MONAD_PROTOCOLS.uniswapV2.pairs[number],
    timestamp: string,
    source: MonadProtocolMetricsSource
  ): MonadUniswapPairMetric {
    return {
      id: config.id,
      pairAddress: config.pairAddress,
      token0Symbol: config.token0.symbol,
      token1Symbol: config.token1.symbol,
      reserve0: 0,
      reserve1: 0,
      volume24hUsd: config.fallback.volume24hUsd,
      fees24hUsd: config.fallback.fees24hUsd,
      apr: config.fallback.apr,
      lastUpdate: timestamp,
      isActive: config.fallback.isActive ?? false,
      source
    }
  }

  private resolveSource (nabla: MonadProtocolMetricsSource, uniswap: MonadProtocolMetricsSource): MonadProtocolMetricsSource {
    if (nabla === 'envio' && uniswap === 'envio') return 'envio'
    if (nabla === 'fallback' && uniswap === 'fallback') return 'fallback'
    return 'mixed'
  }

  private isEnvioConfigured (): boolean {
    return env.envioGraphqlUrl.trim() !== '' && env.envioApiKey.trim() !== ''
  }
}

const normalize = (value?: string | null): string | null => (value == null ? null : value.toLowerCase())

const buildMetricId = (address: string): string => {
  const normalized = address.trim().toLowerCase()
  return normalized !== '' ? normalized : 'unknown-metric'
}

interface PickNumberResult {
  value?: number
  usedFallback: boolean
}

const pickNumber = (value: number | string | null | undefined, fallback?: number): PickNumberResult => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { value, usedFallback: false }
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return { value: parsed, usedFallback: false }
    }
  }
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return { value: fallback, usedFallback: true }
  }
  return { value: undefined, usedFallback: false }
}

export const monadProtocolsService = new MonadProtocolsService()
