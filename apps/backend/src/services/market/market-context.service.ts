import { createPublicClient, http } from 'viem'
import { monadTestnet } from '../../chains'
import axios from 'axios'
import { monitoringService } from '../monitoring/monitoring.service'
import { prisma } from '../../db/prisma'
import { env } from '../../config/env'
import { alchemyPricesService } from '../alchemy/alchemy-prices.service'
import type {
  MarketContext,
  GasData,
  MarketSentiment,
  ProtocolMetric
} from '../../types/market-context.types'

// Check if we're in test environment
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST

class MarketContextService {
  private gasHistoryCache: number[] = []
  private lastGasUpdate: Date = new Date(0)
  private ethPriceCache: { price: number, timestamp: number } | null = null
  private readonly PRICE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  async getContext(): Promise<MarketContext> {
    console.log('[MarketContext] Fetching market context...')
    
    const [gasData, marketData, protocolMetrics] = await Promise.all([
      this.getGasData(),
      this.getMarketSentiment(),
      this.getProtocolMetrics()
    ])
    
    return {
      network: {
        name: 'monad-testnet',
        currentGasPrice: gasData.current,
        averageGasPrice24h: gasData.average24h,
        gasPriceTrend: this.calculateGasTrend(gasData),
        nextLowGasPeriod: this.predictLowGasPeriod(gasData)
      },
      market: marketData,
      protocols: protocolMetrics,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get ETH price from Alchemy (cached for 5 minutes)
   */
  private async getEthPrice(): Promise<number> {
    const now = Date.now()
    
    // Return cached price if still valid
    if (this.ethPriceCache && (now - this.ethPriceCache.timestamp) < this.PRICE_CACHE_TTL) {
      return this.ethPriceCache.price
    }
    
    try {
      const price = await alchemyPricesService.getTokenPriceBySymbol('ETH', 'USD')
      this.ethPriceCache = { price, timestamp: now }
      console.log('[MarketContext] Updated ETH price from Alchemy:', price)
      return price
    } catch (error) {
      console.warn('[MarketContext] Failed to get ETH price from Alchemy, using fallback')
      // Fallback to last cached or default
      return this.ethPriceCache?.price ?? 2500
    }
  }

  private async getGasData(): Promise<GasData> {
    try {
      if (!env.monadRpcUrl) {
        console.warn('[MarketContext] No Monad RPC URL configured, using defaults')
        return {
          current: 20,
          average24h: 20,
          history: [20]
        }
      }

      const publicClient = createPublicClient({
        chain: monadTestnet,
        transport: http(env.monadRpcUrl)
      })
      
      const gasPrice = await publicClient.getGasPrice()
      
      if (!gasPrice) {
        throw new Error('Failed to get gas price')
      }
      
      const currentGas = Number(gasPrice) / 1e9
      
      this.updateGasHistory(currentGas)
      
      const history = await this.getGasHistory24h()
      const average24h = history.reduce((sum, g) => sum + g, 0) / history.length
      
      console.log('[MarketContext] Gas data:', { currentGas, average24h, historySize: history.length })
      
      return {
        current: currentGas,
        average24h,
        history
      }
    } catch (error) {
      console.error('[MarketContext] Failed to get gas data:', error)
      
      return {
        current: 20,
        average24h: 20,
        history: [20]
      }
    }
  }

  private updateGasHistory(gasPrice: number): void {
    const now = new Date()
    
    if (now.getTime() - this.lastGasUpdate.getTime() < 5 * 60 * 1000) {
      return
    }
    
    this.gasHistoryCache.push(gasPrice)
    this.lastGasUpdate = now
    
    if (this.gasHistoryCache.length > 288) {
      this.gasHistoryCache = this.gasHistoryCache.slice(-288)
    }

    this.saveGasPriceToDb(gasPrice).catch(err => {
      console.warn('[MarketContext] Failed to save gas price to DB:', err)
    })
  }

  private async saveGasPriceToDb(priceGwei: number): Promise<void> {
    try {
      await prisma.gasPrice.create({
        data: {
          priceGwei,
          chainId: 10143
        }
      })
    } catch (error) {
      console.debug('[MarketContext] DB save skipped (model may not exist yet)')
    }
  }

  private async getGasHistory24h(): Promise<number[]> {
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      const history = await prisma.gasPrice.findMany({
        where: {
          createdAt: { gte: twentyFourHoursAgo }
        },
        orderBy: { createdAt: 'asc' },
        select: { priceGwei: true }
      })
      
      if (history.length > 0) {
        return history.map((h: any) => h.priceGwei)
      }
    } catch (error) {
      console.debug('[MarketContext] DB query skipped:', error)
    }
    
    return this.gasHistoryCache.length > 0 ? this.gasHistoryCache : [20]
  }

  private calculateGasTrend(gasData: GasData): 'rising' | 'falling' | 'stable' {
    const { current, average24h } = gasData
    
    const deviation = ((current - average24h) / average24h) * 100
    
    if (deviation > 10) {
      return 'rising'
    } else if (deviation < -10) {
      return 'falling'
    } else {
      return 'stable'
    }
  }

  private predictLowGasPeriod(gasData: GasData): { estimatedHours: number; estimatedGasPrice: number } | undefined {
    const now = new Date()
    const currentHour = now.getUTCHours()
    
    const lowGasStart = 2
    const lowGasEnd = 8
    
    if (currentHour >= 14 || currentHour < lowGasStart) {
      const hoursUntilLow = currentHour >= 14 
        ? (24 - currentHour + lowGasStart)
        : (lowGasStart - currentHour)
      
      const estimatedGasPrice = gasData.average24h * 0.6
      
      return {
        estimatedHours: hoursUntilLow,
        estimatedGasPrice: Math.round(estimatedGasPrice * 100) / 100
      }
    }
    
    return undefined
  }

  private async getMarketSentiment(): Promise<MarketSentiment> {
    // In test environment, return mock data to avoid rate limiting
    if (isTestEnv) {
      return {
        fearGreedIndex: 50,
        sentiment: 'neutral',
        btcDominance: 50,
        totalMarketCap: 1000000000000
      }
    }

    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/global', {
        timeout: 5000
      })
      
      const data = response.data.data
      
      const btcDominance = data.market_cap_percentage?.btc || 50
      let fearGreedIndex = 50
      let sentiment: MarketSentiment['sentiment'] = 'neutral'
      
      if (btcDominance > 60) {
        fearGreedIndex = 30
        sentiment = 'fear'
      } else if (btcDominance < 40) {
        fearGreedIndex = 70
        sentiment = 'greed'
      }
      
      return {
        fearGreedIndex,
        sentiment,
        btcDominance,
        totalMarketCap: data.total_market_cap?.usd || 0
      }
    } catch (error) {
      console.warn('[MarketContext] Failed to get market sentiment, using defaults:', error)
      
      return {
        fearGreedIndex: 50,
        sentiment: 'neutral',
        btcDominance: 50,
        totalMarketCap: 0
      }
    }
  }

  private async getProtocolMetrics(): Promise<ProtocolMetric[]> {
    try {
      const metrics = await monitoringService.getProtocolMetrics()
      
      const protocols: ProtocolMetric[] = []
      
      metrics.nablaPools.forEach((pool: any) => {
        protocols.push({
          id: `nabla:${pool.asset?.toLowerCase() || pool.id}`,
          chain: 'monad',
          tvl: pool.tvlUsd || 0,
          apy: pool.currentApy || 0,
          apyTrend7d: 0,
          volume24h: pool.volume24hUsd || 0,
          riskScore: pool.riskScore || 3,
          liquidityDepth: pool.tvlUsd || 0
        })
      })
      
      metrics.uniswapPairs.forEach((pair: any) => {
        protocols.push({
          id: `uniswap:${pair.token0Symbol}-${pair.token1Symbol}`.toLowerCase(),
          chain: 'monad',
          tvl: (pair.reserve0 + pair.reserve1) || 0,
          apy: pair.apr || 0,
          apyTrend7d: 0,
          volume24h: pair.volume24hUsd || 0,
          riskScore: 3,
          liquidityDepth: (pair.reserve0 + pair.reserve1) || 0
        })
      })
      
      return protocols
    } catch (error) {
      console.error('[MarketContext] Failed to get protocol metrics:', error)
      return []
    }
  }

  async getETHPrice(): Promise<number> {
    return await this.getEthPrice()
  }
}

export const marketContextService = new MarketContextService()
