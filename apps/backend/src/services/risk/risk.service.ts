import { blockchainService, DEFAULT_AI_AGENT_ADDRESS } from '../blockchain/blockchain.service'
import { monitoringService } from '../monitoring/monitoring.service'
import { monitoringStateService } from '../monitoring/monitoring.state'
import type {
  DelegationExposure,
  PortfolioPosition,
  RiskBandBreakdown,
  RiskBandLevel,
  RiskGuardrailStatus,
  RiskInsights
} from '../../types/ai.js'

const RISK_BANDS: Array<{
  level: RiskBandLevel
  label: string
  minScore: number
  maxScore: number
}> = [
  { level: 'low', label: 'Низкий риск', minScore: 0, maxScore: 2 },
  { level: 'moderate', label: 'Умеренный риск', minScore: 2.01, maxScore: 3 },
  { level: 'high', label: 'Высокий риск', minScore: 3.01, maxScore: 4 },
  { level: 'critical', label: 'Критический риск', minScore: 4.01, maxScore: Number.POSITIVE_INFINITY }
]

const TOP_POSITION_LIMIT = 3

class RiskService {
  async getRiskInsights (account: string): Promise<RiskInsights> {
    const [snapshot, delegation] = await Promise.all([
      monitoringService.getPortfolioSnapshot(account),
      blockchainService.getDelegationState(account, DEFAULT_AI_AGENT_ADDRESS)
    ])

    const positions = snapshot.positions ?? []
    const totalValueUsd = snapshot.totalValueUSD ?? 0
    const bandBuckets = new Map<RiskBandLevel, PortfolioPosition[]>()

    for (const band of RISK_BANDS) {
      bandBuckets.set(band.level, [])
    }

    let highestPositionRisk = 0

    for (const position of positions) {
      const riskScore = clampScore(position.riskScore)
      highestPositionRisk = Math.max(highestPositionRisk, riskScore)
      const band = findBand(riskScore)
      const collection = bandBuckets.get(band.level)
      if (collection != null) {
        collection.push(position)
      }
    }

    const exposure = RISK_BANDS.map<RiskBandBreakdown>((band) => {
      const bucket = bandBuckets.get(band.level) ?? []
      const valueUsd = bucket.reduce((sum, item) => sum + (item.valueUSD ?? 0), 0)
      const percentage = totalValueUsd > 0 ? (valueUsd / totalValueUsd) * 100 : 0

      const topPositions = bucket
        .slice()
        .sort((a, b) => b.valueUSD - a.valueUSD)
        .slice(0, TOP_POSITION_LIMIT)
        .map((item) => ({
          protocol: item.protocol,
          valueUSD: item.valueUSD,
          riskScore: clampScore(item.riskScore)
        }))

      return {
        level: band.level,
        label: band.label,
        minScore: band.minScore,
        maxScore: band.maxScore,
        valueUSD: roundCurrency(valueUsd),
        percentage: Number(percentage.toFixed(2)),
        topPositions
      }
    })

    const guardrails: RiskGuardrailStatus = {
      maxAllowedRiskScore: delegation.maxRiskScore,
      highestPositionRisk,
      violations: []
    }

    if (highestPositionRisk > delegation.maxRiskScore) {
      guardrails.violations.push(
        `Риск-порог делегирования (${delegation.maxRiskScore}) ниже фактической позиции (${highestPositionRisk}).`
      )
    }

    const delegationExposure: DelegationExposure = {
      dailyLimitUsd: roundCurrency(delegation.dailyLimitUsd),
      spent24hUsd: roundCurrency(delegation.spent24h),
      remainingDailyLimitUsd: roundCurrency(Math.max(delegation.dailyLimitUsd - delegation.spent24h, 0)),
      utilization: delegation.dailyLimitUsd > 0 ? Number((delegation.spent24h / delegation.dailyLimitUsd).toFixed(4)) : 0
    }

    const insights: RiskInsights = {
      account,
      totalValueUsd: roundCurrency(totalValueUsd),
      netAPY: snapshot.netAPY,
      exposure,
      guardrails,
      delegation: delegationExposure,
      updatedAt: new Date().toISOString()
    }

    monitoringStateService.setRisk(account, insights)

    return insights
  }
}

const clampScore = (score: number): number => {
  if (!Number.isFinite(score)) return 0
  return Math.min(Math.max(score, 0), 5)
}

const findBand = (score: number) => {
  for (const band of RISK_BANDS) {
    if (score >= band.minScore && score <= band.maxScore) {
      return band
    }
  }
  return RISK_BANDS[RISK_BANDS.length - 1]
}

const roundCurrency = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Number(value.toFixed(2))
}

export const riskService = new RiskService()
