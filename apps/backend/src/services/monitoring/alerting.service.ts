import axios from 'axios'
import type { AIExecutionResult, RiskInsights } from '../../types/ai.js'
import { env } from '../../config/env'

const COOLDOWN_MS = Math.max(env.alertCooldownMinutes, 1) * 60_000

class AlertingService {
  private readonly lastSentMap = new Map<string, number>()

  async notifyExecution (result: AIExecutionResult): Promise<void> {
    if (env.alertWebhookUrl === '') return

    const now = Date.now()
    const key = `${result.account}:${result.delegate}`
    const lastSent = this.lastSentMap.get(key)
    if (lastSent != null && now - lastSent < COOLDOWN_MS) {
      return
    }

    const evaluation = result.evaluation
    const baseLimit = result.totalExecutedUsd + result.remainingDailyLimitUsd
    const utilization = baseLimit === 0 ? 0 : Number((result.totalExecutedUsd / baseLimit).toFixed(4))
    const highRisk = evaluation?.riskScore != null && evaluation.riskScore >= env.alertRiskThreshold
    const highUtilization = utilization >= env.alertUtilizationThreshold
    const hasWarnings = (evaluation?.warnings?.length ?? 0) > 0 || (result.warnings?.length ?? 0) > 0

    if (!highRisk && !highUtilization && !hasWarnings) {
      return
    }

    try {
      await axios.post(env.alertWebhookUrl, {
        type: 'ai-execution-alert',
        account: result.account,
        delegate: result.delegate,
        summary: result.summary,
        totalExecutedUsd: result.totalExecutedUsd,
        remainingDailyLimitUsd: result.remainingDailyLimitUsd,
        utilization,
        evaluation,
        warnings: result.warnings,
        governanceSummary: result.governanceSummary,
        generatedAt: result.generatedAt
      }, {
        timeout: 5_000
      })

      this.lastSentMap.set(key, now)
    } catch (error) {
      console.error('[alerting] Failed to send execution webhook', error)
    }
  }

  async notifyMonitoringAnomaly (insights: RiskInsights): Promise<void> {
    if (env.alertWebhookUrl === '') return

    const utilization = insights.delegation.utilization
    const highUtilization = utilization >= env.alertUtilizationThreshold
    const guardrailBreached = insights.guardrails.violations.length > 0

    if (!highUtilization && !guardrailBreached) {
      return
    }

    const now = Date.now()
    const key = `monitoring:${insights.account}`
    const lastSent = this.lastSentMap.get(key)
    if (lastSent != null && now - lastSent < COOLDOWN_MS) {
      return
    }

    try {
      await axios.post(env.alertWebhookUrl, {
        type: 'monitoring-alert',
        account: insights.account,
        totalValueUsd: insights.totalValueUsd,
        guardrailViolations: insights.guardrails.violations,
        utilization,
        delegation: insights.delegation,
        exposure: insights.exposure
      }, {
        timeout: 5_000
      })

      this.lastSentMap.set(key, now)
    } catch (error) {
      console.error('[alerting] Failed to send monitoring webhook', error)
    }
  }
}

export const alertingService = new AlertingService()
