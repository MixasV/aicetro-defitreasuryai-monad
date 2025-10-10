import type {
  MonitoringPollerAccountResult,
  MonitoringPollerMetrics,
  MonitoringPollerRunSummary,
  MonitoringPollerStatus,
  MonitoringPollerTrigger
} from '@defitreasuryai/types'
import { logger } from '../config/logger'
import { blockchainService } from '../services/blockchain/blockchain.service'
import { monitoringService } from '../services/monitoring/monitoring.service'
import { riskService } from '../services/risk/risk.service'
import { portfolioAnalyticsService } from '../services/monitoring/portfolio.analytics.service'
import { alertingService } from '../services/monitoring/alerting.service'

export class MonitoringPoller {
  private handle: NodeJS.Timeout | null = null
  private running = false
  private enabled = false
  private lastRunAt: Date | null = null
  private lastDurationMs: number | null = null
  private lastError: string | null = null
  private lastSummary: MonitoringPollerRunSummary | null = null
  private readonly history: MonitoringPollerRunSummary[] = []

  constructor (private readonly intervalMs: number) {}

  getStatus (): MonitoringPollerStatus {
    return {
      enabled: this.enabled,
      running: this.running,
      intervalMs: this.intervalMs,
      lastRunAt: this.lastRunAt?.toISOString(),
      lastDurationMs: this.lastDurationMs ?? undefined,
      lastError: this.lastError ?? undefined,
      lastSummary: this.lastSummary ?? undefined
    }
  }

  start (): boolean {
    if (this.enabled) {
      logger.info('Monitoring poller already running, skipping start.')
      return false
    }

    this.enabled = true
    this.handle = setInterval(() => {
      void this.runCycle('automatic')
    }, this.intervalMs)

    if (typeof this.handle.unref === 'function') {
      this.handle.unref()
    }

    void this.runCycle('automatic')
    logger.info({ interval: this.intervalMs }, 'Monitoring poller started.')
    return true
  }

  stop (): boolean {
    if (!this.enabled) {
      logger.info('Monitoring poller already stopped, skipping.')
      return false
    }

    if (this.handle != null) {
      clearInterval(this.handle)
      this.handle = null
    }

    this.enabled = false
    logger.info('Monitoring poller stopped.')
    return true
  }

  async runOnce (source: MonitoringPollerTrigger = 'manual'): Promise<MonitoringPollerRunSummary | null> {
    return await this.runCycle(source)
  }

  getHistory (limit = 10): MonitoringPollerRunSummary[] {
    if (limit <= 0) {
      return []
    }

    return this.history.slice(0, limit)
  }

  getMetrics (): MonitoringPollerMetrics {
    const totalRuns = this.history.length
    if (totalRuns === 0) {
      return {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        successRate: 0,
        averageDurationMs: 0,
        averageAccountsPerRun: 0,
        lastRunAt: this.lastRunAt?.toISOString()
      }
    }

    const successfulRuns = this.history.filter((run) => run.errorCount === 0).length
    const failedRuns = totalRuns - successfulRuns
    const totalDuration = this.history.reduce((sum, run) => sum + run.durationMs, 0)
    const totalAccounts = this.history.reduce((sum, run) => sum + run.processedAccounts, 0)

    const lastSuccessAt = this.history.find((run) => run.errorCount === 0)?.finishedAt
    const lastErrorAt = this.history.find((run) => run.errorCount > 0)?.finishedAt

    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate: successfulRuns / totalRuns,
      averageDurationMs: Math.round(totalDuration / totalRuns),
      averageAccountsPerRun: totalAccounts / totalRuns,
      lastRunAt: this.lastRunAt?.toISOString(),
      lastSuccessAt,
      lastErrorAt
    }
  }

  private async runCycle (source: MonitoringPollerTrigger): Promise<MonitoringPollerRunSummary | null> {
    if (this.running) {
      const message = 'Monitoring poller iteration already running.'
      if (source === 'manual') {
        throw new Error(message)
      }

      logger.warn(message)
      return null
    }

    this.running = true
    const startedAt = new Date()
    const results: MonitoringPollerAccountResult[] = []
    let errorCount = 0
    let summary: MonitoringPollerRunSummary | null = null
    let protocolMetricsUpdated = false
    let protocolMetricsError: string | undefined

    try {
      const accounts = await blockchainService.listCorporateAccounts()

      for (const account of accounts) {
        const normalizedAccount = account.address.toLowerCase()
        const record: MonitoringPollerAccountResult = {
          account: normalizedAccount,
          snapshotFetched: false,
          alertsFetched: false,
          riskCalculated: false,
          projectionBuilt: false
        }
        const errors: string[] = []

        try {
          await monitoringService.getPortfolioSnapshot(account.address)
          record.snapshotFetched = true
        } catch (error) {
          errors.push(extractErrorMessage(error, 'snapshot'))
          logger.error({ err: error, account: normalizedAccount }, 'Monitoring poller: не удалось обновить snapshot')
        }

        try {
          await monitoringService.getRiskAlerts(account.address)
          record.alertsFetched = true
        } catch (error) {
          errors.push(extractErrorMessage(error, 'alerts'))
          logger.error({ err: error, account: normalizedAccount }, 'Monitoring poller: не удалось обновить alerts')
        }

        try {
          const insights = await riskService.getRiskInsights(account.address)
          record.riskCalculated = true
          await alertingService.notifyMonitoringAnomaly(insights)
        } catch (error) {
          errors.push(extractErrorMessage(error, 'risk'))
          logger.error({ err: error, account: normalizedAccount }, 'Monitoring poller: не удалось рассчитать риск-инсайты')
        }

        try {
          await portfolioAnalyticsService.buildProjection(account.address)
          record.projectionBuilt = true
        } catch (error) {
          errors.push(extractErrorMessage(error, 'projection'))
          logger.error({ err: error, account: normalizedAccount }, 'Monitoring pollер: не удалось построить проекцию портфеля')
        }

        if (errors.length > 0) {
          record.error = errors.join('; ')
          errorCount += 1
        }

        results.push(record)
      }

      try {
        await monitoringService.getProtocolMetrics()
        protocolMetricsUpdated = true
      } catch (error) {
        const errMessage = extractErrorMessage(error, 'protocol-metrics')
        protocolMetricsError = errMessage
        errorCount += 1
        logger.error({ err: error }, 'Monitoring poller: не удалось обновить метрики протоколов')
      }
    } catch (error) {
      errorCount += 1
      const errMessage = extractErrorMessage(error, 'poller')
      this.lastError = errMessage
      logger.error({ err: error }, 'Monitoring poller iteration failed')
    } finally {
      const finishedAt = new Date()
      const durationMs = finishedAt.getTime() - startedAt.getTime()
      const successCount = results.filter((result) =>
        result.snapshotFetched &&
        result.alertsFetched &&
        result.riskCalculated &&
        result.projectionBuilt
      ).length

      summary = {
        source,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs,
        processedAccounts: results.length,
        successCount,
        errorCount,
        results,
        protocolMetricsUpdated,
        protocolMetricsError
      }

      this.lastRunAt = startedAt
      this.lastDurationMs = durationMs
      this.lastSummary = summary
      this.history.unshift(summary)
      if (this.history.length > 20) {
        this.history.splice(20)
      }
      if (errorCount === 0) {
        this.lastError = null
      } else if (this.lastError == null) {
        this.lastError = 'Monitoring poller completed with errors'
      }

      this.running = false
    }

    return summary
  }
}

const extractErrorMessage = (error: unknown, context: string): string => {
  if (error instanceof Error) {
    return `${context}: ${error.message}`
  }

  return `${context}: ${String(error)}`
}
