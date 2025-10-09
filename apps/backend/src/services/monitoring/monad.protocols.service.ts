import { MONAD_PROTOCOLS } from '../../config/protocols.monad'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { envioClient } from './envio.client'
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

    if (!this.isEnvioConfigured()) {
      logger.warn('[protocols] Envio client is not configured; returning fallback Monad protocol metrics')
      return this.buildFallback('Envio client is not configured', fetchedAt)
    }

    try {
      const response = await envioClient.query<ProtocolMetricsQuery>(PROTOCOL_METRICS_QUERY)

      if (response == null) {
        logger.warn('[protocols] Envio returned an empty response; using fallback data set')
        return this.buildFallback('Envio returned empty dataset', fetchedAt)
      }

      const nabla = this.mergeNablaMetrics(response.nablaPoolMetrics ?? [])
      const uniswap = this.mergeUniswapMetrics(response.uniswapV2PairMetrics ?? [])

      const reasons = [...nabla.reasons, ...uniswap.reasons]
      const source = this.resolveSource(nabla.source, uniswap.source)

      if (source !== 'envio') {
        logger.warn({ reasons }, '[protocols] Fallback data used for portions of Monad metrics')
      }

      return {
        source,
        fetchedAt,
        fallbackReason: reasons.length > 0 ? reasons.join('; ') : undefined,
        nablaPools: nabla.metrics,
        uniswapPairs: uniswap.metrics
      }
    } catch (error) {
      logger.error({ err: error }, '[protocols] Failed to fetch Monad metrics from Envio; returning fallback data')
      return this.buildFallback('Envio query failed', fetchedAt)
    }
  }

  private mergeNablaMetrics (nodes: EnvioNablaPoolNode[]): MergeResult<MonadNablaPoolMetric> {
    const reasons: string[] = []
    let hasEnvioData = false
    let usedFallback = false
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

  private toNablaMetric (
    node: EnvioNablaPoolNode,
    config: typeof MONAD_PROTOCOLS.nabla.pools[number] | undefined,
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

  private buildFallback (reason: string, fetchedAt: string): MonadProtocolMetrics {
    const nabla = MONAD_PROTOCOLS.nabla.pools.map((config) =>
      this.buildNablaMetricFromConfig(config, fetchedAt, 'fallback')
    )

    const uniswap = MONAD_PROTOCOLS.uniswapV2.pairs.map((config) =>
      this.buildUniswapMetricFromConfig(config, fetchedAt, 'fallback')
    )

    return {
      source: 'fallback',
      fetchedAt,
      fallbackReason: reason,
      nablaPools: nabla,
      uniswapPairs: uniswap
    }
  }

  private buildNablaMetricFromConfig (
    config: typeof MONAD_PROTOCOLS.nabla.pools[number],
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
