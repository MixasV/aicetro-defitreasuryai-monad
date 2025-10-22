import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EnvioStreamService } from '../envio.stream.service'

const envMock = vi.hoisted(() => ({
  envioStreamEnabled: false,
  envioWsUrl: '',
  envioApiKey: '',
  envioStreamRefreshIntervalMs: 1_000,
  envioStreamStartBlock: 0
}))

const listCorporateAccountsMock = vi.hoisted(() => vi.fn())
const getPortfolioSnapshotMock = vi.hoisted(() => vi.fn())
const getRiskAlertsMock = vi.hoisted(() => vi.fn())
const getRiskInsightsMock = vi.hoisted(() => vi.fn())
const buildProjectionMock = vi.hoisted(() => vi.fn())

const streamRecvMock = vi.hoisted(() => vi.fn())
const streamCloseMock = vi.hoisted(() => vi.fn())
const streamEventsMock = vi.hoisted(() => vi.fn())
const hypersyncNewMock = vi.hoisted(() => vi.fn(() => ({
  streamEvents: streamEventsMock
})))

vi.mock('../../../config/env', () => ({
  env: envMock
}))

vi.mock('../../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../../blockchain/blockchain.service', () => ({
  blockchainService: {
    listCorporateAccounts: listCorporateAccountsMock
  }
}))

vi.mock('../monitoring.service', () => ({
  monitoringService: {
    getPortfolioSnapshot: getPortfolioSnapshotMock,
    getRiskAlerts: getRiskAlertsMock
  }
}))

vi.mock('../portfolio.analytics.service', () => ({
  portfolioAnalyticsService: {
    buildProjection: buildProjectionMock
  }
}))

vi.mock('../../risk/risk.service', () => ({
  riskService: {
    getRiskInsights: getRiskInsightsMock
  }
}))

vi.mock('@envio-dev/hypersync-client', () => ({
  HypersyncClient: {
    new: hypersyncNewMock
  },
  HexOutput: {
    Prefixed: 'Prefixed'
  },
  LogField: {
    Address: 'Address',
    BlockNumber: 'BlockNumber',
    Topic0: 'Topic0',
    TransactionHash: 'TransactionHash'
  }
}))

describe('EnvioStreamService', () => {
  let envioStreamService: EnvioStreamService

  beforeEach(() => {
    streamRecvMock.mockReset()
    streamCloseMock.mockReset()
    streamEventsMock.mockReset()
    hypersyncNewMock.mockClear()
    listCorporateAccountsMock.mockReset()
    getPortfolioSnapshotMock.mockReset()
    getRiskAlertsMock.mockReset()
    getRiskInsightsMock.mockReset()
    buildProjectionMock.mockReset()

    envMock.envioStreamEnabled = false
    envMock.envioWsUrl = ''
    envMock.envioApiKey = ''
    envMock.envioStreamRefreshIntervalMs = 1_000
    envMock.envioStreamStartBlock = 0

    envioStreamService = new EnvioStreamService()
    streamEventsMock.mockResolvedValue({
      recv: streamRecvMock,
      close: streamCloseMock
    })
  })

  afterEach(async () => {
    try {
      await envioStreamService.stop()
    } catch {}
  })

  it('does not start if stream is disabled', async () => {
    envMock.envioStreamEnabled = false

    const started = await envioStreamService.start()

    expect(started).toBe(false)
    expect(hypersyncNewMock).not.toHaveBeenCalled()
    expect(envioStreamService.getStatus()).toEqual({
      enabled: false,
      running: false,
      connected: false,
      observedAccounts: 0,
      lastError: 'Envio stream not configured'
    })
  })

  it('updates account data when receiving event', async () => {
    // Setup all env values properly
    envMock.envioStreamEnabled = true
    envMock.envioWsUrl = 'wss://envio.example'
    envMock.envioApiKey = 'test-key'
    envMock.envioHttpUrl = 'https://envio.example'
    envMock.envioStreamStartBlock = 12345
    envMock.envioStreamRefreshIntervalMs = 1000

    // Create a fresh service instance with updated env
    envioStreamService = new EnvioStreamService()

    const corporateAccount = {
      address: '0xABCDEF1234567890abcdef1234567890ABCDEF12',
      owners: [],
      threshold: 1,
      createdAt: new Date().toISOString()
    }

    listCorporateAccountsMock.mockResolvedValue([corporateAccount])

    streamRecvMock.mockResolvedValueOnce({
      data: [
        {
          log: {
            address: corporateAccount.address
          }
        }
      ],
      nextBlock: 12346,
      totalExecutionTime: 10
    }).mockResolvedValueOnce(null)

    streamCloseMock.mockResolvedValue(undefined)

    const started = await envioStreamService.start()
    expect(started).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 0))
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(listCorporateAccountsMock).toHaveBeenCalled()
    expect(hypersyncNewMock).toHaveBeenCalledWith({
      url: 'wss://envio.example',
      bearerToken: 'test-key',
      enableChecksumAddresses: true
    })
    expect(streamEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromBlock: envMock.envioStreamStartBlock,
        logs: [
          {
            address: [corporateAccount.address.toLowerCase()]
          }
        ]
      }),
      expect.objectContaining({
        batchSize: 100,
        hexOutput: 'Prefixed'
      })
    )

    expect(getPortfolioSnapshotMock).toHaveBeenCalledWith(corporateAccount.address)
    expect(getRiskAlertsMock).toHaveBeenCalledWith(corporateAccount.address)
    expect(getRiskInsightsMock).toHaveBeenCalledWith(corporateAccount.address)
    expect(buildProjectionMock).toHaveBeenCalledWith(corporateAccount.address)

    await envioStreamService.stop()
    expect(streamCloseMock).toHaveBeenCalled()
  })
})
