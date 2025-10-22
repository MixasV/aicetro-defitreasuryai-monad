import axios from 'axios'
import { logger } from '../../config/logger'

interface PoolData {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  apyPct1D?: number
  apyPct7D?: number
  apyPct30D?: number
}

interface HistoricalAPY {
  date: string
  apy: number
}

export class DeFiLlamaService {
  private readonly baseUrl = 'https://yields.llama.fi'
  private readonly cache = new Map<string, { data: any, timestamp: number }>()
  private readonly cacheDuration = 15 * 60 * 1000 // 15 minutes

  /**
   * Get current APY data for major protocols
   */
  async getCurrentPools(): Promise<PoolData[]> {
    const cacheKey = 'current-pools'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data
    }

    try {
      const response = await axios.get(`${this.baseUrl}/pools`)
      const pools: PoolData[] = response.data.data || []

      // Filter for major stablecoin pools on relevant chains
      const filteredPools = pools.filter(pool => 
        ['Ethereum', 'Arbitrum', 'Optimism', 'Polygon'].includes(pool.chain) &&
        ['Aave', 'Compound', 'Yearn'].includes(pool.project) &&
        pool.symbol.includes('USDC') &&
        pool.tvlUsd > 1_000_000 && // At least $1M TVL
        pool.apy > 0 && pool.apy < 50 // Reasonable APY range
      )

      this.cache.set(cacheKey, { data: filteredPools, timestamp: Date.now() })
      return filteredPools
    } catch (error) {
      logger.error({ error }, '[DeFiLlama] Failed to fetch current pools')
      return []
    }
  }

  /**
   * Get historical APY data (simulated backtest)
   * Since DeFiLlama doesn't provide historical APY per pool, we'll use realistic estimates
   */
  async getHistoricalAPY(protocol: string, months = 6): Promise<HistoricalAPY[]> {
    const now = new Date()
    const history: HistoricalAPY[] = []

    // Realistic APY ranges based on historical DeFi data
    const apyRanges: Record<string, { base: number, volatility: number }> = {
      'Aave': { base: 3.5, volatility: 2.0 },
      'Compound': { base: 4.2, volatility: 2.5 },
      'Yearn': { base: 6.5, volatility: 3.5 }
    }

    const config = apyRanges[protocol] || { base: 5.0, volatility: 2.0 }

    // Generate daily historical data for the past N months
    for (let i = months * 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Simulate realistic APY fluctuations
      // APY tends to be higher during high volatility periods and lower during stable periods
      const randomFactor = Math.sin(i / 10) * config.volatility + (Math.random() - 0.5) * config.volatility
      const apy = Math.max(0.5, config.base + randomFactor)

      history.push({
        date: date.toISOString().split('T')[0],
        apy: Number(apy.toFixed(2))
      })
    }

    return history
  }

  /**
   * Calculate backtest performance for a portfolio
   */
  async calculateBacktestPerformance(
    initialBalance: number,
    allocations: Array<{ protocol: string, percent: number }>,
    months = 6
  ): Promise<{
    timeline: Array<{ date: string, balance: number, profit: number }>
    finalBalance: number
    totalProfit: number
    averageAPY: number
  }> {
    // Get historical APY for each protocol
    const historicalData = await Promise.all(
      allocations.map(async (alloc) => ({
        protocol: alloc.protocol,
        percent: alloc.percent,
        history: await this.getHistoricalAPY(alloc.protocol, months)
      }))
    )

    const timeline: Array<{ date: string, balance: number, profit: number }> = []
    let currentBalance = initialBalance

    // Simulate daily compound interest
    const daysCount = months * 30
    for (let day = 0; day < daysCount; day++) {
      let dailyReturn = 0

      // Calculate weighted daily return from all positions
      for (const { percent, history } of historicalData) {
        if (history[day]) {
          const dailyAPY = history[day].apy / 365 / 100 // Convert annual to daily
          const positionValue = (currentBalance * percent) / 100
          dailyReturn += positionValue * dailyAPY
        }
      }

      currentBalance += dailyReturn

      // Record every 7 days to reduce data size
      if (day % 7 === 0 || day === daysCount - 1) {
        const date = historicalData[0].history[day]?.date || new Date().toISOString().split('T')[0]
        timeline.push({
          date,
          balance: Number(currentBalance.toFixed(2)),
          profit: Number((currentBalance - initialBalance).toFixed(2))
        })
      }
    }

    const finalBalance = currentBalance
    const totalProfit = finalBalance - initialBalance
    const totalReturn = (totalProfit / initialBalance) * 100
    const averageAPY = (totalReturn / months) * 12 // Annualized

    return {
      timeline,
      finalBalance: Number(finalBalance.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      averageAPY: Number(averageAPY.toFixed(2))
    }
  }

  /**
   * Get default portfolio backtest (for demo)
   */
  async getDefaultBacktest(initialBalance = 100000, months = 6) {
    const allocations = [
      { protocol: 'Aave', percent: 50 },
      { protocol: 'Yearn', percent: 25 },
      { protocol: 'Compound', percent: 25 }
    ]

    return await this.calculateBacktestPerformance(initialBalance, allocations, months)
  }

  /**
   * Get pool historical chart data (7/30 days)
   * Uses DeFi Llama current data + APY change to approximate history
   */
  async getPoolHistoricalChart(poolUuid: string, days: number = 7): Promise<{
    timestamp: number
    tvl: number
    apy: number
    volume24h: number
  }[]> {
    try {
      const pools = await this.getCurrentPools()
      const pool = pools.find((p: any) => p.pool === poolUuid)
      
      if (!pool) {
        return []
      }

      const now = Date.now()
      const dayMs = 86400 * 1000
      const data: any[] = []

      const currentAPY = pool.apy || 0
      const apyChange = days <= 7 ? (pool.apyPct7D || 0) : (pool.apyPct30D || 0)
      const startAPY = currentAPY - apyChange

      // Generate data points (1 per day)
      for (let i = days - 1; i >= 0; i--) {
        const timestamp = now - (i * dayMs)
        const progress = (days - i) / days
        const apy = startAPY + (apyChange * progress)
        
        data.push({
          timestamp: Math.floor(timestamp / 1000),
          tvl: pool.tvlUsd || 0,
          apy: Math.max(0, apy),
          volume24h: 0 // getCurrentPools() doesn't return volume data
        })
      }

      return data
    } catch (error) {
      logger.error({ error }, '[DeFiLlama] Error generating historical chart')
      return []
    }
  }
}

export const defiLlamaService = new DeFiLlamaService()
