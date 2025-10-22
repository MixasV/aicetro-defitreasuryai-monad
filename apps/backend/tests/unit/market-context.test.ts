import { describe, it, expect, vi, beforeEach } from 'vitest'
import { marketContextService } from '../../src/services/market/market-context.service'
import { ethers } from 'ethers'

describe('MarketContextService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Gas Price Analysis', () => {
    it('should calculate rising trend when price > avg + 10%', () => {
      const gasData = {
        current: 30,
        average24h: 20,
        history: [18, 19, 20, 22, 25, 28, 30]
      }

      const trend = marketContextService['calculateGasTrend'](gasData)

      expect(trend).toBe('rising')
    })

    it('should calculate falling trend when price < avg - 10%', () => {
      const gasData = {
        current: 15,
        average24h: 20,
        history: [25, 23, 21, 19, 17, 15, 15]
      }

      const trend = marketContextService['calculateGasTrend'](gasData)

      expect(trend).toBe('falling')
    })

    it('should calculate stable trend when price within ±10% of avg', () => {
      const gasData = {
        current: 21,
        average24h: 20,
        history: [19, 20, 21, 20, 21, 20, 21]
      }

      const trend = marketContextService['calculateGasTrend'](gasData)

      expect(trend).toBe('stable')
    })
  })

  describe('Low Gas Period Prediction', () => {
    it('should predict low gas period during peak hours (14:00 UTC)', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15T14:00:00Z')) // 14:00 UTC

      const gasData = {
        current: 30,
        average24h: 20,
        history: []
      }

      const prediction = marketContextService['predictLowGasPeriod'](gasData)

      expect(prediction).toBeDefined()
      expect(prediction?.estimatedHours).toBeGreaterThan(0)
      expect(prediction?.estimatedGasPrice).toBeLessThan(gasData.current)

      jest.useRealTimers()
    })

    it('should not predict low gas during off-peak hours (06:00 UTC)', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15T06:00:00Z')) // 06:00 UTC

      const gasData = {
        current: 15,
        average24h: 20,
        history: []
      }

      const prediction = marketContextService['predictLowGasPeriod'](gasData)

      expect(prediction).toBeUndefined() // Already in low gas period

      jest.useRealTimers()
    })

    it('should estimate ~40% lower gas during off-peak', () => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-01-15T20:00:00Z')) // 20:00 UTC

      const gasData = {
        current: 30,
        average24h: 25,
        history: []
      }

      const prediction = marketContextService['predictLowGasPeriod'](gasData)

      expect(prediction).toBeDefined()
      // Should be ~60% of average (40% reduction)
      expect(prediction?.estimatedGasPrice).toBeCloseTo(15, 0)

      jest.useRealTimers()
    })
  })

  describe('Market Sentiment', () => {
    it('should return neutral sentiment by default', async () => {
      const sentiment = await marketContextService['getMarketSentiment']()

      expect(sentiment).toBeDefined()
      expect(sentiment.fearGreedIndex).toBeDefined()
      expect(sentiment.sentiment).toBeDefined()
      expect(['extreme_fear', 'fear', 'neutral', 'greed', 'extreme_greed']).toContain(sentiment.sentiment)
    })

    it('should handle API failure gracefully', async () => {
      // Mock axios to fail
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('API unavailable'))

      const sentiment = await marketContextService['getMarketSentiment']()

      // Should return neutral fallback
      expect(sentiment.fearGreedIndex).toBe(50)
      expect(sentiment.sentiment).toBe('neutral')
    })
  })

  describe('Gas History Management', () => {
    it('should update gas history cache', () => {
      const service = marketContextService as any

      // Reset cache
      service.gasHistoryCache = []
      service.lastGasUpdate = new Date(0)

      // Update with new gas price
      service.updateGasHistory(20)

      expect(service.gasHistoryCache).toContain(20)
    })

    it('should not update if less than 5 minutes passed', () => {
      const service = marketContextService as any

      service.gasHistoryCache = [15]
      service.lastGasUpdate = new Date()

      const beforeLength = service.gasHistoryCache.length

      service.updateGasHistory(20)

      // Should not add because < 5 min
      expect(service.gasHistoryCache.length).toBe(beforeLength)
    })

    it('should limit history to 288 data points (24 hours)', () => {
      const service = marketContextService as any

      service.gasHistoryCache = []
      service.lastGasUpdate = new Date(0)

      // Add 300 data points
      for (let i = 0; i < 300; i++) {
        service.lastGasUpdate = new Date(Date.now() - (300 - i) * 5 * 60 * 1000)
        service.updateGasHistory(20 + i)
      }

      // Should keep only last 288
      expect(service.gasHistoryCache.length).toBeLessThanOrEqual(288)
    })
  })

  describe('Protocol Metrics', () => {
    it('should aggregate protocol metrics from monitoring service', async () => {
      // Mock monitoring service
      const mockMetrics = {
        aavePools: [
          {
            id: 'aave:usdc',
            asset: 'USDC',
            tvlUsd: 1000000,
            supplyApy: 8.2,
            apyTrend7d: 0.5,
            volume24hUsd: 50000,
            riskScore: 2
          }
        ],
        yearnVaults: [
          {
            id: 'yearn:usdc',
            asset: 'USDC',
            tvlUsd: 500000,
            apy: 9.5,
            apyTrend7d: -0.3,
            riskScore: 3
          }
        ],
        nablaPools: []
      }

      vi.spyOn(require('../../src/services/monitoring/monitoring.service'), 'monitoringService', 'get')
        .mockReturnValue({
          getProtocolMetrics: vi.fn().mockResolvedValue(mockMetrics)
        })

      const protocols = await marketContextService['getProtocolMetrics']()

      expect(protocols).toBeInstanceOf(Array)
      expect(protocols.length).toBeGreaterThan(0)

      const aavePool = protocols.find(p => p.id === 'aave:usdc')
      expect(aavePool).toBeDefined()
      expect(aavePool?.tvl).toBe(1000000)
      expect(aavePool?.apy).toBe(8.2)
    })

    it('should handle empty protocol metrics', async () => {
      vi.spyOn(require('../../src/services/monitoring/monitoring.service'), 'monitoringService', 'get')
        .mockReturnValue({
          getProtocolMetrics: vi.fn().mockResolvedValue({
            aavePools: [],
            yearnVaults: [],
            nablaPools: []
          })
        })

      const protocols = await marketContextService['getProtocolMetrics']()

      expect(protocols).toBeInstanceOf(Array)
      expect(protocols.length).toBe(0)
    })
  })

  describe('Full Context Aggregation', () => {
    it('should return complete market context', async () => {
      const context = await marketContextService.getContext()

      expect(context).toBeDefined()
      expect(context.network).toBeDefined()
      expect(context.network.name).toBe('monad-testnet')
      expect(context.network.currentGasPrice).toBeGreaterThan(0)
      expect(context.network.averageGasPrice24h).toBeGreaterThan(0)
      expect(context.network.gasPriceTrend).toBeDefined()

      expect(context.market).toBeDefined()
      expect(context.market.fearGreedIndex).toBeGreaterThanOrEqual(0)
      expect(context.market.fearGreedIndex).toBeLessThanOrEqual(100)

      expect(context.protocols).toBeInstanceOf(Array)
      expect(context.timestamp).toBeDefined()
    })

    it('should handle RPC failures gracefully', async () => {
      // Mock RPC to fail
      vi.spyOn(ethers.JsonRpcProvider.prototype, 'getFeeData')
        .mockRejectedValue(new Error('RPC unavailable'))

      const context = await marketContextService.getContext()

      // Should return fallback values
      expect(context).toBeDefined()
      expect(context.network.currentGasPrice).toBe(20) // Fallback
      expect(context.network.averageGasPrice24h).toBe(20)
    })
  })
})
