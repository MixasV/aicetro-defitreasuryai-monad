import { randomUUID } from 'node:crypto'
import axios from 'axios'
import type { AlertEvent } from '@defitreasuryai/types'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import type { PortfolioSnapshot } from '../../types/ai.js'

interface EnvioPortfolioData {
  portfolio?: {
    totalValueUsd?: number
    netApy?: number
  }
  positions?: Array<{
    protocol?: string
    asset?: string
    amount?: number
    valueUsd?: number
    currentApy?: number
    riskScore?: number
  }>
}

interface EnvioAlertsData {
  alerts?: Array<{
    id?: string
    protocol?: string
    severity?: string
    message?: string
    detectedAt?: string
  }>
}

interface GraphqlResponse<T> {
  data?: T
  errors?: Array<{ message?: string }>
}

class EnvioClient {
  private readonly endpoint = env.envioGraphqlUrl
  private readonly apiKey = env.envioApiKey

  private get isConfigured (): boolean {
    return this.endpoint !== '' && this.apiKey !== ''
  }

  async fetchPortfolio (address: string): Promise<PortfolioSnapshot | null> {
    if (!this.isConfigured) return null

    try {
      const response = await this.query<{ UserPosition?: any[] }>(PORTFOLIO_QUERY, { address })
      if (response == null || !response.UserPosition) return null

      // Map UserPosition data to portfolio format
      const positions = response.UserPosition.map((position: any) => {
        // Extract protocol from pool_id (format: "protocol:poolAddress")
        const protocol = position.pool_id?.split(':')[0] ?? 'Unknown protocol'
        const poolAddress = position.pool_id?.split(':')[1] ?? 'Unknown pool'

        return {
          protocol,
          asset: poolAddress, // Pool address as asset identifier
          amount: Number(position.shares ?? 0),
          valueUSD: Number(position.totalDeposited ?? 0), // Use totalDeposited as value estimate
          currentAPY: 0, // Not tracked in UserPosition
          riskScore: 0 // Not tracked in UserPosition
        }
      })

      // Calculate total from positions
      const totalValueUSD = positions.reduce((sum, p) => sum + p.valueUSD, 0)
      
      // Return null if no positions (avoid empty portfolio)
      if (positions.length === 0) return null

      return {
        totalValueUSD,
        netAPY: 0, // Not calculated from on-chain data
        positions
      }
    } catch (error) {
      logger.warn({ err: error }, '[envio] Failed to fetch portfolio data')
      return null
    }
  }

  async fetchAlerts (address: string): Promise<AlertEvent[] | null> {
    if (!this.isConfigured) return null

    try {
      const response = await this.query<{ AITreasurySmartAccount_HighRiskAlert?: any[] }>(ALERTS_QUERY, { address })
      if (response == null || !response.AITreasurySmartAccount_HighRiskAlert) return null

      return response.AITreasurySmartAccount_HighRiskAlert.map((alert: any) => ({
        id: randomUUID(),
        title: buildAlertTitle(alert.protocol),
        severity: toAlertSeverity(alert.alertType),
        description: `Estimated loss: $${alert.estimatedLossUsd || 0}`,
        createdAt: new Date(Number(alert.alertTimestamp) * 1000).toISOString()
      }))
    } catch (error) {
      logger.warn({ err: error }, '[envio] Failed to fetch alerts')
      return null
    }
  }

  async query<T> (query: string, variables: Record<string, unknown> = {}): Promise<T | null> {
    try {
      const { data } = await axios.post<GraphqlResponse<T>>(this.endpoint, { query, variables }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        timeout: 30_000 // Increased from 10s to 30s for slow Envio indexer
      })

      if (data.errors != null && data.errors.length > 0) {
        logger.warn({ errors: data.errors }, '[envio] GraphQL returned errors')
        return null
      }

      return data.data ?? null
    } catch (error) {
      logger.warn({ err: error }, '[envio] GraphQL query error')
      return null
    }
  }
}

const buildAlertTitle = (protocol?: string): string => {
  const safeProtocol = protocol ?? 'Protocol'
  return `${safeProtocol} risk alert`
}

const toAlertSeverity = (severity?: string): AlertEvent['severity'] => {
  if (severity === 'high') return 'critical'
  if (severity === 'medium') return 'warning'
  return 'info'
}

// ⚠️ FIXED: Use correct Envio schema fields
// UserPosition table has: user, pool_id, shares, totalDeposited, totalWithdrawn
// Need to join with Pool table to get protocol info

const PORTFOLIO_QUERY = `
  query UserPortfolio($address: String!) {
    UserPosition(where: { user: { _eq: $address } }) {
      id
      user
      pool_id
      shares
      totalDeposited
      totalWithdrawn
      depositCount
      withdrawCount
    }
  }
`

const ALERTS_QUERY = `
  query HighRiskAlerts($address: String!) {
    AITreasurySmartAccount_HighRiskAlert(
      where: { smartAccount: { _eq: $address } }
      order_by: { timestamp: desc }
      limit: 10
    ) {
      protocol
      alertType
      estimatedLossUsd
      alertTimestamp
    }
  }
`

export const envioClient = new EnvioClient()
