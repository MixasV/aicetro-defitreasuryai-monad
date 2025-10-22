import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AIExecutionRecord,
  AIExecutionSummary,
  AIExecutionResult,
  AIRecommendationResponse,
  AIPreviewResult,
  AIExecutionAnalytics,
  AISchedulerRunSummary,
  AISchedulerStatus
} from '@defitreasuryai/types'

const generateRecommendationsMock = vi.hoisted(() => vi.fn())
const executeAIMock = vi.hoisted(() => vi.fn())
const previewAIMock = vi.hoisted(() => vi.fn())
const listHistoryMock = vi.hoisted(() => vi.fn())
const getSummaryMock = vi.hoisted(() => vi.fn())
const getAnalyticsMock = vi.hoisted(() => vi.fn())
const getSchedulerStatusMock = vi.hoisted(() => vi.fn())
const startSchedulerMock = vi.hoisted(() => vi.fn())
const stopSchedulerMock = vi.hoisted(() => vi.fn())
const runSchedulerOnceMock = vi.hoisted(() => vi.fn())
const getTelemetryMock = vi.hoisted(() => vi.fn())

const CORPORATE_ACCOUNT = '0xabc01234'
const DELEGATE_ADDRESS = '0xdef05678'

vi.mock('../../../services/ai/ai.service', () => ({
  aiService: {
    generateRecommendations: generateRecommendationsMock
  }
}))

vi.mock('../../../services/ai/ai.executor', () => ({
  aiExecutionService: {
    execute: executeAIMock
  }
}))

vi.mock('../../../services/ai/ai.preview', () => ({
  aiPreviewService: {
    preview: previewAIMock
  }
}))

vi.mock('../../../services/ai/ai.history', () => ({
  aiExecutionHistoryService: {
    listForAccount: listHistoryMock,
    getSummary: getSummaryMock,
    getAnalytics: getAnalyticsMock
  }
}))

vi.mock('../../../services/ai/scheduler.manager', () => ({
  getSchedulerStatus: getSchedulerStatusMock,
  startScheduler: startSchedulerMock,
  stopScheduler: stopSchedulerMock,
  runSchedulerOnce: runSchedulerOnceMock
}))

vi.mock('../../../services/ai/ai.telemetry', () => ({
  aiTelemetryService: {
    getMetrics: getTelemetryMock
  }
}))

const { createServer } = await import('../../../server')

let app: ReturnType<typeof createServer>

const buildRecommendationResponse = (overrides: Partial<AIRecommendationResponse> = {}): AIRecommendationResponse => ({
  summary: 'AI is ready to rebalance the portfolio.',
  analysis: 'The portfolio is skewed toward low-risk positions; increase Aave exposure.',
  allocations: [
    {
      protocol: 'Aave Monad',
      allocationPercent: 50,
      expectedAPY: 5.5,
      rationale: 'Balancing yield and risk',
      riskScore: 2
    }
  ],
  suggestedActions: ['Rebalance the positions'],
  generatedAt: new Date().toISOString(),
  ...overrides
})

const buildExecutionResult = (overrides: Partial<AIExecutionResult> = {}): AIExecutionResult => ({
  account: CORPORATE_ACCOUNT,
  delegate: DELEGATE_ADDRESS,
  generatedAt: new Date().toISOString(),
  summary: 'AI executed on-chain actions worth 100 USD.',
  totalExecutedUsd: 100,
  remainingDailyLimitUsd: 900,
  actions: [
    {
      protocol: 'Aave Monad',
      allocationPercent: 25,
      amountUsd: 100,
      expectedAPY: 6.5,
      riskScore: 2,
      status: 'executed'
    }
  ],
  ...overrides
})

const buildPreviewResult = (overrides: Partial<AIPreviewResult> = {}): AIPreviewResult => ({
  account: CORPORATE_ACCOUNT,
  delegate: DELEGATE_ADDRESS,
  generatedAt: new Date().toISOString(),
  summary: '100 USD can be executed without breaching guardrails.',
  totalExecutableUsd: 100,
  remainingDailyLimitUsd: 900,
  actions: [
    {
      protocol: 'Aave Monad',
      allocationPercent: 25,
      amountUsd: 100,
      expectedAPY: 6.5,
      riskScore: 2,
      status: 'executed'
    }
  ],
  delegation: {
    dailyLimitUsd: 1000,
    spent24hUsd: 0,
    whitelist: ['Aave Monad'],
    maxRiskScore: 3
  },
  ...overrides
})

const buildExecutionRecord = (overrides: Partial<AIExecutionRecord> = {}): AIExecutionRecord => ({
  id: 'log-1',
  account: CORPORATE_ACCOUNT,
  delegate: DELEGATE_ADDRESS,
  generatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  summary: 'Successful run',
  totalExecutedUsd: 100,
  remainingDailyLimitUsd: 900,
  actions: [],
  ...overrides
})

const buildExecutionSummary = (overrides: Partial<AIExecutionSummary> = {}): AIExecutionSummary => ({
  account: CORPORATE_ACCOUNT,
  totalExecutions: 3,
  executedVolumeUsd: 450,
  averageExecutedUsd: 150,
  successCount: 2,
  successRate: 0.6667,
  last24h: {
    count: 1,
    volumeUsd: 200
  },
  lastExecution: {
    generatedAt: new Date().toISOString(),
    totalExecutedUsd: 200,
    remainingDailyLimitUsd: 800,
    summary: 'Last run'
  },
  ...overrides
})

const buildExecutionAnalytics = (overrides: Partial<AIExecutionAnalytics> = {}): AIExecutionAnalytics => ({
  account: CORPORATE_ACCOUNT,
  totalExecutions: 5,
  successRate: 0.6,
  totalExecutedUsd: 750,
  executedProtocols: 2,
  topProtocols: [
    {
      protocol: 'Aave Monad',
      executedUsd: 500,
      executedCount: 3,
      skippedCount: 1,
      averageAPY: 6.2,
      averageRisk: 2.1
    }
  ],
  lastExecutionAt: new Date().toISOString(),
  ...overrides
})

const buildSchedulerStatus = (overrides: Partial<AISchedulerStatus> = {}): AISchedulerStatus => ({
  enabled: true,
  running: false,
  intervalMs: 60000,
  lastRunAt: new Date().toISOString(),
  lastDurationMs: 1200,
  lastError: undefined,
  lastSummary: undefined,
  ...overrides
})

describe('AI routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/ai/recommendations', () => {
    it('возвращает AI рекомендации при валидном запросе', async () => {
      const responsePayload = buildRecommendationResponse()
      generateRecommendationsMock.mockResolvedValueOnce(responsePayload)

      const requestPayload = {
        portfolio: {
          positions: [],
          totalValueUSD: 1000,
          netAPY: 4.2
        },
        riskTolerance: 'balanced',
        protocols: ['Aave Monad'],
        constraints: {
          dailyLimitUsd: 1000,
          remainingDailyLimitUsd: 800,
          maxRiskScore: 3,
          whitelist: ['Aave Monad']
        },
        context: {
          account: CORPORATE_ACCOUNT,
          delegate: DELEGATE_ADDRESS,
          chainId: 10143,
          scenario: 'unit-test'
        }
      }

      const res = await request(app)
        .post('/api/ai/recommendations')
        .send(requestPayload)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(responsePayload)
      expect(generateRecommendationsMock).toHaveBeenCalledWith(requestPayload)
    })

    it('returns 400 при некорректном запросе', async () => {
      const res = await request(app)
        .post('/api/ai/recommendations')
        .send({})

      expect(res.status).toBe(400)
      expect(generateRecommendationsMock).not.toHaveBeenCalled()
    })

    it('returns 500 on service error', async () => {
      generateRecommendationsMock.mockRejectedValueOnce(new Error('boom'))

      const requestPayload = {
        portfolio: {
          positions: [],
          totalValueUSD: 1000,
          netAPY: 4.2
        },
        riskTolerance: 'balanced',
        protocols: ['Aave Monad'],
        constraints: {
          dailyLimitUsd: 1000,
          remainingDailyLimitUsd: 800,
          maxRiskScore: 3,
          whitelist: ['Aave Monad']
        },
        context: {
          account: CORPORATE_ACCOUNT,
          delegate: DELEGATE_ADDRESS,
          chainId: 10143,
          scenario: 'unit-test'
        }
      }

      const res = await request(app)
        .post('/api/ai/recommendations')
        .send(requestPayload)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to generate AI recommendation' })
    })
  })

  describe('POST /api/ai/preview', () => {
    it('возвращает предварительный результат', async () => {
      const preview = buildPreviewResult()
      previewAIMock.mockResolvedValueOnce(preview)

      const res = await request(app)
        .post('/api/ai/preview')
        .send({
          account: CORPORATE_ACCOUNT,
          protocols: ['Aave Monad']
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(preview)
      expect(previewAIMock).toHaveBeenCalledWith({ account: CORPORATE_ACCOUNT, protocols: ['Aave Monad'] })
    })

    it('returns 400 при некорректных данных', async () => {
      const res = await request(app)
        .post('/api/ai/preview')
        .send({})

      expect(res.status).toBe(400)
      expect(previewAIMock).not.toHaveBeenCalled()
    })

    it('returns 500 on service error', async () => {
      previewAIMock.mockRejectedValueOnce(new Error('preview failed'))

      const res = await request(app)
        .post('/api/ai/preview')
        .send({ account: CORPORATE_ACCOUNT, protocols: ['Aave Monad'] })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to build AI preview' })
    })
  })

  describe('POST /api/ai/execute', () => {
    it('возвращает результат исполнения', async () => {
      const executionResult = buildExecutionResult()
      executeAIMock.mockResolvedValueOnce(executionResult)

      const res = await request(app)
        .post('/api/ai/execute')
        .send({
          account: CORPORATE_ACCOUNT,
          protocols: ['Aave Monad']
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(executionResult)
      expect(executeAIMock).toHaveBeenCalledWith({ account: CORPORATE_ACCOUNT, protocols: ['Aave Monad'] })
    })

    it('returns 400 при некорректных данных', async () => {
      const res = await request(app)
        .post('/api/ai/execute')
        .send({})

      expect(res.status).toBe(400)
      expect(executeAIMock).not.toHaveBeenCalled()
    })

    it('returns 500 on execution error', async () => {
      executeAIMock.mockRejectedValueOnce(new Error('failure'))

      const res = await request(app)
        .post('/api/ai/execute')
        .send({ account: CORPORATE_ACCOUNT, protocols: ['Aave Monad'] })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to execute AI strategy' })
    })
  })

  describe('GET /api/ai/executions/:account', () => {
    it('возвращает историю исполнений', async () => {
      const records = [buildExecutionRecord()]
      listHistoryMock.mockResolvedValueOnce(records)

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}`)
        .query({ limit: '5' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(records)
      expect(listHistoryMock).toHaveBeenCalledWith(CORPORATE_ACCOUNT, 5)
    })

    it('returns 400 при неверном адресе', async () => {
      const res = await request(app)
        .get('/api/ai/executions/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Invalid account address' })
      expect(listHistoryMock).not.toHaveBeenCalled()
    })

    it('ограничивает limit максимум 50', async () => {
      listHistoryMock.mockResolvedValueOnce([])

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}`)
        .query({ limit: '500' })

      expect(res.status).toBe(200)
      expect(listHistoryMock).toHaveBeenCalledWith(CORPORATE_ACCOUNT, 50)
    })
  })

  describe('GET /api/ai/executions/:account/summary', () => {
    it('возвращает сводку исполнений', async () => {
      const summary = buildExecutionSummary()
      getSummaryMock.mockResolvedValueOnce(summary)

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}/summary`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(summary)
      expect(getSummaryMock).toHaveBeenCalledWith(CORPORATE_ACCOUNT)
    })

    it('returns 400 при неверном адресе', async () => {
      const res = await request(app)
        .get('/api/ai/executions/not-an-address/summary')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Invalid account address' })
      expect(getSummaryMock).not.toHaveBeenCalled()
    })

    it('returns 500 on service error', async () => {
      getSummaryMock.mockRejectedValueOnce(new Error('summary failed'))

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}/summary`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to build AI execution summary' })
    })
  })

  describe('GET /api/ai/executions/:account/analytics', () => {
    it('возвращает аналитику исполнений', async () => {
      const analytics = buildExecutionAnalytics()
      getAnalyticsMock.mockResolvedValueOnce(analytics)

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}/analytics`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(analytics)
      expect(getAnalyticsMock).toHaveBeenCalledWith(CORPORATE_ACCOUNT)
    })

    it('returns 400 при неверном адресе', async () => {
      const res = await request(app)
        .get('/api/ai/executions/not-an-address/analytics')

      expect(res.status).toBe(400)
      expect(res.body).toEqual({ message: 'Invalid account address' })
      expect(getAnalyticsMock).not.toHaveBeenCalled()
    })

    it('returns 500 on service error', async () => {
      getAnalyticsMock.mockRejectedValueOnce(new Error('analytics failed'))

      const res = await request(app)
        .get(`/api/ai/executions/${CORPORATE_ACCOUNT}/analytics`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to build AI execution analytics' })
    })
  })

  describe('scheduler endpoints', () => {
    it('возвращает статус планировщика', async () => {
      const status = buildSchedulerStatus()
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).get('/api/ai/scheduler/status')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(status)
    })

    it('запускает планировщик', async () => {
      const status = buildSchedulerStatus({ enabled: true, running: true })
      startSchedulerMock.mockReturnValueOnce(true)
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/start')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ started: true, status })
      expect(startSchedulerMock).toHaveBeenCalled()
    })

    it('останавливает планировщик', async () => {
      const status = buildSchedulerStatus({ enabled: false, running: false })
      stopSchedulerMock.mockReturnValueOnce(true)
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/stop')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ stopped: true, status })
      expect(stopSchedulerMock).toHaveBeenCalled()
    })

    it('выполняет планировщик один раз', async () => {
      const status = buildSchedulerStatus({ running: false })
      const summary: AISchedulerRunSummary = {
        source: 'manual',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 100,
        processedAccounts: 1,
        successCount: 1,
        errorCount: 0,
        results: []
      }
      runSchedulerOnceMock.mockResolvedValueOnce(summary)
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/run')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ summary, status })
    })

    it('returns 202 if execution skipped', async () => {
      const status = buildSchedulerStatus()
      runSchedulerOnceMock.mockResolvedValueOnce(null)
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/run')

      expect(res.status).toBe(202)
      expect(res.body).toEqual({
        message: 'Execution skipped: previous iteration still running.',
        status
      })
    })

    it('returns 409 on concurrent execution', async () => {
      const status = buildSchedulerStatus({ running: true })
      runSchedulerOnceMock.mockRejectedValueOnce(new Error('AI scheduler iteration already running'))
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/run')

      expect(res.status).toBe(409)
      expect(res.body).toEqual({
        message: expect.stringContaining('already running'),
        status
      })
    })

    it('returns 500 on unexpected error', async () => {
      const status = buildSchedulerStatus()
      runSchedulerOnceMock.mockRejectedValueOnce(new Error('unexpected'))
      getSchedulerStatusMock.mockReturnValueOnce(status)

      const res = await request(app).post('/api/ai/scheduler/run')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({
        message: 'Failed to manually trigger AI scheduler',
        status
      })
    })
  })

  describe('GET /api/ai/openrouter/metrics', () => {
    it('возвращает метрики с лимитом по умолчанию', async () => {
      const payload = {
        summary: {
          totalCalls: 3,
          successCount: 2,
          errorCount: 1,
          skippedCount: 0,
          averageLatencyMs: 1200,
          lastCallAt: new Date().toISOString()
        },
        metrics: []
      }
      getTelemetryMock.mockReturnValueOnce(payload)

      const res = await request(app).get('/api/ai/openrouter/metrics')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(payload)
      expect(getTelemetryMock).toHaveBeenCalledWith(20)
    })

    it('учитывает лимит из query и ограничивает максимум 100', async () => {
      const payload = {
        summary: {
          totalCalls: 0,
          successCount: 0,
          errorCount: 0,
          skippedCount: 0
        },
        metrics: []
      }
      getTelemetryMock.mockReturnValue(payload)

      const res = await request(app)
        .get('/api/ai/openrouter/metrics')
        .query({ limit: '250' })

      expect(res.status).toBe(200)
      expect(getTelemetryMock).toHaveBeenCalledWith(100)

      await request(app)
        .get('/api/ai/openrouter/metrics')
        .query({ limit: '5' })

      expect(getTelemetryMock).toHaveBeenLastCalledWith(5)
    })
  })
})
