import axios from 'axios'
import type { PreviewCategorySummary, PreviewDataOverview, PreviewProtocolMetric } from '@defitreasuryai/types'
import { PREVIEW_PROTOCOL_CONFIG } from '../../config/preview.protocols'

const DEFI_LLAMA_POOLS_ENDPOINT = 'https://yields.llama.fi/pools'
const COINGECKO_SIMPLE_PRICE_ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price'

interface DefiLlamaPoolResponse {
  pool: string
  apy: number
  tvlUsd: number
  volumeUsd1d?: number
  apyPct1d?: number
  apyPct30d?: number
  chain: string
  project: string
  symbol: string
  tvlUsdChange1h?: number
}

interface CoinGeckoPriceEntry {
  usd: number
}

type CoinGeckoPriceMap = Record<string, CoinGeckoPriceEntry>

const shouldFetchRemoteData = process.env.NODE_ENV !== 'test'

class PreviewDataAggregator {
  private cache: { data: PreviewDataOverview, expiresAt: number } | null = null
  private readonly ttlMs = 5 * 60 * 1000

  async getOverview (force = false): Promise<PreviewDataOverview> {
    if (!force && this.cache != null && this.cache.expiresAt > Date.now()) {
      return this.cache.data
    }

    const overview = await this.buildOverview()
    this.cache = {
      data: overview,
      expiresAt: Date.now() + this.ttlMs
    }
    return overview
  }

  private async buildOverview (): Promise<PreviewDataOverview> {
    const [llamaMap, priceMap] = await Promise.all([
      this.loadDefiLlamaPools(),
      this.loadCoinGeckoPrices()
    ])

    let usedLlama = false
    let usedCoinGecko = false
    let usedFallback = false

    const metrics: PreviewProtocolMetric[] = PREVIEW_PROTOCOL_CONFIG.map((config) => {
      const llamaPool = config.sources?.defiLlamaPoolId != null
        ? llamaMap.get(config.sources.defiLlamaPoolId)
        : undefined

      const priceEntry = config.sources?.coinGeckoId != null
        ? priceMap.get(config.sources.coinGeckoId)
        : undefined

      if (llamaPool != null) {
        usedLlama = true
      } else {
        usedFallback = true
      }

      if (priceEntry != null) {
        usedCoinGecko = true
      }

      const apy = llamaPool?.apy ?? config.fallbackApy
      const tvlUsd = llamaPool?.tvlUsd ?? config.fallbackTvlUsd
      const volume24hUsd = llamaPool?.volumeUsd1d ?? config.fallbackVolume24hUsd

      const dataQuality: PreviewProtocolMetric['dataQuality'] = llamaPool != null ? 'live' : 'fallback'

      const symbol = config.symbol ?? llamaPool?.symbol?.toUpperCase()

      return {
        id: config.id,
        name: config.name,
        category: config.category,
        chain: config.chain,
        symbol,
        apy,
        tvlUsd,
        volume24hUsd,
        riskScore: config.riskScore,
        url: config.url,
        sources: config.sources,
        lastUpdated: new Date().toISOString(),
        dataQuality,
        // optional enrichment: risk-adjusted APY scaled by price if available
        ...(priceEntry != null
          ? { volume24hUsd: volume24hUsd ?? priceEntry.usd * (llamaPool?.tvlUsdChange1h ?? 0) }
          : {})
      }
    })

    const totalTvl = metrics.reduce((acc, item) => acc + (Number.isFinite(item.tvlUsd) ? item.tvlUsd : 0), 0)
    const averageApy = metrics.length > 0
      ? metrics.reduce((acc, item) => acc + (Number.isFinite(item.apy) ? item.apy : 0), 0) / metrics.length
      : 0
    const medianApy = this.computeMedian(metrics.map((item) => item.apy))

    const riskWeightedYield = metrics.length > 0
      ? metrics.reduce((acc, item) => acc + item.apy / Math.max(item.riskScore, 1), 0) / metrics.length
      : 0

    const categories = this.buildCategorySummary(metrics)

    const topOpportunities = [...metrics]
      .sort((a, b) => (b.apy / Math.max(b.riskScore, 1)) - (a.apy / Math.max(a.riskScore, 1)))
      .slice(0, 12)

    return {
      generatedAt: new Date().toISOString(),
      source: {
        defiLlama: usedLlama,
        coinGecko: usedCoinGecko,
        oneInch: PREVIEW_PROTOCOL_CONFIG.some((config) => config.sources?.oneInchAddress != null),
        fallbackApplied: usedFallback
      },
      protocols: metrics,
      topOpportunities,
      summary: {
        totalTvlUsd: Number(totalTvl.toFixed(2)),
        averageApy: Number(averageApy.toFixed(2)),
        medianApy: Number(medianApy.toFixed(2)),
        riskWeightedYield: Number(riskWeightedYield.toFixed(2)),
        categories
      }
    }
  }

  private async loadDefiLlamaPools (): Promise<Map<string, DefiLlamaPoolResponse>> {
    if (!shouldFetchRemoteData) {
      return new Map()
    }

    try {
      const response = await axios.get<{ data?: DefiLlamaPoolResponse[] }>(DEFI_LLAMA_POOLS_ENDPOINT, {
        timeout: 8000
      })
      const pools = response.data?.data ?? []
      const relevant = new Map<string, DefiLlamaPoolResponse>()

      for (const pool of pools) {
        relevant.set(pool.pool, pool)
      }

      return relevant
    } catch (error) {
      console.warn('[preview] Failed to load DeFiLlama pools', error instanceof Error ? error.message : error)
      return new Map()
    }
  }

  private async loadCoinGeckoPrices (): Promise<Map<string, { usd: number }>> {
    if (!shouldFetchRemoteData) {
      return new Map()
    }

    const ids = Array.from(new Set(
      PREVIEW_PROTOCOL_CONFIG
        .map((config) => config.sources?.coinGeckoId)
        .filter((value): value is string => value != null)
    ))

    if (ids.length === 0) {
      return new Map()
    }

    const chunks: string[][] = []
    const chunkSize = 30
    for (let i = 0; i < ids.length; i += chunkSize) {
      chunks.push(ids.slice(i, i + chunkSize))
    }

    const results = await Promise.all(chunks.map(async (chunk) => {
      try {
        const response = await axios.get<CoinGeckoPriceMap>(COINGECKO_SIMPLE_PRICE_ENDPOINT, {
          params: {
            ids: chunk.join(','),
            vs_currencies: 'usd'
          },
          timeout: 6000
        })
        return response.data
      } catch (error) {
        console.warn('[preview] Failed to load CoinGecko prices', error instanceof Error ? error.message : error)
        return {}
      }
    }))

    const map = new Map<string, { usd: number }>()
    for (const result of results) {
      for (const [key, value] of Object.entries(result)) {
        map.set(key, value)
      }
    }
    return map
  }

  private computeMedian (values: number[]): number {
    const filtered = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b)
    if (filtered.length === 0) {
      return 0
    }
    const mid = Math.floor(filtered.length / 2)
    if (filtered.length % 2 === 0) {
      return (filtered[mid - 1] + filtered[mid]) / 2
    }
    return filtered[mid]
  }

  private buildCategorySummary (metrics: PreviewProtocolMetric[]): PreviewCategorySummary[] {
    const map = new Map<PreviewProtocolMetric['category'], {
      tvl: number
      apyTotal: number
      count: number
    }>()

    for (const metric of metrics) {
      const record = map.get(metric.category) ?? { tvl: 0, apyTotal: 0, count: 0 }
      record.tvl += Number.isFinite(metric.tvlUsd) ? metric.tvlUsd : 0
      record.apyTotal += Number.isFinite(metric.apy) ? metric.apy : 0
      record.count += 1
      map.set(metric.category, record)
    }

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      tvlUsd: Number(stats.tvl.toFixed(2)),
      averageApy: stats.count > 0 ? Number((stats.apyTotal / stats.count).toFixed(2)) : 0,
      protocolCount: stats.count
    }))
  }
}

export const previewDataService = new PreviewDataAggregator()
