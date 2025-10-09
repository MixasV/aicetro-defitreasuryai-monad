import { randomUUID } from 'node:crypto'
import type { OpenRouterCallMetric, OpenRouterMetricsSummary, OpenRouterMetricsResponse, OpenRouterCallStatus } from '../../types/ai.js'

const MAX_ENTRIES = 50

type RecordInput = Omit<OpenRouterCallMetric, 'id' | 'createdAt'> & { createdAt?: string }

export class AITelemetryService {
  private readonly metrics: OpenRouterCallMetric[] = []

  record (input: RecordInput): OpenRouterCallMetric {
    const metric: OpenRouterCallMetric = {
      id: randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      ...input
    }

    this.metrics.unshift(metric)
    if (this.metrics.length > MAX_ENTRIES) {
      this.metrics.length = MAX_ENTRIES
    }

    return metric
  }

  getMetrics (limit = 20): OpenRouterMetricsResponse {
    return {
      summary: this.getSummary(),
      metrics: this.metrics.slice(0, Math.max(0, limit))
    }
  }

  getSummary (): OpenRouterMetricsSummary {
    const totalCalls = this.metrics.length
    let successCount = 0
    let errorCount = 0
    let skippedCount = 0
    let latencyAccum = 0
    let latencySamples = 0
    let lastSuccessAt: string | undefined
    let lastErrorAt: string | undefined

    for (const metric of this.metrics) {
      if (metric.status === 'success') {
        successCount += 1
        latencyAccum += metric.latencyMs
        latencySamples += 1
        if (lastSuccessAt == null) {
          lastSuccessAt = metric.createdAt
        }
      } else if (metric.status === 'error') {
        errorCount += 1
        if (lastErrorAt == null) {
          lastErrorAt = metric.createdAt
        }
      } else if (metric.status === 'skipped') {
        skippedCount += 1
      }
    }

    const averageLatencyMs = latencySamples > 0
      ? Number((latencyAccum / latencySamples).toFixed(2))
      : undefined

    return {
      totalCalls,
      successCount,
      errorCount,
      skippedCount,
      averageLatencyMs,
      lastCallAt: this.metrics[0]?.createdAt,
      lastSuccessAt,
      lastErrorAt
    }
  }

  reset () {
    this.metrics.length = 0
  }

  getLastMetric (status?: OpenRouterCallStatus): OpenRouterCallMetric | undefined {
    if (status == null) return this.metrics[0]
    return this.metrics.find((metric) => metric.status === status)
  }
}

export const aiTelemetryService = new AITelemetryService()
