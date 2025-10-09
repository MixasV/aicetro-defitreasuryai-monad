import type { AlertEvent } from '@defitreasuryai/types'
import { envioClient } from './envio.client'
import type { MonadProtocolMetrics, PortfolioSnapshot } from '../../types/ai.js'
import { monitoringStateService } from './monitoring.state'
import { monadProtocolsService } from './monad.protocols.service'

class MonitoringService {
  async getPortfolioSnapshot (address: string): Promise<PortfolioSnapshot> {
    if (address.trim().length === 0) {
      throw new Error('Address is required')
    }

    const snapshot = await envioClient.fetchPortfolio(address)
    const payload = snapshot ?? buildFallbackSnapshot()
    monitoringStateService.setSnapshot(address, payload)
    return payload
  }

  async getRiskAlerts (address: string): Promise<AlertEvent[]> {
    if (address.trim().length === 0) {
      throw new Error('Address is required')
    }

    const alerts = await envioClient.fetchAlerts(address)
    const payload = alerts ?? buildFallbackAlerts()
    monitoringStateService.setAlerts(address, payload)
    return payload
  }

  async getProtocolMetrics (): Promise<MonadProtocolMetrics> {
    const metrics = await monadProtocolsService.getProtocolMetrics()
    monitoringStateService.setProtocolMetrics('monad', metrics)
    return metrics
  }
}

export const monitoringService = new MonitoringService()

const buildFallbackSnapshot = (): PortfolioSnapshot => ({
  totalValueUSD: 100_000,
  netAPY: 8.2,
  positions: [
    {
      protocol: 'Aave Monad',
      asset: 'USDC',
      amount: 50_000,
      valueUSD: 50_000,
      currentAPY: 8.4,
      riskScore: 2
    },
    {
      protocol: 'Yearn Monad',
      asset: 'USDT',
      amount: 25_000,
      valueUSD: 24_900,
      currentAPY: 11.8,
      riskScore: 4
    }
  ]
})

const buildFallbackAlerts = (): AlertEvent[] => ([
  {
    id: 'fallback-yearn-alert',
    title: 'Yearn Monad risk alert',
    severity: 'warning',
    description: 'APY dropped by 1.2% over the last 4 hours.',
    createdAt: new Date().toISOString()
  }
])
