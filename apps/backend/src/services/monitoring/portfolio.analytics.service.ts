import { monitoringService } from './monitoring.service'
import { monitoringStateService } from './monitoring.state'
import type { PortfolioProjection, PortfolioMetricPoint } from '../../types/ai.js'

const DAY_MS = 24 * 60 * 60 * 1000

class PortfolioAnalyticsService {
  private readonly horizons = [0, 30, 90]

  async buildProjection (account: string): Promise<PortfolioProjection> {
    if (account.trim().length === 0) {
      throw new Error('Адрес обязателен')
    }

    const snapshot = await monitoringService.getPortfolioSnapshot(account)
    const baseValue = round(snapshot.totalValueUSD)
    const netApy = Number(snapshot.netAPY.toFixed(4))
    const now = Date.now()

    const points: PortfolioMetricPoint[] = this.horizons.map((days) => {
      const factor = this.computeGrowthFactor(netApy, days)
      const netAssetValue = round(baseValue * factor)
      const projectedYield = round(netAssetValue - baseValue)

      return {
        timestamp: new Date(now + days * DAY_MS).toISOString(),
        netAssetValue,
        projectedYield
      }
    })

    const projection: PortfolioProjection = {
      baseValueUsd: baseValue,
      netApy,
      horizons: [...this.horizons],
      points,
      generatedAt: new Date(now).toISOString()
    }

    monitoringStateService.setProjection(account, projection)

    return projection
  }

  private computeGrowthFactor (netApy: number, days: number): number {
    if (days === 0) return 1
    const rate = netApy / 100
    const period = days / 365
    if (rate === 0) return 1
    return Math.pow(1 + rate, period)
  }
}

const round = (value: number): number => Number(value.toFixed(2))

export const portfolioAnalyticsService = new PortfolioAnalyticsService()
