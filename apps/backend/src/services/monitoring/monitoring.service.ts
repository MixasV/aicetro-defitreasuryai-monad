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
    const payload = snapshot ?? await buildFallbackSnapshot(address)
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

const buildFallbackSnapshot = async (address: string): Promise<PortfolioSnapshot> => {
  // Get REAL balance from Monad Testnet RPC
  try {
    const { ethers } = await import('ethers')
    const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz')
    const balance = await provider.getBalance(address)
    const balanceMON = parseFloat(ethers.formatEther(balance))
    // Approximate MON price (update if needed)
    const monPriceUSD = 5
    const totalValueUSD = balanceMON * monPriceUSD
    
    console.log('[Monitoring] Portfolio snapshot fallback: real balance', {
      address,
      balanceMON: balanceMON.toFixed(4),
      totalValueUSD: totalValueUSD.toFixed(2)
    })
    
    return {
      totalValueUSD: Math.max(totalValueUSD, 0),
      netAPY: 0,
      positions: []
    }
  } catch (error) {
    console.error('[Monitoring] Failed to get real balance, using zero:', error)
    return {
      totalValueUSD: 0,
      netAPY: 0,
      positions: []
    }
  }
}

const buildFallbackAlerts = (): AlertEvent[] => ([
  {
    id: 'fallback-yearn-alert',
    title: 'Yearn Monad risk alert',
    severity: 'warning',
    description: 'APY dropped by 1.2% over the last 4 hours.',
    createdAt: new Date().toISOString()
  }
])
