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
      const response = await this.query<EnvioPortfolioData>(PORTFOLIO_QUERY, { address })
      if (response == null) return null

      const totalValueUSD = response.portfolio?.totalValueUsd ?? null
      const netAPY = response.portfolio?.netApy ?? null
      const positions = response.positions?.map((position) => ({
        protocol: position.protocol ?? 'Unknown protocol',
        asset: position.asset ?? 'Unknown asset',
        amount: position.amount ?? 0,
        valueUSD: position.valueUsd ?? 0,
        currentAPY: position.currentApy ?? 0,
        riskScore: position.riskScore ?? 0
      })) ?? []

      if (totalValueUSD == null || netAPY == null) return null

      return {
        totalValueUSD,
        netAPY,
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
      const response = await this.query<EnvioAlertsData>(ALERTS_QUERY, { address })
      if (response == null) return null

      return (response.alerts ?? []).map((alert) => ({
        id: alert.id ?? randomUUID(),
        title: buildAlertTitle(alert.protocol),
        severity: toAlertSeverity(alert.severity),
        description: alert.message ?? 'Event detected',
        createdAt: alert.detectedAt ?? new Date().toISOString()
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
        timeout: 10_000
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

const PORTFOLIO_QUERY = `
  query CorporatePortfolio($address: String!) {
    portfolio: corporatePortfolio(args: { address: $address }) {
      totalValueUsd
      netApy
    }
    positions: corporatePositions(args: { address: $address }) {
      protocol
      asset
      amount
      valueUsd
      currentApy
      riskScore
    }
  }
`

const ALERTS_QUERY = `
  query RiskAlerts($address: String!) {
    alerts: riskAlerts(args: { address: $address }) {
      protocol
      severity
      message
      detectedAt
    }
  }
`

export const envioClient = new EnvioClient()
