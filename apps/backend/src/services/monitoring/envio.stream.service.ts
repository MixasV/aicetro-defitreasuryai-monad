import { HypersyncClient, HexOutput, LogField, type EventStream, type Query, type StreamConfig } from '@envio-dev/hypersync-client'
import type { MonitoringStreamStatus } from '@defitreasuryai/types'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import { blockchainService } from '../blockchain/blockchain.service'
import { monitoringService } from './monitoring.service'
import { riskService } from '../risk/risk.service'
import { portfolioAnalyticsService } from './portfolio.analytics.service'

const STREAM_BACKOFF_BASE_MS = 1_000
const STREAM_BACKOFF_MAX_MS = 15_000

type StreamAddressMap = Map<string, string>
type StreamResponse = Awaited<ReturnType<EventStream['recv']>>

const STREAM_ABORTED = Symbol('envio-stream-aborted')

export class EnvioStreamService {
  private client: HypersyncClient | null = null
  private stream: EventStream | null = null
  private enabled = false
  private running = false
  private reconnectAttempts = 0
  private lastError: string | null = null
  private lastEventAt: Date | null = null
  private lastAccountRefreshAt = 0
  private readonly observedAccounts: StreamAddressMap = new Map()
  private initialPrimed = false
  private loopPromise: Promise<void> | null = null
  private abortController: AbortController | null = null

  getStatus (): MonitoringStreamStatus {
    const status: MonitoringStreamStatus = {
      enabled: this.enabled,
      running: this.running,
      connected: this.stream != null,
      observedAccounts: this.observedAccounts.size
    }

    if (this.lastEventAt != null) {
      status.lastEventAt = this.lastEventAt.toISOString()
    }

    if (this.lastError != null) {
      status.lastError = this.lastError
    }

    return status
  }

  async start (): Promise<boolean> {
    if (this.enabled) {
      logger.info('Envio stream already running, skipping start.')
      return false
    }

    if (!this.isConfigured()) {
      this.lastError = 'Envio stream not configured'
      logger.warn('Envio stream not configured, cannot start.')
      return false
    }

    this.enabled = true

    if (this.loopPromise == null) {
      this.running = true
      this.abortController = new AbortController()
      const signal = this.abortController.signal
      this.loopPromise = this.runLoop(signal)
        .catch((error) => {
          if (signal.aborted) {
            return
          }
          logger.error({ err: error }, 'Envio stream loop finished with error')
        })
        .finally(() => {
          this.running = false
          this.loopPromise = null
          this.abortController = null
        })
    }

    logger.info('Envio stream started.')
    return true
  }

  async stop (): Promise<boolean> {
    if (!this.enabled && this.loopPromise == null) {
      logger.info('Envio stream already stopped, skipping.')
      return false
    }

    this.enabled = false

    if (this.abortController != null) {
      this.abortController.abort()
    }

    await this.closeStream()

    if (this.loopPromise != null) {
      try {
        await this.loopPromise
      } catch (error) {
        logger.warn({ err: error }, 'Envio stream loop finished with error during stop')
      }
    }

    this.client = null
    this.reconnectAttempts = 0
    this.observedAccounts.clear()
    this.initialPrimed = false
    logger.info('Envio stream stopped.')
    return true
  }

  private async runLoop (signal: AbortSignal): Promise<void> {
    while (this.enabled && !signal.aborted) {
      try {
        await this.refreshAccounts(signal)

        if (!this.enabled || signal.aborted) {
          break
        }

        if (this.observedAccounts.size === 0) {
          this.lastError = 'No corporate accounts to monitor'
          await this.delay(env.envioStreamRefreshIntervalMs, signal)
          continue
        }

        if (!this.initialPrimed) {
          await this.refreshAccountData(new Set(this.observedAccounts.values()), signal)
          if (!this.enabled || signal.aborted) {
            break
          }
          this.initialPrimed = true
        }

        await this.ensureStream(signal)

        if (!this.enabled || signal.aborted) {
          break
        }

        const response = await this.receiveFromStream(signal)

        if (!this.enabled || signal.aborted || response === STREAM_ABORTED) {
          break
        }

        if (response == null) {
          await this.resetStream('Stream closed by remote side')
          this.reconnectAttempts += 1
          const backoffDelay = Math.min(STREAM_BACKOFF_BASE_MS * this.reconnectAttempts, STREAM_BACKOFF_MAX_MS)
          await this.delay(backoffDelay, signal)
          continue
        }

        this.lastError = null
        this.reconnectAttempts = 0

        if (response.data.length === 0) {
          await this.delay(100, signal)
          continue
        }

        this.lastEventAt = new Date()
        const accountsToRefresh = new Set<string>()

        for (const event of response.data) {
          const address = event.log?.address?.toLowerCase()
          if (address != null && this.observedAccounts.has(address)) {
            accountsToRefresh.add(this.observedAccounts.get(address) ?? address)
          }
        }

        if (accountsToRefresh.size > 0) {
          await this.refreshAccountData(accountsToRefresh, signal)
        }
      } catch (error) {
        if (signal.aborted) {
          break
        }

        this.lastError = extractErrorMessage(error)
        logger.error({ err: error }, 'Envio stream iteration failed')
        await this.resetStream('Error in stream processing')
        const nextDelay = Math.min(STREAM_BACKOFF_BASE_MS * (this.reconnectAttempts + 1), STREAM_BACKOFF_MAX_MS)
        this.reconnectAttempts += 1
        await this.delay(nextDelay, signal)
      }
    }

    await this.closeStream()
  }

  private async ensureStream (signal: AbortSignal): Promise<void> {
    if (this.stream != null && this.client != null) {
      return
    }

    if (this.client == null) {
      this.client = HypersyncClient.new({
        url: env.envioGraphqlUrl,
        bearerToken: env.envioApiKey,
        enableChecksumAddresses: true
      })
    }

    const query = this.buildQuery()
    const config = this.buildStreamConfig()
    const streamPromise = this.client.streamEvents(query, config)
    const { promise: abortPromise, cleanup } = this.createAbortPromise(signal)

    try {
      const result = await Promise.race([streamPromise, abortPromise])
      if (result === STREAM_ABORTED) {
        return
      }
      this.stream = result
    } finally {
      cleanup()
    }

    this.reconnectAttempts = 0
  }

  private buildQuery (): Query {
    const addresses = [...this.observedAccounts.keys()].map((address) => address.toLowerCase())

    return {
      fromBlock: env.envioStreamStartBlock,
      fieldSelection: {
        log: [
          LogField.Address,
          LogField.BlockNumber,
          LogField.Topic0,
          LogField.TransactionHash
        ]
      },
      logs: addresses.length > 0
        ? addresses.map((address) => ({ address: [address] }))
        : undefined,
      maxNumLogs: 500
    }
  }

  private buildStreamConfig (): StreamConfig {
    return {
      batchSize: 100,
      hexOutput: HexOutput.Prefixed
    }
  }

  private async refreshAccountData (accounts: Set<string>, signal: AbortSignal): Promise<void> {
    if (signal.aborted) {
      return
    }

    await Promise.allSettled(
      [...accounts].map(async (account) => {
        if (signal.aborted) {
          return
        }

        try {
          await monitoringService.getPortfolioSnapshot(account)
        } catch (error) {
          logger.error({ err: error, account }, 'Envio stream: failed to update snapshot')
        }

        if (signal.aborted) {
          return
        }

        try {
          await monitoringService.getRiskAlerts(account)
        } catch (error) {
          logger.error({ err: error, account }, 'Envio stream: failed to update alerts')
        }

        if (signal.aborted) {
          return
        }

        try {
          await riskService.getRiskInsights(account)
        } catch (error) {
          logger.error({ err: error, account }, 'Envio stream: failed to calculate risk insights')
        }

        if (signal.aborted) {
          return
        }

        try {
          await portfolioAnalyticsService.buildProjection(account)
        } catch (error) {
          logger.error({ err: error, account }, 'Envio stream: failed to build projection')
        }
      })
    )
  }

  private async refreshAccounts (signal: AbortSignal): Promise<void> {
    const now = Date.now()
    if (now - this.lastAccountRefreshAt < env.envioStreamRefreshIntervalMs) {
      return
    }

    this.lastAccountRefreshAt = now

    try {
      const accounts = await blockchainService.listCorporateAccounts()

      if (signal.aborted) {
        return
      }

      this.observedAccounts.clear()
      for (const account of accounts) {
        if (signal.aborted) {
          return
        }
        this.observedAccounts.set(account.address.toLowerCase(), account.address)
      }
      this.initialPrimed = false
    } catch (error) {
      this.lastError = extractErrorMessage(error)
      logger.error({ err: error }, 'Envio stream: failed to get corporate accounts list')
    }
  }

  private async resetStream (reason: string): Promise<void> {
    logger.warn({ reason }, 'Envio stream: restarting stream')
    await this.closeStream()
    this.stream = null
    this.client = null
  }

  private async closeStream (): Promise<void> {
    if (this.stream != null) {
      try {
        await this.stream.close()
      } catch (error) {
        logger.warn({ err: error }, 'Envio stream: error closing stream')
      }
    }

    this.stream = null
  }

  private isConfigured (): boolean {
    return env.envioStreamEnabled && env.envioWsUrl !== '' && env.envioApiKey !== ''
  }

  private async receiveFromStream (signal: AbortSignal): Promise<typeof STREAM_ABORTED | StreamResponse | null> {
    if (this.stream == null) {
      return null
    }

    const { promise: abortPromise, cleanup } = this.createAbortPromise(signal)

    try {
      const result = await Promise.race([this.stream.recv(), abortPromise])
      return result
    } finally {
      cleanup()
    }
  }

  private createAbortPromise (signal: AbortSignal): { promise: Promise<typeof STREAM_ABORTED>, cleanup: () => void } {
    if (signal.aborted) {
      return { promise: Promise.resolve(STREAM_ABORTED), cleanup: () => {} }
    }

    let cleanup = () => {}
    const promise = new Promise<typeof STREAM_ABORTED>((resolve) => {
      const onAbort = (): void => {
        signal.removeEventListener('abort', onAbort)
        resolve(STREAM_ABORTED)
      }

      cleanup = () => {
        signal.removeEventListener('abort', onAbort)
      }

      signal.addEventListener('abort', onAbort)
    })

    return { promise, cleanup }
  }

  private async delay (ms: number, signal?: AbortSignal): Promise<void> {
    if (ms <= 0 || (signal?.aborted ?? false)) {
      return
    }

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        if (signal != null) {
          signal.removeEventListener('abort', onAbort)
        }
        resolve()
      }, ms)

      const onAbort = (): void => {
        clearTimeout(timeout)
        if (signal != null) {
          signal.removeEventListener('abort', onAbort)
        }
        resolve()
      }

      if (signal != null) {
        signal.addEventListener('abort', onAbort)
      }
    })
  }
}

const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const envioStreamService = new EnvioStreamService()
