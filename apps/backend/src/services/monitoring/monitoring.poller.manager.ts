import type { MonitoringPollerMetrics, MonitoringPollerRunSummary, MonitoringPollerStatus } from '@defitreasuryai/types'
import { env } from '../../config/env'
import { MonitoringPoller } from '../../jobs/monitoring.poller'

const poller = new MonitoringPoller(env.monitoringPollIntervalMs)

export const initializeMonitoringPoller = (): void => {
  if (env.monitoringPollEnabled) {
    poller.start()
  }
}

export const shutdownMonitoringPoller = (): void => {
  poller.stop()
}

export const getMonitoringPollerStatus = (): MonitoringPollerStatus => poller.getStatus()
export const getMonitoringPollerHistory = (limit?: number): MonitoringPollerRunSummary[] => poller.getHistory(limit)
export const getMonitoringPollerMetrics = (): MonitoringPollerMetrics => poller.getMetrics()

export const startMonitoringPoller = (): boolean => poller.start()

export const stopMonitoringPoller = (): boolean => poller.stop()

export const runMonitoringPollerOnce = async (): Promise<MonitoringPollerRunSummary | null> => await poller.runOnce('manual')

export const monitoringPollerInstance = poller
