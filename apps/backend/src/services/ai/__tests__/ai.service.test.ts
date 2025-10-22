import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AIRecommendationRequest } from '../../../types/ai.js'

let postMock: ReturnType<typeof vi.fn>

type MockAxiosError = Error & {
  isAxiosError: boolean
  response: {
    status: number
    headers: Record<string, string>
  }
}

const loadModule = async (envOverrides: Record<string, unknown> = {}) => {
  vi.resetModules()
  postMock = vi.fn()

  vi.doMock('axios', () => {
    const create = vi.fn(() => ({ post: postMock }))
    const isAxiosError = (error: unknown): boolean => Boolean((error as { isAxiosError?: boolean })?.isAxiosError)
    return {
      default: { create },
      create,
      isAxiosError
    }
  })

  const defaultEnv = {
    openRouterKey: 'test-key',
    openRouterBaseUrl: 'https://mock.openrouter.ai/v1',
    openRouterModel: 'mock-model',
    openRouterProviders: [
      {
        model: 'mock-model',
        label: 'primary',
        baseUrl: 'https://mock.openrouter.ai/v1',
        apiKey: 'test-key'
      }
    ],
    openRouterTimeoutMs: 5_000,
    openRouterMaxRetries: 1,
    openRouterRetryDelayMs: 10,
    monitoringPollIntervalMs: 30_000,
    monitoringPollEnabled: true,
    aiExecutionEnabled: true,
    aiExecutionIntervalMs: 60_000,
    databaseUrl: '',
    port: 4000,
    nodeEnv: 'test',
    redisUrl: '',
    envioApiKey: '',
    envioGraphqlUrl: '',
    monadRpcUrl: '',
    deployerPrivateKey: '',
    emergencyControllerAddress: '',
    alertWebhookUrl: '',
    alertRiskThreshold: 4.2,
    alertUtilizationThreshold: 0.85,
    alertCooldownMinutes: 10
  }

  const mergedEnv: typeof defaultEnv & Record<string, unknown> = {
    ...defaultEnv,
    ...envOverrides
  }

  const baseProviders = (envOverrides.openRouterProviders ?? defaultEnv.openRouterProviders) as Array<{
    model: string
    label: string
    baseUrl: string
    apiKey?: string
  }>

  mergedEnv.openRouterProviders = baseProviders.map((provider) => ({ ...provider }))

  if (mergedEnv.openRouterKey === '' && !('openRouterProviders' in envOverrides)) {
    mergedEnv.openRouterProviders = mergedEnv.openRouterProviders.map((provider) => ({
      ...provider,
      apiKey: ''
    }))
  }

  vi.doMock('../../../config/env', () => ({
    env: {
      ...mergedEnv
    }
  }))

  const telemetryModule = await import('../ai.telemetry')
  telemetryModule.aiTelemetryService.reset()

  const serviceModule = await import('../ai.service')

  return {
    aiService: serviceModule.aiService,
    aiTelemetryService: telemetryModule.aiTelemetryService
  }
}

const buildPayload = (overrides: Partial<AIRecommendationRequest> = {}): AIRecommendationRequest => {
  const protocols = overrides.protocols ?? ['Aave Monad']

  return {
    portfolio: {
      positions: [],
      totalValueUSD: 100_000,
      netAPY: 5,
      ...(overrides.portfolio ?? {})
    },
    riskTolerance: overrides.riskTolerance ?? 'balanced',
    protocols,
    constraints:
      overrides.constraints ?? {
        dailyLimitUsd: 100_000,
        remainingDailyLimitUsd: 80_000,
        maxRiskScore: 4,
        whitelist: protocols
      },
    context:
      overrides.context ?? {
        account: '0xabc123',
        delegate: '0xdef456',
        chainId: 10143,
        scenario: 'unit-test'
      }
  }
}

describe('AIService.generateRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('возвращает рекомендации и записывает метрики при успешном ответе', async () => {
    const { aiService, aiTelemetryService } = await loadModule()

    postMock.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Rebalance the portfolio to improve yield.',
                analysis: 'Higher yield is achievable through Aave.',
                allocations: [],
                suggestedActions: []
              })
            }
          }
        ],
        usage: {
          prompt_tokens: 120,
          completion_tokens: 80,
          total_tokens: 200
        }
      },
      headers: {
        'x-ratelimit-remaining': '99',
        'x-ratelimit-reset': '10'
      }
    })

    const result = await aiService.generateRecommendations(buildPayload())

    expect(result.summary).toBe('Rebalance the portfolio to improve yield.')
    expect(result.analysis).toBe('Higher yield is achievable through Aave.')
    expect(typeof result.generatedAt).toBe('string')
    expect(postMock).toHaveBeenCalledTimes(1)

    const metric = aiTelemetryService.getLastMetric('success')
    expect(metric).toMatchObject({
      status: 'success',
      model: 'mock-model',
      fallbackUsed: false,
      retries: 0,
      inputTokens: 120,
      outputTokens: 80,
      totalTokens: 200,
      rateLimitRemaining: 99,
      rateLimitResetMs: 10_000
    })
  })

  it('переключается на резервного провайдера и возвращает метаданные модели', async () => {
    const { aiService, aiTelemetryService } = await loadModule({
      openRouterProviders: [
        {
          model: 'primary-model',
          label: 'primary',
          baseUrl: 'https://primary.openrouter.ai',
          apiKey: 'primary-key'
        },
        {
          model: 'backup-model',
          label: 'backup',
          baseUrl: 'https://backup.openrouter.ai',
          apiKey: 'backup-key'
        }
      ],
      openRouterMaxRetries: 1,
      openRouterRetryDelayMs: 1
    })

    const error = new Error('500') as MockAxiosError
    error.isAxiosError = true
    error.response = {
      status: 500,
      headers: {}
    }

    postMock.mockRejectedValueOnce(error)
    postMock.mockResolvedValueOnce({
      data: {
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Backup provider response',
                analysis: 'Secondary provider returned a valid answer.',
                allocations: [],
                suggestedActions: []
              })
            }
          }
        ]
      },
      headers: {}
    })

    const result = await aiService.generateRecommendations(buildPayload())

    expect(result.summary).toBe('Backup provider response')
    expect(result.model).toBe('backup-model')
    expect(result.provider).toBe('backup')
    expect(postMock).toHaveBeenCalledTimes(2)

    const successMetric = aiTelemetryService.getLastMetric('success')
    expect(successMetric).toMatchObject({
      provider: 'backup',
      retries: 1,
      fallbackUsed: false
    })
  })

  it('retries request and uses fallback after OpenRouter errors', async () => {
    const { aiService, aiTelemetryService } = await loadModule({ openRouterMaxRetries: 2, openRouterRetryDelayMs: 1 })

    const error = new Error('429') as MockAxiosError
    error.isAxiosError = true
    error.response = {
      status: 429,
      headers: {
        'retry-after': '0.001'
      }
    }

    postMock.mockRejectedValue(error)

    vi.useFakeTimers()
    let result: Awaited<ReturnType<typeof aiService.generateRecommendations>>
    try {
      const pending = aiService.generateRecommendations(buildPayload())
      await vi.runAllTimersAsync()
      result = await pending
    } finally {
      vi.useRealTimers()
    }

    expect(postMock).toHaveBeenCalledTimes(3)
    expect(result.summary).toContain('fallback')
    expect(result.analysis).toContain('local strategy')

    const metric = aiTelemetryService.getLastMetric('error')
    expect(metric).toMatchObject({
      status: 'error',
      fallbackUsed: true,
      retries: 2,
      errorMessage: '429'
    })
  })

  it('пропускает запрос к OpenRouter при отсутствии ключа', async () => {
    const { aiService, aiTelemetryService } = await loadModule({ openRouterKey: '' })

    const result = await aiService.generateRecommendations(buildPayload())

    expect(postMock).not.toHaveBeenCalled()
    expect(result.summary).toContain('fallback')
    expect(result.analysis).toContain('local strategy')

    const metric = aiTelemetryService.getLastMetric()
    expect(metric).toMatchObject({
      status: 'skipped',
      fallbackUsed: true,
      retries: 0
    })
  })
})
