import path from 'node:path'
import { execSync } from 'node:child_process'
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

// ⚠️ CHANGED: Default 5 minutes (was 10 minutes) for faster testing
const rawAiExecutionInterval = parsePositiveInt(process.env.AI_EXECUTION_INTERVAL_MS, 300_000)
if (rawAiExecutionInterval < 60_000) {
  console.warn('[env] AI_EXECUTION_INTERVAL_MS is less than 60 seconds. Using 60,000 ms (1 minute).')
}
const aiExecutionIntervalMs = Math.max(rawAiExecutionInterval, 60_000)

const rawMonitoringPollInterval = parsePositiveInt(process.env.MONITORING_POLL_INTERVAL_MS, 30_000)
if (rawMonitoringPollInterval < 5_000) {
  console.warn('[env] MONITORING_POLL_INTERVAL_MS is less than 5 seconds. Using 5,000 ms.')
}
const monitoringPollIntervalMs = Math.max(rawMonitoringPollInterval, 5_000)

const rawOpenRouterTimeout = parsePositiveInt(process.env.OPENROUTER_TIMEOUT_MS, 30_000)
const openRouterTimeoutMs = Math.min(Math.max(rawOpenRouterTimeout, 5_000), 120_000)

const openRouterMaxRetries = parseNonNegativeInt(process.env.OPENROUTER_MAX_RETRIES, 5)
const rawOpenRouterRetryDelay = parsePositiveInt(process.env.OPENROUTER_RETRY_DELAY_MS, 2_000)
const openRouterRetryDelayMs = Math.min(Math.max(rawOpenRouterRetryDelay, 1_000), 10_000)

const rawEnvioStreamStartBlock = parseNonNegativeInt(process.env.ENVIO_STREAM_START_BLOCK, 0)
const rawEnvioStreamRefreshMs = parsePositiveInt(process.env.ENVIO_STREAM_REFRESH_INTERVAL_MS, 60_000)
const envioStreamRefreshIntervalMs = Math.min(Math.max(rawEnvioStreamRefreshMs, 5_000), 600_000)

const openRouterBaseUrl = process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'
// ⚠️ CRITICAL: Do NOT change this model unless explicitly requested by user!
// Using free tier model to avoid billing issues
const openRouterModel = process.env.OPENROUTER_MODEL ?? 'mistralai/mistral-small-3.2-24b-instruct:free'
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

/**
 * Decrypt deployer private key
 * Supports two formats:
 * 1. DEPLOYER_PRIVATE_KEY_ENCRYPTED (iv:encrypted format) - RECOMMENDED
 * 2. DEPLOYER_PRIVATE_KEY (plaintext) - Legacy, insecure
 */
function getDeployerPrivateKey(): string {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED
  const masterPassword = process.env.MASTER_ENCRYPTION_PASSWORD

  // Method 1: Encrypted key with encryption.ts format (iv:encrypted)
  if (encryptedKey && masterPassword) {
    try {
      const crypto = require('crypto')
      const ALGORITHM = 'aes-256-cbc'
      const SALT = 'aicetro-ai-agent-salt-v1'

      const [ivHex, encrypted] = encryptedKey.split(':')
      if (!ivHex || !encrypted) {
        throw new Error('Invalid encrypted key format (expected iv:encrypted)')
      }

      const iv = Buffer.from(ivHex, 'hex')
      const key = crypto.scryptSync(masterPassword, SALT, 32)
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      const privateKey = '0x' + decrypted
      console.log('[env] ✅ Deployer private key decrypted (encryption.ts format)')
      return privateKey
    } catch (error) {
      console.error('[env] ❌ Failed to decrypt deployer key:', error instanceof Error ? error.message : error)
      throw new Error('Failed to decrypt deployer private key')
    }
  }

  // Method 2: Plaintext key (fallback, insecure)
  const plainKey = process.env.DEPLOYER_PRIVATE_KEY
  if (plainKey) {
    console.warn('[env] ⚠️ Using PLAINTEXT deployer key! Use DEPLOYER_PRIVATE_KEY_ENCRYPTED instead!')
    return plainKey
  }

  throw new Error('No deployer private key found (set DEPLOYER_PRIVATE_KEY_ENCRYPTED or DEPLOYER_PRIVATE_KEY)')
}

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
  deployerPrivateKey: getDeployerPrivateKey(),
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
  alertCooldownMinutes,
  
  // Alchemy Configuration (Monad Testnet)
  alchemyApiKey: process.env.ALCHEMY_API_KEY ?? '',
  alchemyGasPolicyId: process.env.ALCHEMY_GAS_POLICY_ID ?? '',
  alchemyAccessToken: process.env.ALCHEMY_ACCESS_TOKEN ?? '',
  
  // ERC-4337 Bundler (Alchemy for Monad)
  bundlerUrl: process.env.BUNDLER_URL ?? 
    `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  bundlerApiKey: process.env.BUNDLER_API_KEY ?? process.env.ALCHEMY_API_KEY ?? '',
  paymasterUrl: process.env.PAYMASTER_URL ?? process.env.BUNDLER_URL ?? 
    `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
  
  // Protocol Addresses (Monad Testnet)  
  aavePoolAddress: process.env.AAVE_POOL_ADDRESS ?? '0x1111111111111111111111111111111111111111',
  yearnRouterAddress: process.env.YEARN_ROUTER_ADDRESS ?? '0x2222222222222222222222222222222222222220',
  nablaRouterAddress: process.env.NABLA_ROUTER_ADDRESS ?? '0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426',
  usdcAddress: process.env.USDC_ADDRESS ?? '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  usdtAddress: process.env.USDT_ADDRESS ?? '0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149',
  daiAddress: process.env.DAI_ADDRESS ?? '0x0000000000000000000000000000000000000000',
  
  // REMOVED: AI_AGENT_PRIVATE_KEY (security issue - custodial model)
  // Instead: Each user gets unique AI agent address via deterministic derivation
  // User signs delegation, AI executes via DelegationManager
  
  // AI Agent Key Encryption (MVP Solution)
  // ⚠️ CRITICAL: Master password for encrypting AI agent private keys
  // For production: migrate to KMS (AWS KMS, Google Cloud KMS) or HSM
  masterEncryptionPassword: process.env.MASTER_ENCRYPTION_PASSWORD || '',
  
  // Virtual Portfolio
  virtualPortfolioMonthlyYieldPercent: parsePositiveFloat(process.env.VIRTUAL_PORTFOLIO_MONTHLY_YIELD_PERCENT, 1.0)
}
