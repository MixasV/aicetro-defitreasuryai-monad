import axios, { type AxiosInstance, isAxiosError } from 'axios'
import { env } from '../../config/env'
import type {
  AIRecommendationEvaluation,
  AIRecommendationRequest,
  AIRecommendationResponse,
  AllocationRecommendation,
  MonadProtocolMetrics,
  MonadProtocolMetricsSource
} from '../../types/ai.js'
import { aiTelemetryService } from './ai.telemetry'
import { aiRecommendationLogService } from './ai.recommendation-log'

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const parseNumberHeader = (value: unknown): number | undefined => {
  if (value == null) return undefined
  if (Array.isArray(value)) {
    return parseNumberHeader(value[0])
  }
  const trimmed = String(value).trim()
  if (trimmed === '') return undefined
  const parsed = Number.parseFloat(trimmed)
  return Number.isNaN(parsed) ? undefined : parsed
}

const parseRetryAfterSeconds = (value: unknown): number | undefined => {
  const numeric = parseNumberHeader(value)
  if (numeric != null) return numeric

  if (typeof value === 'string') {
    const parsedDate = new Date(value)
    if (!Number.isNaN(parsedDate.getTime())) {
      const diffMs = parsedDate.getTime() - Date.now()
      if (diffMs <= 0) return 0
      return diffMs / 1000
    }
  }

  return undefined
}

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}

interface ProviderConfig {
  model: string
  label: string
  baseUrl: string
  apiKey?: string
}

interface ProtocolCandidate {
  id: string
  label: string
  apy: number
  risk: number
  tvlUsd?: number
  volume24hUsd?: number
  source: MonadProtocolMetricsSource
}

class AIService {
  private readonly providers: ProviderConfig[] = env.openRouterProviders
  private readonly clients = new Map<string, AxiosInstance>()
  private nextProviderIndex = 0

  async generateRecommendations (payload: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    const prompt = this.buildPrompt(payload)
    const startedAt = Date.now()
    const maxAttempts = Math.max(1, env.openRouterMaxRetries + 1)
    let retries = 0
    let lastError: unknown
    let lastProvider: ProviderConfig | undefined

    const account = payload.context?.account ?? 'unknown'
    const delegate = payload.context?.delegate ?? 'unknown'

    const availableProviders = this.providers.filter((provider) => (provider.apiKey ?? env.openRouterKey) !== '')

    if (availableProviders.length === 0) {
      aiTelemetryService.record({
        model: this.providers[0]?.model ?? env.openRouterModel,
        provider: this.providers[0]?.label ?? 'unconfigured',
        status: 'skipped',
        latencyMs: 0,
        retries: 0,
        fallbackUsed: true,
        errorMessage: 'No OpenRouter providers configured'
      })

      const fallback = this.generateOfflineFallback(payload)
      const fallbackWithMeta = {
        ...fallback,
        model: this.providers[0]?.model ?? env.openRouterModel,
        provider: this.providers[0]?.label ?? 'offline'
      }
      await aiRecommendationLogService.record({
        account,
        delegate,
        model: this.providers[0]?.model ?? env.openRouterModel,
        provider: this.providers[0]?.label ?? 'offline',
        status: 'skipped',
        latencyMs: 0,
        fallbackUsed: true,
        prompt,
        response: JSON.stringify(fallbackWithMeta),
        evaluation: fallbackWithMeta.evaluation,
        errorMessage: 'OpenRouter providers are not configured'
      })

      return fallbackWithMeta
    }

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const providerIndex = (this.nextProviderIndex + attempt) % availableProviders.length
      const provider = availableProviders[providerIndex]
      const apiKey = provider.apiKey ?? env.openRouterKey
      const client = this.getClient(provider, apiKey)
      lastProvider = provider

      try {
        const response = await client.post<{
          choices?: Array<{
            message?: {
              content?: string
            }
          }>
          usage?: {
            prompt_tokens?: number
            completion_tokens?: number
            total_tokens?: number
          }
        }>('/chat/completions', {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content:
                'You are the AI treasurer of a corporation operating on Monad. Respond strictly in JSON with fields summary, analysis, allocations[], suggestedActions[]. Each allocations[].protocol must use identifiers from the protocol hints (e.g. "nabla:usdc", "aave:usdc"). Propose optimal allocations based on risk/return analysis, even if some protocols are not currently whitelisted - the system will flag them for review.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })

        const latencyMs = Date.now() - startedAt
        const raw = response.data?.choices?.[0]?.message?.content

        if (raw == null || raw.trim() === '') {
          throw new Error('OpenRouter returned an empty response')
        }

        let parsed: AIRecommendationResponse
        try {
          parsed = JSON.parse(raw) as AIRecommendationResponse
        } catch (error) {
          throw new Error(`OpenRouter returned invalid JSON: ${extractErrorMessage(error)}`)
        }

        const enriched = this.enrichResponse(payload, parsed)
        const responseWithMeta = {
          ...enriched,
          model: provider.model,
          provider: provider.label
        }
        const usage = response.data?.usage
        const rateLimitRemaining = parseNumberHeader(response.headers?.['x-ratelimit-remaining'])
        const rateLimitReset = parseNumberHeader(response.headers?.['x-ratelimit-reset'])
        const rateLimitResetMs = rateLimitReset == null
          ? undefined
          : rateLimitReset > 1_000_000_000
            ? Math.max(0, Math.round(rateLimitReset - Date.now()))
            : Math.round(rateLimitReset * 1000)

        aiTelemetryService.record({
          model: provider.model,
          provider: provider.label,
          status: 'success',
          latencyMs,
          retries,
          fallbackUsed: false,
          inputTokens: usage?.prompt_tokens,
          outputTokens: usage?.completion_tokens,
          totalTokens: usage?.total_tokens,
          rateLimitRemaining,
          rateLimitResetMs
        })

        this.nextProviderIndex = (providerIndex + 1) % availableProviders.length

        await aiRecommendationLogService.record({
          account,
          delegate,
          model: provider.model,
          provider: provider.label,
          status: 'success',
          latencyMs,
          fallbackUsed: false,
          prompt,
          response: JSON.stringify(responseWithMeta),
          evaluation: responseWithMeta.evaluation,
          createdAt: new Date(responseWithMeta.generatedAt)
        })

        return responseWithMeta
      } catch (error) {
        lastError = error
        const retryable = this.shouldRetry(error)
        if (attempt < maxAttempts - 1 && retryable) {
          retries += 1
          const delayMs = this.resolveRetryDelay(error, retries)
          await sleep(delayMs)
          continue
        }
        break
      }
    }

    const latencyMs = Date.now() - startedAt
    const providerInfo = lastProvider ?? availableProviders[this.nextProviderIndex % availableProviders.length]
    aiTelemetryService.record({
      model: providerInfo.model,
      provider: providerInfo.label,
      status: 'error',
      latencyMs,
      retries,
      fallbackUsed: true,
      errorMessage: extractErrorMessage(lastError)
    })

    const fallback = this.generateOfflineFallback(payload)
    const fallbackWithMeta = {
      ...fallback,
      model: providerInfo.model,
      provider: providerInfo.label
    }

    await aiRecommendationLogService.record({
      account,
      delegate,
      model: providerInfo.model,
      provider: providerInfo.label,
      status: 'error',
      latencyMs,
      fallbackUsed: true,
      prompt,
      response: JSON.stringify(fallbackWithMeta),
      evaluation: fallbackWithMeta.evaluation,
      errorMessage: extractErrorMessage(lastError)
    })

    return fallbackWithMeta
  }

  private buildPrompt (payload: AIRecommendationRequest): string {
    const { portfolio, riskTolerance, protocols, constraints, protocolMetrics } = payload

    const constraintLines = [
      `Daily limit: ${(constraints.dailyLimitUsd ?? 0).toFixed(2)} USD`,
      `Remaining limit: ${(constraints.remainingDailyLimitUsd ?? 0).toFixed(2)} USD`,
      `Max allowed risk score: ${constraints.maxRiskScore ?? 5}`,
      `Whitelisted protocols: ${protocols.join(', ')}`
    ]

    if (constraints.notes != null && constraints.notes.trim() !== '') {
      constraintLines.push(`Notes: ${constraints.notes.trim()}`)
    }

    const summary = `Portfolio value ${(portfolio.totalValueUSD ?? 0).toFixed(2)} USD, net APY ${(portfolio.netAPY ?? 0).toFixed(2)}%. Risk tolerance: ${riskTolerance}.`

    const positionsBlock = portfolio.positions.length > 0
      ? portfolio.positions
        .map((position) =>
          `${position.protocol} (${position.asset}) — ${(position.valueUSD ?? 0).toFixed(2)} USD, APY ${(position.currentAPY ?? 0).toFixed(2)}%, risk ${position.riskScore ?? 0}`
        )
        .join('\n')
      : 'No current positions.'

    const metricsOverview = this.buildProtocolOverview(protocolMetrics)

    return [
      summary,
      'Current positions:',
      positionsBlock,
      'Monad protocol live metrics (use the provided identifiers in allocations[].protocol):',
      metricsOverview,
      'Constraints and context:',
      constraintLines.join('; '),
      '',
      'Current whitelisted protocols: ' + protocols.join(', '),
      `Daily spending limit: ${(constraints.remainingDailyLimitUsd ?? 0).toFixed(2)} USD remaining`,
      `Maximum allowed risk score: ${constraints.maxRiskScore ?? 5}`,
      '',
      'Propose the optimal allocation strategy. You may suggest protocols outside the current whitelist if they offer better risk/return - the system will generate warnings for human review.'
    ].join('\n')
  }

  private buildProtocolOverview (metrics?: MonadProtocolMetrics): string {
    const candidates = this.deriveProtocolCandidates(metrics)
    if (candidates.length === 0) {
      return 'Metrics unavailable — provide a conservative diversified allocation.'
    }

    return candidates
      .slice(0, 12)
      .map((candidate) => {
        const parts = [
          `${candidate.id} — ${candidate.label}`,
          `APY ${(candidate.apy ?? 0).toFixed(2)}%`,
          `risk ${candidate.risk ?? 0}`
        ]

        if (candidate.tvlUsd != null) {
          parts.push(`TVL ~$${(candidate.tvlUsd).toFixed(0)}`)
        }

        if (candidate.volume24hUsd != null) {
          parts.push(`24h volume ~$${(candidate.volume24hUsd).toFixed(0)}`)
        }

        parts.push(`source: ${candidate.source}`)
        return `- ${parts.join(', ')}`
      })
      .join('\n')
  }

  private deriveProtocolCandidates (metrics?: MonadProtocolMetrics): ProtocolCandidate[] {
    if (metrics == null) return []

    const candidates: ProtocolCandidate[] = []

    for (const pool of metrics.nablaPools) {
      candidates.push({
        id: pool.id.toLowerCase(),
        label: `Nabla ${pool.asset}`,
        apy: pool.currentApy ?? 0,
        risk: pool.riskScore ?? 0,
        tvlUsd: pool.tvlUsd ?? 0,
        volume24hUsd: pool.volume24hUsd ?? 0,
        source: pool.source ?? 'fallback'
      })
    }

    for (const pair of metrics.uniswapPairs) {
      const label = `Uniswap ${pair.token0Symbol}/${pair.token1Symbol}`
      const inferredRisk = pair.isActive ? 4 : 5
      candidates.push({
        id: pair.id.toLowerCase(),
        label,
        apy: pair.apr ?? 0,
        risk: inferredRisk,
        volume24hUsd: pair.volume24hUsd ?? 0,
        source: pair.source ?? 'fallback'
      })
    }

    return candidates.sort((a, b) => b.apy - a.apy)
  }

  private generateOfflineFallback (payload: AIRecommendationRequest): AIRecommendationResponse {
    const { portfolio, protocols } = payload
    const allocationBase = 1 / protocols.length
    const allocations: AllocationRecommendation[] = protocols.map((protocol, index) => ({
      protocol,
      allocationPercent: Number((allocationBase * 100).toFixed(2)),
      expectedAPY: portfolio.netAPY + 1 + index,
      rationale: 'Fallback without OpenRouter: equal split across whitelisted protocols.',
      riskScore: Math.max(1, 5 - index)
    }))

    const offline: AIRecommendationResponse = {
      summary: 'OpenRouter API unavailable, using fallback allocation logic.',
      analysis:
        'AI provider is offline. Applying local strategy: evenly distribute assets across whitelisted protocols for demonstration only.',
      allocations,
      suggestedActions: allocations.map((item) => `Move ${item.allocationPercent}% into ${item.protocol}.`),
      generatedAt: new Date().toISOString()
    }

    return this.enrichResponse(
      payload,
      offline
    )
  }

  private shouldRetry (error: unknown): boolean {
    if (!isAxiosError(error)) return false
    if (error.code === 'ECONNABORTED') return true
    const status = error.response?.status
    if (status == null) return true
    return status === 429 || status >= 500
  }

  private resolveRetryDelay (error: unknown, retries: number): number {
    if (isAxiosError(error)) {
      const retryAfter = parseRetryAfterSeconds(error.response?.headers?.['retry-after'])
      if (retryAfter != null) {
        return Math.min(Math.max(retryAfter * 1000, 1_000), 60_000)
      }
      
      // For 429 rate limit errors, use exponential backoff
      if (error.response?.status === 429) {
        const exponentialDelay = env.openRouterRetryDelayMs * Math.pow(2, retries - 1)
        return Math.min(Math.max(exponentialDelay, 2_000), 60_000)
      }
    }

    // Standard exponential backoff for other retryable errors
    const exponentialDelay = env.openRouterRetryDelayMs * Math.pow(1.5, retries - 1)
    return Math.min(Math.max(exponentialDelay, 1_000), 30_000)
  }

  private getClient (provider: ProviderConfig, apiKey: string): AxiosInstance {
    const cacheKey = `${provider.label}:${provider.baseUrl}`
    const cached = this.clients.get(cacheKey)
    if (cached != null) {
      return cached
    }

    const client = axios.create({
      baseURL: provider.baseUrl,
      timeout: env.openRouterTimeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey !== '' ? { Authorization: `Bearer ${apiKey}` } : {})
      }
    })

    this.clients.set(cacheKey, client)
    return client
  }

  private enrichResponse (payload: AIRecommendationRequest, response: AIRecommendationResponse): AIRecommendationResponse {
    const generatedAt = response.generatedAt ?? new Date().toISOString()
    const normalizedAllocations = response.allocations.map((allocation) => ({
      ...allocation,
      allocationPercent: Number(Math.max(0, Math.min(100, allocation.allocationPercent ?? 0)).toFixed(2)),
      expectedAPY: Number((allocation.expectedAPY ?? 0).toFixed(2)),
      riskScore: Number(Math.max(0, Math.min(5, allocation.riskScore ?? 0)).toFixed(2))
    }))

    const whitelist = new Set(payload.constraints.whitelist.map((item) => item.trim().toLowerCase()))
    const warnings: string[] = []
    let simulatedUsd = 0
    let remaining = Math.max(payload.constraints.remainingDailyLimitUsd, 0)

    for (const allocation of normalizedAllocations) {
      const planned = Number((payload.portfolio.totalValueUSD * (allocation.allocationPercent / 100)).toFixed(2))
      const executable = Math.min(remaining, planned)
      allocation.rationale = allocation.rationale ?? 'No rationale provided.'

      // Extract base protocol from identifiers like "aave:usdc" or "nabla:usdc"
      const baseProtocol = allocation.protocol.split(':')[0].toLowerCase()
      const isWhitelisted = whitelist.has(allocation.protocol.toLowerCase()) || whitelist.has(baseProtocol)
      
      if (!isWhitelisted) {
        warnings.push(`Protocol ${allocation.protocol} is not whitelisted.`)
      }

      if (allocation.riskScore > payload.constraints.maxRiskScore) {
        warnings.push(`Protocol ${allocation.protocol} risk score (${allocation.riskScore}) exceeds the limit ${payload.constraints.maxRiskScore}.`)
      }

      if (planned > remaining) {
        warnings.push(`Insufficient daily limit for ${allocation.protocol}: required ${planned} USD, available ${remaining} USD.`)
      }

      simulatedUsd = Number((simulatedUsd + Math.max(0, executable)).toFixed(2))
      remaining = Number(Math.max(0, remaining - executable).toFixed(2))
    }

    const totalPercent = normalizedAllocations.reduce((sum, item) => sum + item.allocationPercent, 0)
    if (totalPercent > 101) {
      warnings.push(`Total allocation exceeds 100% (${totalPercent.toFixed(2)}%).`)
    }

    const uniqueWarnings = Array.from(new Set(warnings))
    const averageRisk = normalizedAllocations.length > 0
      ? normalizedAllocations.reduce((sum, item) => sum + item.riskScore, 0) / normalizedAllocations.length
      : 0

    const baseConfidence = 0.9 - uniqueWarnings.length * 0.15
    const evaluation: AIRecommendationEvaluation = {
      confidence: Number(Math.max(0.1, Math.min(0.99, baseConfidence)).toFixed(2)),
      riskScore: Number(averageRisk.toFixed(2)),
      warnings: uniqueWarnings,
      notes: `Remaining daily limit after simulation: ${remaining.toFixed(2)} USD.`,
      simulatedUsd: Number(simulatedUsd.toFixed(2))
    }

    const suggestedActions = response.suggestedActions != null && response.suggestedActions.length > 0
      ? response.suggestedActions.map((action) => {
          // Handle both string and object formats from OpenRouter
          if (typeof action === 'string') {
            return action
          }
          // Convert object format {action, details, expectedImpact} to string
          if (typeof action === 'object' && action != null) {
            const actionObj = action as Record<string, unknown>
            const actionText = actionObj.action ?? actionObj.text ?? ''
            const impact = actionObj.expectedImpact ?? actionObj.impact ?? actionObj.details ?? ''
            return impact ? `${actionText} (${impact})` : String(actionText)
          }
          return String(action)
        })
      : normalizedAllocations.map((allocation) => `Allocate ${allocation.allocationPercent}% (${(payload.portfolio.totalValueUSD * allocation.allocationPercent / 100).toFixed(2)} USD) to ${allocation.protocol}.`)

    const governanceSummary = response.governanceSummary ??
      `Confidence ${Math.round((evaluation.confidence ?? 0) * 100)}%. Simulated spend: ${(evaluation.simulatedUsd ?? 0).toFixed(2)} USD with limit ${(payload.constraints.dailyLimitUsd ?? 0).toFixed(2)} USD.`

    return {
      ...response,
      allocations: normalizedAllocations,
      suggestedActions,
      analysis: (typeof response.analysis === 'string' && response.analysis.trim() !== '') ? response.analysis.trim() : 'No analytical commentary provided.',
      summary: (typeof response.summary === 'string' && response.summary.trim() !== '') ? response.summary.trim() : 'AI generated a portfolio rebalancing plan.',
      generatedAt,
      evaluation,
      governanceSummary
    }
  }
}

export const aiService = new AIService()
