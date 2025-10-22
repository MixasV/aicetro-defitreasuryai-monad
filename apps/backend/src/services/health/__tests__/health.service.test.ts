import { beforeEach, describe, expect, it, vi } from 'vitest'

const queryRawMock = vi.hoisted(() => vi.fn())

const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  isAxiosError: (value: unknown): value is { response?: { status?: number } } =>
    typeof value === 'object' && value != null && (value as { isAxiosError?: boolean }).isAxiosError === true
}))

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    $queryRaw: queryRawMock
  }
}))

const schedulerStatusMock = vi.hoisted(() => ({
  enabled: true,
  running: false,
  intervalMs: 120_000,
  lastRunAt: undefined as string | undefined,
  lastDurationMs: undefined as number | undefined,
  lastError: undefined as string | undefined,
  lastSummary: undefined
}))

const monitoringPollerStatusMock = vi.hoisted(() => ({
  enabled: true,
  running: false,
  intervalMs: 30_000,
  lastRunAt: undefined as string | undefined,
  lastDurationMs: undefined as number | undefined,
  lastError: undefined as string | undefined,
  lastSummary: undefined
}))

const monitoringStreamStatusMock = vi.hoisted(() => ({
  enabled: true,
  running: true,
  connected: true,
  observedAccounts: 2,
  lastEventAt: undefined as string | undefined,
  lastError: undefined as string | undefined
}))

const emergencyConfigStatusMock = vi.hoisted(() => vi.fn(() => ({
  configured: true,
  issues: [],
  controllerAddress: '0xabc0000000000000000000000000000000000000'
})))

const emergencyControllerStateMock = vi.hoisted(() => vi.fn(async () => ({
  paused: false
})))

vi.mock('../../ai/scheduler.manager', () => ({
  getSchedulerStatus: () => schedulerStatusMock
}))

vi.mock('../../monitoring/monitoring.poller.manager', () => ({
  getMonitoringPollerStatus: () => monitoringPollerStatusMock
}))

vi.mock('../../monitoring/monitoring.stream.manager', () => ({
  getMonitoringStreamStatus: () => monitoringStreamStatusMock
}))

vi.mock('../../emergency/emergency.controller.client', () => ({
  emergencyControllerClient: {
    getConfigurationStatus: emergencyConfigStatusMock,
    getStatus: emergencyControllerStateMock
  }
}))

const envMock = vi.hoisted(() => ({
  port: 4000,
  nodeEnv: 'test',
  databaseUrl: 'postgresql://localhost:5432/test',
  redisUrl: 'redis://localhost:6379',
  openRouterKey: 'test-openrouter-key',
  envioApiKey: 'envio-key',
  envioGraphqlUrl: 'https://envio.test/graphql',
  envioWsUrl: 'wss://envio.test/ws',
  envioStreamEnabled: true,
  envioStreamStartBlock: 0,
  envioStreamRefreshIntervalMs: 60_000,
  monadRpcUrl: 'https://rpc.test',
  deployerPrivateKey: `0x${'1'.repeat(64)}`,
  emergencyControllerAddress: `0x${'a'.repeat(40)}`,
  aiExecutionEnabled: true,
  aiExecutionIntervalMs: 120_000,
  monitoringPollEnabled: true,
  monitoringPollIntervalMs: 30_000
}))

vi.mock('../../../config/env', () => ({ env: envMock }))

vi.mock('axios', () => ({
  default: axiosMock
}))

// Import after mocks
// eslint-disable-next-line import/first
import { healthService } from '../health.service'

describe('healthService', () => {
  beforeEach(() => {
    queryRawMock.mockReset()
    axiosMock.post.mockReset()
    axiosMock.get.mockReset()
    schedulerStatusMock.enabled = true
    schedulerStatusMock.lastError = undefined
    monitoringPollerStatusMock.enabled = true
    monitoringPollerStatusMock.lastError = undefined
    monitoringStreamStatusMock.enabled = true
    monitoringStreamStatusMock.lastError = undefined
    envMock.openRouterKey = 'test-openrouter-key'
    envMock.envioApiKey = 'envio-key'
    envMock.envioGraphqlUrl = 'https://envio.test/graphql'
    envMock.monadRpcUrl = 'https://rpc.test'
    envMock.deployerPrivateKey = `0x${'1'.repeat(64)}`
    envMock.emergencyControllerAddress = `0x${'a'.repeat(40)}`
    emergencyConfigStatusMock.mockReset()
    emergencyControllerStateMock.mockReset()
    emergencyConfigStatusMock.mockReturnValue({
      configured: true,
      issues: [],
      controllerAddress: envMock.emergencyControllerAddress
    })
    emergencyControllerStateMock.mockResolvedValue({ paused: false })
  })

  it('reports ok status when all checks pass', async () => {
    queryRawMock.mockResolvedValueOnce([{ result: 1 }])
    axiosMock.post.mockResolvedValueOnce({ data: { data: { __typename: 'Query' } } })
    axiosMock.get.mockResolvedValueOnce({ data: { data: [] } })

    const status = await healthService.getStatus()

    expect(status.status).toBe('ok')
    expect(status.indicators).toEqual([
      expect.objectContaining({ component: 'database', status: 'ok' }),
      expect.objectContaining({ component: 'envio', status: 'ok' }),
      expect.objectContaining({ component: 'openrouter', status: 'ok' }),
      expect.objectContaining({ component: 'scheduler', status: 'ok' }),
      expect.objectContaining({ component: 'monitoring_poller', status: 'ok' }),
      expect.objectContaining({ component: 'monitoring_stream', status: 'ok' }),
      expect.objectContaining({ component: 'emergency_controls', status: 'ok' })
    ])
    expect(status.metadata.monitoringStreamEnabled).toBe(true)
  })

  it('marks database as critical when query fails', async () => {
    queryRawMock.mockRejectedValueOnce(new Error('connection refused'))
    axiosMock.post.mockResolvedValueOnce({ data: { data: { __typename: 'Query' } } })
    axiosMock.get.mockResolvedValueOnce({ data: { data: [] } })

    const status = await healthService.getStatus()

    expect(status.status).toBe('critical')
    expect(status.indicators[0]).toMatchObject({ component: 'database', status: 'critical' })
  })

  it('reports degraded emergency controls when configuration missing', async () => {
    emergencyConfigStatusMock.mockReturnValueOnce({
      configured: false,
      issues: ['MONAD_RPC_URL is missing']
    })

    queryRawMock.mockResolvedValueOnce([{ result: 1 }])
    axiosMock.post.mockResolvedValueOnce({ data: { data: { __typename: 'Query' } } })
    axiosMock.get.mockResolvedValueOnce({ data: { data: [] } })

    const status = await healthService.getStatus()

    const emergencyIndicator = status.indicators.find((indicator) => indicator.component === 'emergency_controls')
    expect(emergencyIndicator).toEqual(expect.objectContaining({
      component: 'emergency_controls',
      status: 'degraded',
      message: 'Emergency controller not configured'
    }))
  })
})
