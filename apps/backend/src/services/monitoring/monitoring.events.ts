import { EventEmitter } from 'node:events'
import type { AlertEvent } from '@defitreasuryai/types'
import type { MonadProtocolMetrics, PortfolioProjection, PortfolioSnapshot, RiskInsights } from '../../types/ai.js'

export interface MonitoringSnapshotEvent {
  account: string
  snapshot: PortfolioSnapshot
}

export interface MonitoringAlertsEvent {
  account: string
  alerts: AlertEvent[]
}

export interface MonitoringRiskEvent {
  account: string
  insights: RiskInsights
}

export interface MonitoringProjectionEvent {
  account: string
  projection: PortfolioProjection
}

export interface MonitoringProtocolMetricsEvent {
  network: string
  metrics: MonadProtocolMetrics
}

interface MonitoringEventMap {
  snapshot: MonitoringSnapshotEvent
  alerts: MonitoringAlertsEvent
  risk: MonitoringRiskEvent
  projection: MonitoringProjectionEvent
  'protocol-metrics': MonitoringProtocolMetricsEvent
}

export class MonitoringEventBus extends EventEmitter {
  emit<K extends keyof MonitoringEventMap>(event: K, payload: MonitoringEventMap[K]): boolean {
    return super.emit(event, payload)
  }

  on<K extends keyof MonitoringEventMap>(event: K, listener: (payload: MonitoringEventMap[K]) => void): this {
    return super.on(event, listener)
  }

  off<K extends keyof MonitoringEventMap>(event: K, listener: (payload: MonitoringEventMap[K]) => void): this {
    return super.off(event, listener)
  }
}

export const monitoringEventBus = new MonitoringEventBus()
