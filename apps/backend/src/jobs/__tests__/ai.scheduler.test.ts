/* eslint-disable import/first */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../config/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../../services/ai/ai.executor', () => ({
  aiExecutionService: {
    execute: vi.fn()
  }
}))

vi.mock('../../services/blockchain/blockchain.service', () => ({
  blockchainService: {
    listCorporateAccounts: vi.fn(),
    getDelegationState: vi.fn()
  }
}))

import { aiExecutionService } from '../../services/ai/ai.executor'
import { blockchainService } from '../../services/blockchain/blockchain.service'
import { AIScheduler } from '../ai.scheduler'

const mockedExecution = vi.mocked(aiExecutionService)
const mockedBlockchain = vi.mocked(blockchainService)

describe('AIScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-05T12:00:00Z'))
    mockedBlockchain.listCorporateAccounts.mockResolvedValue([])
    mockedBlockchain.getDelegationState.mockResolvedValue({
      delegate: '0xdelegate',
      dailyLimitUsd: 10_000,
      spent24h: 0,
      whitelist: ['Aave Monad'],
      maxRiskScore: 5
    })
    mockedExecution.execute.mockResolvedValue({
      account: '0xaccount',
      delegate: '0xdelegate',
      generatedAt: new Date().toISOString(),
      summary: 'ok',
      totalExecutedUsd: 1_000,
      remainingDailyLimitUsd: 9_000,
      actions: []
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('runs manual execution and returns summary', async () => {
    mockedBlockchain.listCorporateAccounts.mockResolvedValueOnce([
      { address: '0xaccount', owners: [], threshold: 2, createdAt: new Date().toISOString() }
    ])

    const scheduler = new AIScheduler(5_000)
    const summary = await scheduler.runOnce('manual')

    expect(summary).not.toBeNull()
    expect(summary?.processedAccounts).toBe(1)
    expect(summary?.successCount).toBe(1)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedExecution.execute).toHaveBeenCalledWith({ account: '0xaccount', delegate: '0xdelegate' })

    const status = scheduler.getStatus()
    expect(status.lastRunAt).toBeDefined()
    expect(status.running).toBe(false)
    expect(status.lastSummary?.source).toBe('manual')
  })

  it('prevents concurrent manual executions', async () => {
    mockedBlockchain.listCorporateAccounts.mockResolvedValue([
      { address: '0xaccount', owners: [], threshold: 2, createdAt: new Date().toISOString() }
    ])

    const scheduler = new AIScheduler(5_000)
    const firstRun = scheduler.runOnce('manual')

    await expect(scheduler.runOnce('manual')).rejects.toThrow('AI scheduler iteration уже выполняется.')

    await firstRun
  })

  it('starts and stops automatic execution', async () => {
    mockedBlockchain.listCorporateAccounts.mockResolvedValue([
      { address: '0xaccount', owners: [], threshold: 2, createdAt: new Date().toISOString() }
    ])

    const scheduler = new AIScheduler(60_000)
    expect(scheduler.start()).toBe(true)
    expect(scheduler.start()).toBe(false)

    await vi.runOnlyPendingTimersAsync()

    expect(scheduler.getStatus().enabled).toBe(true)

    expect(scheduler.stop()).toBe(true)
    expect(scheduler.stop()).toBe(false)
  })
})
