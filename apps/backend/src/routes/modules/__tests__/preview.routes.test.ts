import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PreviewDataOverview } from '@defitreasuryai/types'

const getOverviewMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/preview/preview.service', () => ({
  previewDataService: {
    getOverview: getOverviewMock
  }
}))

const { createServer } = await import('../../../server')

let app: ReturnType<typeof createServer>

const buildOverview = (overrides: Partial<PreviewDataOverview> = {}): PreviewDataOverview => ({
  generatedAt: new Date().toISOString(),
  source: {
    defiLlama: true,
    coinGecko: true,
    oneInch: false,
    fallbackApplied: false
  },
  protocols: [
    {
      id: 'aave-v3-ethereum',
      name: 'Aave V3',
      category: 'lending',
      chain: 'ethereum',
      symbol: 'AAVE',
      apy: 4.2,
      tvlUsd: 5200000000,
      volume24hUsd: 850000000,
      riskScore: 2,
      url: 'https://app.aave.com',
      lastUpdated: new Date().toISOString(),
      dataQuality: 'live'
    }
  ],
  topOpportunities: [],
  summary: {
    totalTvlUsd: 5200000000,
    averageApy: 4.2,
    medianApy: 4.2,
    riskWeightedYield: 2.1,
    categories: [
      {
        category: 'lending',
        tvlUsd: 5200000000,
        averageApy: 4.2,
        protocolCount: 1
      }
    ]
  },
  ...overrides
})

describe('Preview routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    getOverviewMock.mockReset()
    getOverviewMock.mockResolvedValue(buildOverview())
  })

  it('returns preview overview data', async () => {
    const response = await request(app).get('/api/preview/overview')

    expect(response.status).toBe(200)
    expect(getOverviewMock).toHaveBeenCalledWith(false)
    expect(response.body.summary).toBeDefined()
    expect(response.body.protocols.length).toBeGreaterThan(0)
  })

  it('forces refresh when queried', async () => {
    const response = await request(app).get('/api/preview/overview?refresh=true')

    expect(response.status).toBe(200)
    expect(getOverviewMock).toHaveBeenCalledWith(true)
  })

  it('handles errors gracefully', async () => {
    getOverviewMock.mockRejectedValueOnce(new Error('unavailable'))

    const response = await request(app).get('/api/preview/overview')

    expect(response.status).toBe(500)
    expect(response.body).toHaveProperty('message')
    expect(response.body.message).toMatch(/failed|error/i)
  })
})
