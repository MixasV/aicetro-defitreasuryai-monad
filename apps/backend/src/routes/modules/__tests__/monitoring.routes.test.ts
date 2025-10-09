import type { Request, Response } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import type { AlertEvent, MonitoringPollerRunSummary, MonadProtocolMetrics } from '@defitreasuryai/types'
import type { PortfolioSnapshot } from '../../../types/ai.js'

const getPortfolioSnapshotMock = vi.hoisted(() => vi.fn())
const getRiskAlertsMock = vi.hoisted(() => vi.fn())
const getRiskInsightsMock = vi.hoisted(() => vi.fn())
const buildProjectionMock = vi.hoisted(() => vi.fn())
const eventBusOnMock = vi.hoisted(() => vi.fn())
const eventBusOffMock = vi.hoisted(() => vi.fn())
const getSnapshotStateMock = vi.hoisted(() => vi.fn())
const getAlertsStateMock = vi.hoisted(() => vi.fn())
const getRiskStateMock = vi.hoisted(() => vi.fn())
const getProjectionStateMock = vi.hoisted(() => vi.fn())
const getProtocolMetricsStateMock = vi.hoisted(() => vi.fn())
const listSnapshotsMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const listAlertsMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const listRisksMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const listProjectionsMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const listProtocolMetricsMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const getPollerStatusMock = vi.hoisted(() => vi.fn())
const getPollerMetricsMock = vi.hoisted(() => vi.fn())
const startPollerMock = vi.hoisted(() => vi.fn())
const stopPollerMock = vi.hoisted(() => vi.fn())
const runPollerOnceMock = vi.hoisted(() => vi.fn())
const getPollerHistoryMock = vi.hoisted(() => vi.fn())
const getStreamStatusMock = vi.hoisted(() => vi.fn())
const startStreamMock = vi.hoisted(() => vi.fn())
const stopStreamMock = vi.hoisted(() => vi.fn())
const getProtocolMetricsMock = vi.hoisted(() => vi.fn())

const ACCOUNT_ADDRESS = '0x12345678'
const DEFAULT_STREAM_STATUS = {
  enabled: true,
  running: true,
  connected: true,
  observedAccounts: 2
}

vi.mock('../../../services/monitoring/monitoring.service', () => ({
  monitoringService: {
    getPortfolioSnapshot: getPortfolioSnapshotMock,
    getRiskAlerts: getRiskAlertsMock,
    getProtocolMetrics: getProtocolMetricsMock
  }
}))

vi.mock('../../../services/monitoring/portfolio.analytics.service', () => ({
  portfolioAnalyticsService: {
    buildProjection: buildProjectionMock
  }
}))

vi.mock('../../../services/risk/risk.service', () => ({
  riskService: {
    getRiskInsights: getRiskInsightsMock
  }
}))

vi.mock('../../../services/monitoring/monitoring.events', () => ({
  monitoringEventBus: {
    on: eventBusOnMock,
    off: eventBusOffMock
  }
}))

vi.mock('../../../services/monitoring/monitoring.state', () => ({
  monitoringStateService: {
    getSnapshot: getSnapshotStateMock,
    getAlerts: getAlertsStateMock,
    getRisk: getRiskStateMock,
    getProjection: getProjectionStateMock,
    getProtocolMetrics: getProtocolMetricsStateMock,
    listSnapshots: listSnapshotsMock,
    listAlerts: listAlertsMock,
    listRisks: listRisksMock,
    listProjections: listProjectionsMock,
    listProtocolMetrics: listProtocolMetricsMock
  }
}))

vi.mock('../../../services/monitoring/monitoring.poller.manager', () => ({
  getMonitoringPollerStatus: getPollerStatusMock,
  getMonitoringPollerMetrics: getPollerMetricsMock,
  getMonitoringPollerHistory: getPollerHistoryMock,
  startMonitoringPoller: startPollerMock,
  stopMonitoringPoller: stopPollerMock,
  runMonitoringPollerOnce: runPollerOnceMock
}))

vi.mock('../../../services/monitoring/monitoring.stream.manager', () => ({
  getMonitoringStreamStatus: getStreamStatusMock,
  startMonitoringStream: startStreamMock,
  stopMonitoringStream: stopStreamMock
}))

const { createServer } = await import('../../../server')
const { monitoringStreamHandler } = await import('../../../controllers/monitoring.controller')

let app: ReturnType<typeof createServer>

const buildSnapshot = (overrides: Partial<PortfolioSnapshot> = {}): PortfolioSnapshot => ({
  totalValueUSD: 100_000,
  netAPY: 8.5,
  positions: [
    {
      protocol: 'Aave Monad',
      asset: 'USDC',
      amount: 50_000,
      valueUSD: 50_000,
      currentAPY: 8,
      riskScore: 2
    }
  ],
  ...overrides
})

const buildAlerts = (): AlertEvent[] => ([
  {
    id: 'alert-1',
    title: 'Риск Yearn',
    severity: 'warning',
    description: 'APY просел на 1%',
    createdAt: new Date().toISOString()
  }
])

const buildProjection = () => ({
  baseValueUsd: 100_000,
  netApy: 8.5,
  horizons: [0, 30, 90],
  points: [
    {
      timestamp: new Date().toISOString(),
      netAssetValue: 100_000,
      projectedYield: 0
    }
  ],
  generatedAt: new Date().toISOString()
})

const buildProtocolMetrics = (overrides: Partial<MonadProtocolMetrics> = {}): MonadProtocolMetrics => ({
  source: 'fallback',
  fetchedAt: new Date().toISOString(),
  fallbackReason: 'Envio not configured',
  nablaPools: [
    {
      address: '0xpool-usdc',
      asset: 'USDC',
      currentApy: 31.6,
      tvlUsd: 2_500_000,
      volume24hUsd: 150_000,
      fees24hUsd: 450,
      riskScore: 6,
      lastUpdate: new Date().toISOString(),
      isActive: true,
      source: 'fallback'
    }
  ],
  uniswapPairs: [
    {
      pairAddress: '0xpair-usdc-usdt',
      token0Symbol: 'USDC',
      token1Symbol: 'USDT',
      reserve0: 0,
      reserve1: 0,
      volume24hUsd: 150_000,
      fees24hUsd: 450,
      apr: 9.8,
      lastUpdate: new Date().toISOString(),
      isActive: true,
      source: 'fallback'
    }
  ],
  ...overrides
})

const buildRiskInsights = () => ({
  account: ACCOUNT_ADDRESS,
  totalValueUsd: 100_000,
  netAPY: 8.5,
  exposure: [
    {
      level: 'low',
      label: 'Низкий риск',
      minScore: 0,
      maxScore: 2,
      valueUSD: 50_000,
      percentage: 50,
      topPositions: [
        {
          protocol: 'Aave Monad',
          valueUSD: 50_000,
          riskScore: 2
        }
      ]
    }
  ],
  guardrails: {
    maxAllowedRiskScore: 3,
    highestPositionRisk: 2,
    violations: []
  },
  delegation: {
    dailyLimitUsd: 10_000,
    spent24hUsd: 2_500,
    remainingDailyLimitUsd: 7_500,
    utilization: 0.25
  },
  updatedAt: new Date().toISOString()
})

const buildPollerSummary = (overrides: Partial<MonitoringPollerRunSummary> = {}): MonitoringPollerRunSummary => ({
  source: 'manual',
  startedAt: new Date().toISOString(),
  finishedAt: new Date().toISOString(),
  durationMs: 1200,
  processedAccounts: 1,
  successCount: 1,
  errorCount: 0,
  results: [
    {
      account: ACCOUNT_ADDRESS,
      snapshotFetched: true,
      alertsFetched: true,
      riskCalculated: true,
      projectionBuilt: true
    }
  ],
  ...overrides
})

describe('monitoring routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    getPollerStatusMock.mockReturnValue({
      enabled: true,
      running: false,
      intervalMs: 30_000,
      lastRunAt: undefined,
      lastDurationMs: undefined,
      lastError: undefined,
      lastSummary: undefined
    })
    getPollerMetricsMock.mockReturnValue({
      totalRuns: 3,
      successfulRuns: 2,
      failedRuns: 1,
      successRate: 2 / 3,
      averageDurationMs: 1500,
      averageAccountsPerRun: 1.5,
      lastRunAt: new Date().toISOString()
    })
    getPollerHistoryMock.mockReturnValue([buildPollerSummary()])
    getStreamStatusMock.mockReturnValue({ ...DEFAULT_STREAM_STATUS })
    getProtocolMetricsMock.mockResolvedValue(buildProtocolMetrics())
    listProtocolMetricsMock.mockReturnValue([])
    getProtocolMetricsStateMock.mockReturnValue(undefined)
  })

  describe('GET /api/monitoring/portfolio/:address/projection', () => {
    it('возвращает проекцию портфеля', async () => {
      const projection = buildProjection()
      buildProjectionMock.mockResolvedValueOnce(projection)

      const res = await request(app).get(`/api/monitoring/portfolio/${ACCOUNT_ADDRESS}/projection`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(projection)
      expect(buildProjectionMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 для некорректного адреса', async () => {
      const res = await request(app).get('/api/monitoring/portfolio/not-an-address/projection')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес')
      expect(buildProjectionMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      buildProjectionMock.mockRejectedValueOnce(new Error('projection failure'))

      const res = await request(app).get(`/api/monitoring/portfolio/${ACCOUNT_ADDRESS}/projection`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось построить проекцию портфеля' })
    })
  })

  describe('GET /api/monitoring/poller/history', () => {
    it('возвращает историю мониторинга с ограничением', async () => {
      const summaries = [buildPollerSummary()]
      getPollerHistoryMock.mockReturnValueOnce(summaries)

      const res = await request(app).get('/api/monitoring/poller/history?limit=5')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ summaries })
      expect(getPollerHistoryMock).toHaveBeenCalledWith(5)
    })

    it('возвращает 400 при некорректном limit', async () => {
      const res = await request(app).get('/api/monitoring/poller/history?limit=0')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Некорректное значение limit' })
      expect(getPollerHistoryMock).not.toHaveBeenCalled()
    })

    it('использует значение по умолчанию без параметра', async () => {
      const history = [buildPollerSummary()]
      getPollerHistoryMock.mockReturnValueOnce(history)

      const res = await request(app).get('/api/monitoring/poller/history')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ summaries: history })
      expect(getPollerHistoryMock).toHaveBeenCalledWith()
    })
  })

  describe('GET /api/monitoring/poller/metrics', () => {
    it('возвращает агрегированные метрики', async () => {
      const metrics = {
        totalRuns: 5,
        successfulRuns: 4,
        failedRuns: 1,
        successRate: 0.8,
        averageDurationMs: 1200,
        averageAccountsPerRun: 2,
        lastRunAt: new Date().toISOString(),
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: new Date().toISOString()
      }
      getPollerMetricsMock.mockReturnValueOnce(metrics)

      const res = await request(app).get('/api/monitoring/poller/metrics')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(metrics)
      expect(getPollerMetricsMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('GET /api/monitoring/portfolio/:address', () => {
    it('возвращает снимок портфеля', async () => {
      const snapshot = buildSnapshot()
      getPortfolioSnapshotMock.mockResolvedValueOnce(snapshot)

      const res = await request(app).get(`/api/monitoring/portfolio/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(snapshot)
      expect(getPortfolioSnapshotMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 для некорректного адреса', async () => {
      const res = await request(app).get('/api/monitoring/portfolio/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес')
      expect(getPortfolioSnapshotMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getPortfolioSnapshotMock.mockRejectedValueOnce(new Error('envio down'))

      const res = await request(app).get(`/api/monitoring/portfolio/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить данные портфеля' })
    })
  })

  describe('GET /api/monitoring/alerts/:address', () => {
    it('возвращает риск-алерты', async () => {
      const alerts = buildAlerts()
      getRiskAlertsMock.mockResolvedValueOnce(alerts)

      const res = await request(app).get(`/api/monitoring/alerts/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(alerts)
      expect(getRiskAlertsMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 для некорректного адреса', async () => {
      const res = await request(app).get('/api/monitoring/alerts/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес')
      expect(getRiskAlertsMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getRiskAlertsMock.mockRejectedValueOnce(new Error('envio error'))

      const res = await request(app).get(`/api/monitoring/alerts/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить риск-алерты' })
    })
  })

  describe('GET /api/monitoring/protocols/monad', () => {
    it('возвращает метрики протоколов', async () => {
      const metrics = buildProtocolMetrics()
      getProtocolMetricsMock.mockResolvedValueOnce(metrics)

      const res = await request(app).get('/api/monitoring/protocols/monad')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(metrics)
      expect(getProtocolMetricsMock).toHaveBeenCalledTimes(1)
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getProtocolMetricsMock.mockRejectedValueOnce(new Error('metrics failure'))

      const res = await request(app).get('/api/monitoring/protocols/monad')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить метрики протоколов' })
    })
  })

  describe('GET /api/monitoring/risk/:address', () => {
    it('возвращает риск-инсайты', async () => {
      const insights = buildRiskInsights()
      getRiskInsightsMock.mockResolvedValueOnce(insights)

      const res = await request(app).get(`/api/monitoring/risk/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(insights)
      expect(getRiskInsightsMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 для некорректного адреса', async () => {
      const res = await request(app).get('/api/monitoring/risk/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес')
      expect(getRiskInsightsMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getRiskInsightsMock.mockRejectedValueOnce(new Error('risk failed'))

      const res = await request(app).get(`/api/monitoring/risk/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось рассчитать риск-профиль' })
    })
  })

  describe('monitoring stream control routes', () => {
    it('возвращает статус стрима', async () => {
      const res = await request(app).get('/api/monitoring/stream/control/status')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(DEFAULT_STREAM_STATUS)
      expect(getStreamStatusMock).toHaveBeenCalled()
    })

    it('запускает стрим через ручку', async () => {
      const statusAfterStart = {
        enabled: true,
        running: true,
        connected: true,
        observedAccounts: 3,
        lastEventAt: new Date().toISOString()
      }

      getStreamStatusMock.mockReturnValue(statusAfterStart)
      startStreamMock.mockResolvedValueOnce(true)

      const res = await request(app).post('/api/monitoring/stream/control/start')

      expect(res.status).toBe(200)
      expect(startStreamMock).toHaveBeenCalled()
      expect(res.body).toEqual({ started: true, status: statusAfterStart })
    })

    it('останавливает стрим через ручку', async () => {
      const statusAfterStop = {
        enabled: false,
        running: false,
        connected: false,
        observedAccounts: 0
      }

      getStreamStatusMock.mockReturnValue(statusAfterStop)
      stopStreamMock.mockResolvedValueOnce(true)

      const res = await request(app).post('/api/monitoring/stream/control/stop')

      expect(res.status).toBe(200)
      expect(stopStreamMock).toHaveBeenCalled()
      expect(res.body).toEqual({ stopped: true, status: statusAfterStop })
    })
  })

  describe('monitoring stream handler', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('стримит обновления для конкретного аккаунта', async () => {
      vi.useFakeTimers()

      const listeners = new Map<string, (payload: any) => void>()
      const busMock = { on: eventBusOnMock, off: eventBusOffMock }
      eventBusOnMock.mockImplementation((event: string, listener: (payload: any) => void) => {
        listeners.set(event, listener)
        return busMock
      })
      eventBusOffMock.mockImplementation((event: string) => {
        listeners.delete(event)
        return busMock
      })

      const normalized = ACCOUNT_ADDRESS.toLowerCase()
      getSnapshotStateMock.mockReturnValueOnce({ account: normalized, snapshot: buildSnapshot() })
      getAlertsStateMock.mockReturnValueOnce({ account: normalized, alerts: buildAlerts() })
      getRiskStateMock.mockReturnValueOnce({ account: normalized, insights: { ...buildRiskInsights(), account: normalized } })
      getProjectionStateMock.mockReturnValueOnce({ account: normalized, projection: buildProjection() })
      getProtocolMetricsStateMock.mockReturnValueOnce({ network: 'monad', metrics: buildProtocolMetrics() })

      const requestListeners: Record<string, () => void> = {}
      const req = {
        params: { account: ACCOUNT_ADDRESS },
        on: vi.fn((event: string, handler: () => void) => {
          requestListeners[event] = handler
          return req
        })
      } as unknown as Request

      const writes: string[] = []
      const setHeader = vi.fn()
      const flushHeaders = vi.fn()
      const write = vi.fn((chunk: string) => {
        writes.push(chunk)
        return true
      })
      const end = vi.fn()
      const res = {
        setHeader,
        flushHeaders,
        write,
        end
      } as unknown as Response

      await monitoringStreamHandler(req, res)

      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream')
      expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache')
      expect(setHeader).toHaveBeenCalledWith('Connection', 'keep-alive')
      expect(flushHeaders).toHaveBeenCalled()

      expect(eventBusOnMock).toHaveBeenCalledWith('snapshot', expect.any(Function))
      expect(eventBusOnMock).toHaveBeenCalledWith('alerts', expect.any(Function))
      expect(eventBusOnMock).toHaveBeenCalledWith('risk', expect.any(Function))
      expect(eventBusOnMock).toHaveBeenCalledWith('projection', expect.any(Function))
      expect(eventBusOnMock).toHaveBeenCalledWith('protocol-metrics', expect.any(Function))

      expect(writes.some(chunk => chunk.includes('event: snapshot'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: alerts'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: risk'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: projection'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: protocol-metrics'))).toBe(true)

      listeners.get('risk')?.({ account: normalized, insights: { ...buildRiskInsights(), account: normalized } })
      expect(writes.filter(chunk => chunk.includes('event: risk')).length).toBeGreaterThan(1)
      listeners.get('protocol-metrics')?.({ network: 'monad', metrics: buildProtocolMetrics() })
      expect(writes.filter(chunk => chunk.includes('event: protocol-metrics')).length).toBeGreaterThan(1)

      vi.advanceTimersByTime(25_000)
      expect(writes.some(chunk => chunk.includes('event: heartbeat'))).toBe(true)

      requestListeners.close?.()
      expect(eventBusOffMock).toHaveBeenCalledWith('snapshot', expect.any(Function))
      expect(eventBusOffMock).toHaveBeenCalledWith('alerts', expect.any(Function))
      expect(eventBusOffMock).toHaveBeenCalledWith('risk', expect.any(Function))
      expect(eventBusOffMock).toHaveBeenCalledWith('projection', expect.any(Function))
      expect(eventBusOffMock).toHaveBeenCalledWith('protocol-metrics', expect.any(Function))
      expect(end).toHaveBeenCalled()
    })

    it('возвращает батчи при подписке без адреса', async () => {
      vi.useFakeTimers()

      const snapshots = [{ account: ACCOUNT_ADDRESS.toLowerCase(), snapshot: buildSnapshot() }]
      const alerts = [{ account: ACCOUNT_ADDRESS.toLowerCase(), alerts: buildAlerts() }]
      const risks = [{ account: ACCOUNT_ADDRESS.toLowerCase(), insights: { ...buildRiskInsights(), account: ACCOUNT_ADDRESS.toLowerCase() } }]
      const projections = [{ account: ACCOUNT_ADDRESS.toLowerCase(), projection: buildProjection() }]
      const protocolMetrics = [{ network: 'monad', metrics: buildProtocolMetrics() }]

      listSnapshotsMock.mockReturnValueOnce(snapshots)
      listAlertsMock.mockReturnValueOnce(alerts)
      listRisksMock.mockReturnValueOnce(risks)
      listProjectionsMock.mockReturnValueOnce(projections)
      listProtocolMetricsMock.mockReturnValueOnce(protocolMetrics)

      const req = {
        params: {},
        on: vi.fn(() => req)
      } as unknown as Request

      const writes: string[] = []
      const res = {
        setHeader: vi.fn(),
        flushHeaders: vi.fn(),
        write: vi.fn((chunk: string) => {
          writes.push(chunk)
          return true
        }),
        end: vi.fn()
      } as unknown as Response

      await monitoringStreamHandler(req, res)

      expect(writes.some(chunk => chunk.includes('event: snapshot-batch'))).toBe(true)
      expect(writes.some(chunk => chunk.includes(JSON.stringify(snapshots)))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: alerts-batch'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: risk-batch'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: projection-batch'))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: protocol-metrics-batch'))).toBe(true)
    })

    it('возвращает 400 при некорректном адресе', async () => {
      const req = {
        params: { account: 'invalid' },
        on: vi.fn()
      } as unknown as Request

      const status = vi.fn().mockReturnThis()
      const json = vi.fn()
      const res = {
        status,
        json
      } as unknown as Response

      await monitoringStreamHandler(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Некорректный адрес' }))
      expect(eventBusOnMock).not.toHaveBeenCalled()
    })
  })

  describe('monitoring poller endpoints', () => {
    it('возвращает статус poller', async () => {
      const status = {
        enabled: true,
        running: false,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).get('/api/monitoring/poller/status')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(status)
    })

    it('запускает poller и возвращает статус', async () => {
      startPollerMock.mockReturnValueOnce(true)
      const status = {
        enabled: true,
        running: true,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/start')

      expect(res.status).toBe(200)
      expect(startPollerMock).toHaveBeenCalled()
      expect(res.body).toEqual({ started: true, status })
    })

    it('останавливает poller и возвращает статус', async () => {
      stopPollerMock.mockReturnValueOnce(true)
      const status = {
        enabled: false,
        running: false,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/stop')

      expect(res.status).toBe(200)
      expect(stopPollerMock).toHaveBeenCalled()
      expect(res.body).toEqual({ stopped: true, status })
    })

    it('запускает poller вручную и возвращает summary', async () => {
      const summary = {
        source: 'manual',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 10,
        processedAccounts: 1,
        successCount: 1,
        errorCount: 0,
        results: []
      }
      runPollerOnceMock.mockResolvedValueOnce(summary)
      const status = {
        enabled: true,
        running: false,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/run')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ summary, status })
    })

    it('возвращает 202 если poller уже работает', async () => {
      runPollerOnceMock.mockResolvedValueOnce(null)
      const status = {
        enabled: true,
        running: true,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/run')

      expect(res.status).toBe(202)
      expect(res.body).toEqual({
        message: 'Запуск пропущен: предыдущая итерация мониторинга ещё выполняется.',
        status
      })
    })

    it('возвращает 409 при конкурентном запуске', async () => {
      runPollerOnceMock.mockRejectedValueOnce(new Error('Monitoring poller iteration уже выполняется.'))
      const status = {
        enabled: true,
        running: true,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/run')

      expect(res.status).toBe(409)
      expect(res.body).toEqual({
        message: 'Monitoring poller iteration уже выполняется.',
        status
      })
    })

    it('возвращает 500 при ошибке poller', async () => {
      runPollerOnceMock.mockRejectedValueOnce(new Error('unexpected failure'))
      const status = {
        enabled: true,
        running: false,
        intervalMs: 30_000,
        lastRunAt: undefined,
        lastDurationMs: undefined,
        lastError: undefined,
        lastSummary: undefined
      }
      getPollerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/monitoring/poller/run')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({
        message: 'Не удалось выполнить мониторинговый poller вручную',
        status
      })
    })
  })
})
