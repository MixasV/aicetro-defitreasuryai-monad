/* eslint-disable import/first */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

const monitoringSnapshotMock = vi.hoisted(() => vi.fn())
const monitoringAlertsMock = vi.hoisted(() => vi.fn())
const protocolMetricsMock = vi.hoisted(() => vi.fn())
const riskInsightsMock = vi.hoisted(() => vi.fn())
const projectionMock = vi.hoisted(() => vi.fn())
const listAccountsMock = vi.hoisted(() => vi.fn())
const alertWebhookMock = vi.hoisted(() => vi.fn())

vi.mock('../../services/monitoring/monitoring.service', () => ({
  monitoringService: {
    getPortfolioSnapshot: monitoringSnapshotMock,
    getRiskAlerts: monitoringAlertsMock,
    getProtocolMetrics: protocolMetricsMock
  }
}))

vi.mock('../../services/risk/risk.service', () => ({
  riskService: {
    getRiskInsights: riskInsightsMock
  }
}))

vi.mock('../../services/monitoring/alerting.service', () => ({
  alertingService: {
    notifyMonitoringAnomaly: alertWebhookMock
  }
}))

vi.mock('../../services/monitoring/portfolio.analytics.service', () => ({
  portfolioAnalyticsService: {
    buildProjection: projectionMock
  }
}))

vi.mock('../../services/blockchain/blockchain.service', () => ({
  blockchainService: {
    listCorporateAccounts: listAccountsMock
  }
}))

import { MonitoringPoller } from '../monitoring.poller'

describe('MonitoringPoller', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-05T12:00:00Z'))

    monitoringSnapshotMock.mockResolvedValue({
      totalValueUSD: 100_000,
      netAPY: 8.4,
      positions: []
    })
    monitoringAlertsMock.mockResolvedValue([])
    protocolMetricsMock.mockResolvedValue({
      source: 'fallback',
      fetchedAt: new Date().toISOString(),
      nablaPools: [],
      uniswapPairs: []
    })
    riskInsightsMock.mockResolvedValue({ account: '0xaccount', exposure: [], guardrails: { maxAllowedRiskScore: 3, highestPositionRisk: 2, violations: [] }, delegation: { dailyLimitUsd: 10_000, spent24hUsd: 2_500, remainingDailyLimitUsd: 7_500, utilization: 0.25 }, netAPY: 8.4, totalValueUsd: 100_000, updatedAt: new Date().toISOString() })
    projectionMock.mockResolvedValue({
      baseValueUsd: 100_000,
      netApy: 8.4,
      horizons: [0, 30, 90],
      points: [],
      generatedAt: new Date().toISOString()
    })
    listAccountsMock.mockResolvedValue([
      { address: '0xAccount', owners: [], threshold: 2, createdAt: new Date().toISOString() }
    ])
    alertWebhookMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('выполняет ручной прогон и возвращает сводку', async () => {
    const poller = new MonitoringPoller(10_000)
    const summary = await poller.runOnce('manual')

    expect(summary).not.toBeNull()
    expect(summary?.processedAccounts).toBe(1)
    expect(summary?.successCount).toBe(1)
    expect(summary?.protocolMetricsUpdated).toBe(true)
    expect(summary?.protocolMetricsError).toBeUndefined()
    expect(monitoringSnapshotMock).toHaveBeenCalledWith('0xAccount')
    expect(monitoringAlertsMock).toHaveBeenCalledWith('0xAccount')
    expect(riskInsightsMock).toHaveBeenCalledWith('0xAccount')
    expect(projectionMock).toHaveBeenCalledWith('0xAccount')
    expect(protocolMetricsMock).toHaveBeenCalledTimes(1)

    const status = poller.getStatus()
    expect(status.lastRunAt).toBeDefined()
    expect(status.running).toBe(false)
    expect(status.lastSummary?.source).toBe('manual')
  })

  it('не допускает параллельных ручных запусков', async () => {
    const poller = new MonitoringPoller(10_000)

    const firstRun = poller.runOnce('manual')
    await expect(poller.runOnce('manual')).rejects.toThrow('Monitoring poller iteration уже выполняется.')

    await firstRun
  })

  it('запускает автоматический режим и корректно останавливается', async () => {
    const poller = new MonitoringPoller(60_000)

    expect(poller.start()).toBe(true)
    expect(poller.start()).toBe(false)

    await vi.runOnlyPendingTimersAsync()

    expect(poller.getStatus().enabled).toBe(true)

    expect(poller.stop()).toBe(true)
    expect(poller.stop()).toBe(false)
  })

  it('фиксирует ошибки при сбоях сервисов', async () => {
    monitoringAlertsMock.mockRejectedValueOnce(new Error('alerts failed'))

    const poller = new MonitoringPoller(10_000)
    const summary = await poller.runOnce('manual')

    expect(summary?.errorCount).toBe(1)
    expect(summary?.results[0].alertsFetched).toBe(false)
    expect(summary?.results[0].error).toContain('alerts failed')
    expect(poller.getStatus().lastError).toBe('Monitoring poller completed with errors')
  })

  it('фиксирует ошибку метрик протоколов', async () => {
    protocolMetricsMock.mockRejectedValueOnce(new Error('metrics down'))

    const poller = new MonitoringPoller(10_000)
    const summary = await poller.runOnce('manual')

    expect(summary?.errorCount).toBe(1)
    expect(summary?.protocolMetricsUpdated).toBe(false)
    expect(summary?.protocolMetricsError).toContain('metrics down')
    expect(protocolMetricsMock).toHaveBeenCalledTimes(1)
  })

  it('сохраняет историю исполнений и применяет лимит', async () => {
    const poller = new MonitoringPoller(10_000)

    await poller.runOnce('manual')
    await poller.runOnce('manual')
    await poller.runOnce('manual')

    const fullHistory = poller.getHistory()
    expect(fullHistory.length).toBe(3)
    const latest = fullHistory[0]
    expect(latest).toBeDefined()
    if (latest != null) {
      expect(latest.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T[0-9:.-]+Z$/)
    }

    const limitedHistory = poller.getHistory(2)
    expect(limitedHistory.length).toBe(2)
  })

  it('возвращает агрегированные метрики', async () => {
    const poller = new MonitoringPoller(10_000)

    await poller.runOnce('manual')
    monitoringAlertsMock.mockRejectedValueOnce(new Error('alerts failed'))
    await poller.runOnce('manual')

    const metrics = poller.getMetrics()

    expect(metrics.totalRuns).toBe(2)
    expect(metrics.successfulRuns).toBe(1)
    expect(metrics.failedRuns).toBe(1)
    expect(metrics.successRate).toBeCloseTo(0.5)
    expect(metrics.averageDurationMs).toBeGreaterThanOrEqual(0)
    expect(metrics.averageAccountsPerRun).toBeGreaterThan(0)
    expect(metrics.lastRunAt).toBeDefined()
    expect(metrics.lastSuccessAt).toBeDefined()
    expect(metrics.lastErrorAt).toBeDefined()
  })

  it('вызывает алерт при нарушении лимитов делегирования', async () => {
    riskInsightsMock.mockResolvedValueOnce({
      account: '0xaccount',
      exposure: [],
      guardrails: { maxAllowedRiskScore: 3, highestPositionRisk: 5, violations: ['risk violation'] },
      delegation: { dailyLimitUsd: 10_000, spent24hUsd: 9_500, remainingDailyLimitUsd: 500, utilization: 0.95 },
      netAPY: 8.4,
      totalValueUsd: 100_000,
      updatedAt: new Date().toISOString()
    })

    const poller = new MonitoringPoller(10_000)
    await poller.runOnce('manual')

    expect(alertWebhookMock).toHaveBeenCalledTimes(1)
    expect(alertWebhookMock).toHaveBeenCalledWith(
      expect.objectContaining({
        account: '0xaccount',
        guardrails: expect.objectContaining({ violations: expect.arrayContaining(['risk violation']) })
      })
    )
  })
})
