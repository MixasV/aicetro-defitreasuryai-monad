import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const runScenarioMock = vi.hoisted(() => vi.fn())
const getSummaryMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/demo/demo.service', () => ({
  demoService: {
    runScenario: runScenarioMock,
    getSummary: getSummaryMock
  }
}))

const { createServer } = await import('../../../server')

let app: ReturnType<typeof createServer>

const buildSummary = () => ({
  account: {
    address: '0xcccccccccccccccccccccccccccccccccccccccc',
    owners: ['0xOwner1', '0xOwner2', '0xOwner3'],
    threshold: 2
  },
  delegation: {
    delegate: '0xa11ce00000000000000000000000000000000001',
    dailyLimitUsd: 25000,
    spent24hUsd: 4500,
    remainingDailyLimitUsd: 20500,
    maxRiskScore: 3,
    whitelist: ['Aave Monad'],
    updatedAt: new Date().toISOString()
  },
  risk: {
    account: '0xcccccccccccccccccccccccccccccccccccccccc',
    totalValueUsd: 100000,
    netAPY: 8.2,
    exposure: [],
    guardrails: { maxAllowedRiskScore: 3, highestPositionRisk: 2, violations: [] },
    delegation: {
      dailyLimitUsd: 25000,
      spent24hUsd: 4500,
      remainingDailyLimitUsd: 20500,
      utilization: 0.18
    },
    updatedAt: new Date().toISOString()
  },
  aiSummary: {
    account: '0xcccccccccccccccccccccccccccccccccccccccc',
    totalExecutions: 1,
    executedVolumeUsd: 5000,
    averageExecutedUsd: 5000,
    successCount: 1,
    successRate: 1,
    last24h: { count: 1, volumeUsd: 5000 },
    lastExecution: {
      generatedAt: new Date().toISOString(),
      totalExecutedUsd: 5000,
      remainingDailyLimitUsd: 20000,
      summary: 'demo'
    }
  },
  portfolio: {
    positions: [],
    totalValueUSD: 100000,
    netAPY: 8.2
  },
  alerts: [],
  projection: {
    baseValueUsd: 100000,
    netApy: 8.2,
    horizons: [0, 30, 90],
    points: [],
    generatedAt: new Date().toISOString()
  },
  aiHistory: [],
  emergencyLog: [],
  steps: [],
  generatedAt: new Date().toISOString()
})

const buildRunResult = () => ({
  execution: {
    account: '0xcccccccccccccccccccccccccccccccccccccccc',
    delegate: '0xa11ce00000000000000000000000000000000001',
    generatedAt: new Date().toISOString(),
    summary: 'ok',
    totalExecutedUsd: 5000,
    remainingDailyLimitUsd: 20000,
    actions: []
  },
  summary: buildSummary()
})

describe('demo routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/demo/run', () => {
    it('выполняет демо-сценарий', async () => {
      const payload = buildRunResult()
      runScenarioMock.mockResolvedValueOnce(payload)

      const res = await request(app).post('/api/demo/run')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(payload)
      expect(runScenarioMock).toHaveBeenCalledTimes(1)
    })

    it('returns 500 on error', async () => {
      runScenarioMock.mockRejectedValueOnce(new Error('demo failed'))

      const res = await request(app).post('/api/demo/run')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to run demo scenario' })
    })
  })

  describe('GET /api/demo/summary', () => {
    it('возвращает сводку по умолчанию', async () => {
      const summary = buildSummary()
      getSummaryMock.mockResolvedValueOnce(summary)

      const res = await request(app).get('/api/demo/summary')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(summary)
      expect(getSummaryMock).toHaveBeenCalledWith('0xcccccccccccccccccccccccccccccccccccccccc')
    })

    it('возвращает сводку для конкретного аккаунта', async () => {
      const summary = buildSummary()
      getSummaryMock.mockResolvedValueOnce(summary)

      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const res = await request(app).get(`/api/demo/summary/${address}`)

      expect(res.status).toBe(200)
      expect(getSummaryMock).toHaveBeenCalledWith(address)
      expect(res.body).toEqual(summary)
    })

    it('returns 400 with invalid address', async () => {
      const res = await request(app).get('/api/demo/summary/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Invalid account address')
      expect(getSummaryMock).not.toHaveBeenCalled()
    })

    it('returns 500 on service error', async () => {
      getSummaryMock.mockRejectedValueOnce(new Error('load failed'))

      const res = await request(app).get('/api/demo/summary')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Failed to load demo scenario' })
    })
  })
})
