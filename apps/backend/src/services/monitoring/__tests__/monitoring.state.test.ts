import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AlertEvent } from '@defitreasuryai/types'
import type { PortfolioProjection, PortfolioSnapshot, RiskInsights } from '../../../types/ai.js'
import type { MonitoringStateService } from '../monitoring.state'
import type { MonitoringEventBus } from '../monitoring.events'

const ACCOUNT = '0xA18F4B758C0F7E441234567890ABCDEF12345678'
const NORMALIZED_ACCOUNT = ACCOUNT.toLowerCase()

const buildSnapshot = (): PortfolioSnapshot => ({
  totalValueUSD: 125_000,
  netAPY: 8.75,
  positions: [
    {
      protocol: 'Aave Monad',
      asset: 'USDC',
      amount: 50_000,
      valueUSD: 50_000,
      currentAPY: 8.5,
      riskScore: 2
    }
  ]
})

const buildAlerts = (): AlertEvent[] => ([
  {
    id: 'alert-1',
    title: 'Yield compression',
    severity: 'warning',
    description: 'APY dropped by 1.2% over the last 3 hours',
    createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString()
  }
])

const buildRiskInsights = (): RiskInsights => ({
  account: NORMALIZED_ACCOUNT,
  totalValueUsd: 125_000,
  netAPY: 8.75,
  exposure: [
    {
      level: 'moderate',
      label: 'Moderate risk',
      minScore: 2.01,
      maxScore: 3,
      valueUSD: 75_000,
      percentage: 60,
      topPositions: [
        {
          protocol: 'Yearn Monad',
          valueUSD: 45_000,
          riskScore: 3
        }
      ]
    }
  ],
  guardrails: {
    maxAllowedRiskScore: 3.5,
    highestPositionRisk: 3,
    violations: []
  },
  delegation: {
    dailyLimitUsd: 50_000,
    spent24hUsd: 12_500,
    remainingDailyLimitUsd: 37_500,
    utilization: 0.25
  },
  updatedAt: new Date('2024-01-01T01:00:00.000Z').toISOString()
})

const buildProjection = (): PortfolioProjection => ({
  baseValueUsd: 125_000,
  netApy: 8.75,
  horizons: [0, 30, 90],
  points: [
    {
      timestamp: new Date('2024-01-01T00:00:00.000Z').toISOString(),
      netAssetValue: 125_000,
      projectedYield: 0
    },
    {
      timestamp: new Date('2024-01-31T00:00:00.000Z').toISOString(),
      netAssetValue: 128_219.18,
      projectedYield: 3_219.18
    },
    {
      timestamp: new Date('2024-03-31T00:00:00.000Z').toISOString(),
      netAssetValue: 132_951.86,
      projectedYield: 7_951.86
    }
  ],
  generatedAt: new Date('2024-01-01T00:05:00.000Z').toISOString()
})

describe('monitoringStateService', () => {
  let monitoringStateService: MonitoringStateService
  let monitoringEventBus: MonitoringEventBus
  let emitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.resetModules()
    ;({ monitoringEventBus } = await import('../monitoring.events'))
    emitSpy = vi.spyOn(monitoringEventBus, 'emit')
    ;({ monitoringStateService } = await import('../monitoring.state'))
  })

  afterEach(() => {
    emitSpy.mockRestore()
  })

  it('сохраняет и эмитит snapshot события', () => {
    const snapshot = buildSnapshot()

    monitoringStateService.setSnapshot(ACCOUNT, snapshot)

    expect(emitSpy).toHaveBeenCalledWith('snapshot', { account: NORMALIZED_ACCOUNT, snapshot })
    expect(monitoringStateService.getSnapshot(ACCOUNT)).toEqual({ account: NORMALIZED_ACCOUNT, snapshot })
    expect(monitoringStateService.listSnapshots()).toEqual([{ account: NORMALIZED_ACCOUNT, snapshot }])
  })

  it('сохраняет и эмитит alerts события', () => {
    const alerts = buildAlerts()

    monitoringStateService.setAlerts(ACCOUNT, alerts)

    expect(emitSpy).toHaveBeenCalledWith('alerts', { account: NORMALIZED_ACCOUNT, alerts })
    expect(monitoringStateService.getAlerts(ACCOUNT)).toEqual({ account: NORMALIZED_ACCOUNT, alerts })
    expect(monitoringStateService.listAlerts()).toEqual([{ account: NORMALIZED_ACCOUNT, alerts }])
  })

  it('сохраняет и эмитит риск-инсайты', () => {
    const insights = buildRiskInsights()

    monitoringStateService.setRisk(ACCOUNT, insights)

    expect(emitSpy).toHaveBeenCalledWith('risk', { account: NORMALIZED_ACCOUNT, insights })
    expect(monitoringStateService.getRisk(ACCOUNT)).toEqual({ account: NORMALIZED_ACCOUNT, insights })
    expect(monitoringStateService.listRisks()).toEqual([{ account: NORMALIZED_ACCOUNT, insights }])
  })

  it('сохраняет и эмитит прогнозы портфеля', () => {
    const projection = buildProjection()

    monitoringStateService.setProjection(ACCOUNT, projection)

    expect(emitSpy).toHaveBeenCalledWith('projection', { account: NORMALIZED_ACCOUNT, projection })
    expect(monitoringStateService.getProjection(ACCOUNT)).toEqual({ account: NORMALIZED_ACCOUNT, projection })
    expect(monitoringStateService.listProjections()).toEqual([{ account: NORMALIZED_ACCOUNT, projection }])
  })
})
