import path from 'node:path'
import { config as loadEnv } from 'dotenv'

const rootEnvPath = path.resolve(__dirname, '../../../../.env')
loadEnv({ path: rootEnvPath })
loadEnv()

const requiredEnvVars = ['DATABASE_URL', 'OPENROUTER_API_KEY']

for (const key of requiredEnvVars) {
  const value = process.env[key]
  if (value === undefined || value === '') {
    console.warn(`[env] Variable ${key} is not set. Using default values for development.`)
  }
}

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value == null) return fallback
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return fallback
}

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (value == null || value.trim() === '') return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

const parseNonNegativeInt = (value: string | undefined, fallback: number): number => {
  if (value == null || value.trim() === '') return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

const parsePositiveFloat = (value: string | undefined, fallback: number): number => {
  if (value == null || value.trim() === '') return fallback
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return parsed
}

interface OpenRouterProviderConfig {
  model: string
  label: string
  baseUrl: string
  apiKey?: string
}

const normalizeProvider = (value: Record<string, unknown>, index: number, defaults: { model: string, baseUrl: string, apiKey?: string }): OpenRouterProviderConfig | null => {
  const model = typeof value.model === 'string' && value.model.trim() !== '' ? value.model.trim() : defaults.model
  const baseUrl = typeof value.baseUrl === 'string' && value.baseUrl.trim() !== '' ? value.baseUrl.trim() : defaults.baseUrl
  const label = typeof value.label === 'string' && value.label.trim() !== '' ? value.label.trim() : `provider-${index + 1}`
  const apiKey = typeof value.apiKey === 'string' && value.apiKey.trim() !== '' ? value.apiKey.trim() : defaults.apiKey

  if (model === '' || baseUrl === '') {
    return null
  }

  return {
    model,
    label,
    baseUrl,
    apiKey: apiKey === '' ? undefined : apiKey
  }
}

const parseProviders = (raw: string | undefined, defaults: { model: string, baseUrl: string, apiKey?: string }): OpenRouterProviderConfig[] => {
  if (raw == null || raw.trim() === '') return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const providers = parsed
      .map((entry, index) => {
        if (entry == null || typeof entry !== 'object') return null
        return normalizeProvider(entry as Record<string, unknown>, index, defaults)
      })
      .filter((provider): provider is OpenRouterProviderConfig => provider != null)

    return providers
  } catch (error) {
    console.warn('[env] Failed to parse OPENROUTER_PROVIDERS, using default provider.', error)
    return []
  }
}

const rawAiExecutionInterval = parsePositiveInt(process.env.AI_EXECUTION_INTERVAL_MS, 120_000)
if (rawAiExecutionInterval < 15_000) {
  console.warn('[env] AI_EXECUTION_INTERVAL_MS is less than 15 seconds. Using 15,000 ms.')
}
const aiExecutionIntervalMs = Math.max(rawAiExecutionInterval, 15_000)

const rawMonitoringPollInterval = parsePositiveInt(process.env.MONITORING_POLL_INTERVAL_MS, 30_000)
if (rawMonitoringPollInterval < 5_000) {
  console.warn('[env] MONITORING_POLL_INTERVAL_MS is less than 5 seconds. Using 5,000 ms.')
}
const monitoringPollIntervalMs = Math.max(rawMonitoringPollInterval, 5_000)

const rawOpenRouterTimeout = parsePositiveInt(process.env.OPENROUTER_TIMEOUT_MS, 30_000)
const openRouterTimeoutMs = Math.min(Math.max(rawOpenRouterTimeout, 5_000), 120_000)

const openRouterMaxRetries = parseNonNegativeInt(process.env.OPENROUTER_MAX_RETRIES, 3)
const rawOpenRouterRetryDelay = parsePositiveInt(process.env.OPENROUTER_RETRY_DELAY_MS, 5_000)
const openRouterRetryDelayMs = Math.min(Math.max(rawOpenRouterRetryDelay, 1_000), 20_000)

const rawEnvioStreamStartBlock = parseNonNegativeInt(process.env.ENVIO_STREAM_START_BLOCK, 0)
const rawEnvioStreamRefreshMs = parsePositiveInt(process.env.ENVIO_STREAM_REFRESH_INTERVAL_MS, 60_000)
const envioStreamRefreshIntervalMs = Math.min(Math.max(rawEnvioStreamRefreshMs, 5_000), 600_000)

const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
const openRouterModel = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-sonnet'
const openRouterKey = process.env.OPENROUTER_API_KEY ?? ''

const providerDefaults = {
  model: openRouterModel,
  baseUrl: openRouterBaseUrl,
  apiKey: openRouterKey === '' ? undefined : openRouterKey
}

const openRouterProvidersRaw = parseProviders(process.env.OPENROUTER_PROVIDERS, providerDefaults)
const openRouterProviders = openRouterProvidersRaw.length > 0
  ? openRouterProvidersRaw
  : [
      {
        ...providerDefaults,
        label: 'default'
      }
    ]

const alertWebhookUrl = process.env.ALERT_WEBHOOK_URL ?? ''
const alertRiskThreshold = Math.min(Math.max(parsePositiveFloat(process.env.ALERT_RISK_THRESHOLD, 4.2), 0), 5)
const alertUtilizationThreshold = Math.min(Math.max(parsePositiveFloat(process.env.ALERT_UTILIZATION_THRESHOLD, 0.85), 0), 1)
const alertCooldownMinutes = Math.max(parsePositiveInt(process.env.ALERT_COOLDOWN_MINUTES, 10), 1)

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/defitreasury',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  openRouterKey,
  openRouterBaseUrl,
  openRouterModel,
  openRouterTimeoutMs,
  openRouterMaxRetries,
  openRouterRetryDelayMs,
  openRouterProviders,
  envioApiKey: process.env.ENVIO_API_KEY ?? '',
  envioGraphqlUrl: process.env.ENVIO_GRAPHQL_URL ?? '',
  envioWsUrl: process.env.ENVIO_WS_URL ?? '',
  envioStreamEnabled: parseBoolean(process.env.ENVIO_STREAM_ENABLED, false),
  envioStreamStartBlock: rawEnvioStreamStartBlock,
  envioStreamRefreshIntervalMs,
  monadRpcUrl: process.env.MONAD_RPC_URL ?? '',
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY ?? '',
  trustlessTreasuryAddress: process.env.TRUSTLESS_TREASURY_ADDRESS ?? process.env.TREASURY_MANAGER_ADDRESS ?? '',
  emergencyControllerAddress: process.env.EMERGENCY_CONTROLLER_ADDRESS ?? '',
  aiExecutionEnabled: parseBoolean(process.env.AI_EXECUTION_ENABLED, true),
  aiExecutionIntervalMs,
  aiAutoExecutionEnabled: parseBoolean(process.env.AI_AUTO_EXECUTION_ENABLED, false),
  monitoringPollEnabled: parseBoolean(process.env.MONITORING_POLL_ENABLED, true),
  monitoringPollIntervalMs,
  aiAgentPrivateKey: process.env.AI_AGENT_PRIVATE_KEY ?? process.env.DEPLOYER_PRIVATE_KEY ?? '',
  alertWebhookUrl,
  alertRiskThreshold,
  alertUtilizationThreshold,
  alertCooldownMinutes
}
