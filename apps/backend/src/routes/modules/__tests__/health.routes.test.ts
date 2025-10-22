import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { HealthStatus } from '@defitreasuryai/types'
import { createServer } from '../../../server'

const getStatusMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/health/health.service', () => ({
  healthService: {
    getStatus: getStatusMock
  }
}))

let app: ReturnType<typeof createServer>

const buildStatus = (overrides: Partial<HealthStatus> = {}): HealthStatus => {
  const defaultIndicators: HealthStatus['indicators'] = [
    {
      component: 'database',
      status: 'ok',
      message: 'PostgreSQL доступен'
    }
  ]

  const defaultMetadata: HealthStatus['metadata'] = {
    environment: 'test',
    version: '0.1.0',
    schedulerEnabled: true
  }

  return {
    status: overrides.status ?? 'ok',
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    uptimeSeconds: overrides.uptimeSeconds ?? 123,
    indicators: overrides.indicators ?? defaultIndicators,
    metadata: overrides.metadata ?? defaultMetadata
  }
}

describe('health routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    getStatusMock.mockReset()
  })

  it('возвращает 200 и полный статус при отсутствии критических проблем', async () => {
    const mockStatus = buildStatus()
    getStatusMock.mockResolvedValueOnce(mockStatus)

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(mockStatus)
    expect(getStatusMock).toHaveBeenCalledTimes(1)
  })

  it('возвращает 503, если сервис сообщает о критическом состоянии', async () => {
    const mockStatus = buildStatus({
      status: 'critical',
      indicators: [
        {
          component: 'database',
          status: 'critical',
          message: 'Нет соединения с БД'
        }
      ]
    })
    getStatusMock.mockResolvedValueOnce(mockStatus)

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(503)
    expect(response.body).toEqual(mockStatus)
  })

  it('returns 500 и дефолтный payload on service error', async () => {
    getStatusMock.mockRejectedValueOnce(new Error('boom'))

    const response = await request(app).get('/api/health')

    expect(response.status).toBe(500)
    expect(response.body.status).toBe('critical')
    expect(response.body.indicators).toEqual([
      {
        component: 'health_service',
        status: 'critical',
        message: 'Health check недоступен'
      }
    ])
    expect(response.body.metadata).toMatchObject({
      schedulerEnabled: false
    })
  })

  it('возвращает liveness ответ без обращения к сервису', async () => {
    const response = await request(app).get('/api/health/live')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(getStatusMock).not.toHaveBeenCalled()
  })
})
