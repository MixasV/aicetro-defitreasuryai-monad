import type { AlertEvent } from '@defitreasuryai/types'
import type { MonadProtocolMetrics, PortfolioProjection, PortfolioSnapshot, RiskInsights } from '../../types/ai.js'
import { monitoringEventBus } from './monitoring.events'

interface SnapshotState {
  account: string
  snapshot: PortfolioSnapshot
}

interface AlertsState {
  account: string
  alerts: AlertEvent[]
}

interface RiskState {
  account: string
  insights: RiskInsights
}

interface ProjectionState {
  account: string
  projection: PortfolioProjection
}

interface ProtocolMetricsState {
  network: string
  metrics: MonadProtocolMetrics
}

const normalizeAccount = (account: string): string => account.toLowerCase()

export class MonitoringStateService {
  private readonly snapshots = new Map<string, PortfolioSnapshot>()
  private readonly alerts = new Map<string, AlertEvent[]>()
  private readonly risks = new Map<string, RiskInsights>()
  private readonly projections = new Map<string, PortfolioProjection>()
  private readonly protocolMetrics = new Map<string, MonadProtocolMetrics>()

  setSnapshot (account: string, snapshot: PortfolioSnapshot) {
    const key = normalizeAccount(account)
    this.snapshots.set(key, snapshot)
    monitoringEventBus.emit('snapshot', { account: key, snapshot })
  }

  setAlerts (account: string, alerts: AlertEvent[]) {
    const key = normalizeAccount(account)
    this.alerts.set(key, alerts)
    monitoringEventBus.emit('alerts', { account: key, alerts })
  }

  setRisk (account: string, insights: RiskInsights) {
    const key = normalizeAccount(account)
    this.risks.set(key, insights)
    monitoringEventBus.emit('risk', { account: key, insights })
  }

  setProjection (account: string, projection: PortfolioProjection) {
    const key = normalizeAccount(account)
    this.projections.set(key, projection)
    monitoringEventBus.emit('projection', { account: key, projection })
  }

  setProtocolMetrics (network: string, metrics: MonadProtocolMetrics) {
    const key = network.toLowerCase()
    this.protocolMetrics.set(key, metrics)
    monitoringEventBus.emit('protocol-metrics', { network: key, metrics })
  }

  getSnapshot (account: string): SnapshotState | undefined {
    const key = normalizeAccount(account)
    const snapshot = this.snapshots.get(key)
    if (snapshot == null) return undefined
    return { account: key, snapshot }
  }

  getAlerts (account: string): AlertsState | undefined {
    const key = normalizeAccount(account)
    const alerts = this.alerts.get(key)
    if (alerts == null) return undefined
    return { account: key, alerts }
  }

  getRisk (account: string): RiskState | undefined {
    const key = normalizeAccount(account)
    const insights = this.risks.get(key)
    if (insights == null) return undefined
    return { account: key, insights }
  }

  getProjection (account: string): ProjectionState | undefined {
    const key = normalizeAccount(account)
    const projection = this.projections.get(key)
    if (projection == null) return undefined
    return { account: key, projection }
  }

  getProtocolMetrics (network: string): ProtocolMetricsState | undefined {
    const key = network.toLowerCase()
    const metrics = this.protocolMetrics.get(key)
    if (metrics == null) return undefined
    return { network: key, metrics }
  }

  listSnapshots (): SnapshotState[] {
    return Array.from(this.snapshots.entries()).map(([account, snapshot]) => ({
      account,
      snapshot
    }))
  }

  listAlerts (): AlertsState[] {
    return Array.from(this.alerts.entries()).map(([account, alerts]) => ({
      account,
      alerts
    }))
  }

  listRisks (): RiskState[] {
    return Array.from(this.risks.entries()).map(([account, insights]) => ({
      account,
      insights
    }))
  }

  listProjections (): ProjectionState[] {
    return Array.from(this.projections.entries()).map(([account, projection]) => ({
      account,
      projection
    }))
  }

  listProtocolMetrics (): ProtocolMetricsState[] {
    return Array.from(this.protocolMetrics.entries()).map(([network, metrics]) => ({
      network,
      metrics
    }))
  }
}

export const monitoringStateService = new MonitoringStateService()
