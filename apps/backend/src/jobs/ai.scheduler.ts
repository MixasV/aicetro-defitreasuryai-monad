import type {
  AISchedulerAccountResult,
  AISchedulerRunSummary,
  AISchedulerStatus,
  AISchedulerTrigger
} from '@defitreasuryai/types'
import { logger } from '../config/logger'
import { aiExecutionService as aiExecutor } from '../services/ai/ai.executor'
import { aiExecutionService as autoExecutor } from '../services/ai/ai.execution.service'
import { blockchainService } from '../services/blockchain/blockchain.service'
import { prisma } from '../lib/prisma'

export class AIScheduler {
  private handle: NodeJS.Timeout | null = null
  private running = false
  private enabled = false
  private lastRunAt: Date | null = null
  private lastDurationMs: number | null = null
  private lastError: string | null = null
  private lastSummary: AISchedulerRunSummary | null = null

  constructor (private readonly intervalMs: number) {}

  getStatus (): AISchedulerStatus {
    return {
      enabled: this.enabled,
      running: this.running,
      intervalMs: this.intervalMs,
      lastRunAt: this.lastRunAt?.toISOString(),
      lastDurationMs: this.lastDurationMs ?? undefined,
      lastError: this.lastError ?? undefined,
      lastSummary: this.lastSummary ?? undefined
    }
  }

  async runOnce (source: AISchedulerTrigger = 'manual'): Promise<AISchedulerRunSummary | null> {
    return await this.runCycle(source)
  }

  start (): boolean {
    if (this.enabled) {
      logger.info('AI scheduler already running, skipping start.')
      return false
    }

    this.enabled = true
    this.handle = setInterval(() => {
      void this.runCycle('automatic')
      void this.runAutoExecutionCycle()
    }, this.intervalMs)

    if (typeof this.handle.unref === 'function') {
      this.handle.unref()
    }

    void this.runCycle('automatic')
    void this.runAutoExecutionCycle()
    logger.info({ interval: this.intervalMs }, 'AI execution scheduler started (with auto-execution).')
    return true
  }

  /**
   * Run auto-execution cycle for all eligible accounts
   */
  private async runAutoExecutionCycle (): Promise<void> {
    logger.info('Starting auto-execution cycle')
    
    try {
      // Find all accounts with auto-execution enabled
      const accounts = await prisma.corporateAccount.findMany({
        include: {
          delegations: {
            where: {
              active: true,
              autoExecutionEnabled: true
            }
          }
        }
      })

      logger.info({ accountCount: accounts.length }, 'Found accounts for auto-execution')

      let successCount = 0
      let failureCount = 0

      // Execute for each account
      for (const account of accounts) {
        if (account.delegations.length === 0) continue

        try {
          const result = await autoExecutor.executeAutoStrategy(account.address)
          
          if (result.success) {
            logger.info({ 
              account: account.address, 
              executionId: result.execution?.id 
            }, 'Auto-execution successful')
            successCount++
          } else {
            logger.debug({ 
              account: account.address, 
              reason: result.reason 
            }, 'Auto-execution skipped')
            failureCount++
          }
        } catch (error) {
          logger.error({ err: error, account: account.address }, 'Auto-execution failed')
          failureCount++
        }
      }

      logger.info({ 
        successCount, 
        failureCount, 
        totalAccounts: accounts.length 
      }, 'Auto-execution cycle completed')
    } catch (error) {
      logger.error({ err: error }, 'Auto-execution cycle failed')
    }
  }

  stop (): boolean {
    if (!this.enabled) {
      logger.info('AI scheduler already stopped, skipping.')
      return false
    }

    if (this.handle != null) {
      clearInterval(this.handle)
      this.handle = null
    }

    this.enabled = false
    logger.info('AI execution scheduler stopped.')
    return true
  }

  private async runCycle (source: AISchedulerTrigger): Promise<AISchedulerRunSummary | null> {
    if (this.running) {
      const message = 'AI scheduler iteration already running.'
      if (source === 'manual') {
        throw new Error(message)
      }

      logger.warn(message)
      return null
    }

    this.running = true
    const startedAt = new Date()
    const results: AISchedulerAccountResult[] = []
    let errorCount = 0
    let summary: AISchedulerRunSummary | null = null

    try {
      const accounts = await blockchainService.listCorporateAccounts()

      for (const account of accounts) {
        try {
          const delegation = await blockchainService.getDelegationState(account.address)
          const executionResult = await aiExecutor.execute({
            account: account.address,
            delegate: delegation.delegate
          })

          results.push({
            account: account.address,
            delegate: delegation.delegate,
            status: 'success',
            executedUsd: executionResult.totalExecutedUsd,
            remainingDailyLimitUsd: executionResult.remainingDailyLimitUsd,
            summary: executionResult.summary
          })

          logger.info({
            account: account.address,
            delegate: delegation.delegate,
            executed: executionResult.totalExecutedUsd,
            remainingLimit: executionResult.remainingDailyLimitUsd
          }, 'AI scheduler завершил итерацию для аккаунта.')
        } catch (accountError) {
          errorCount += 1
          const errorMessage = accountError instanceof Error ? accountError.message : 'Unknown scheduler error'

          results.push({
            account: account.address,
            delegate: 'unknown',
            status: 'error',
            error: errorMessage
          })

          logger.error({ err: accountError, account: account.address }, 'AI scheduler не смог обработать аккаунт.')
        }
      }
    } catch (error) {
      errorCount += 1
      const errMessage = error instanceof Error ? error.message : 'Unknown scheduler failure'
      this.lastError = errMessage
      logger.error({ err: error }, 'AI scheduler iteration failed')
    } finally {
      const finishedAt = new Date()
      const durationMs = finishedAt.getTime() - startedAt.getTime()
      const successCount = results.filter((result) => result.status === 'success').length
      summary = {
        source,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs,
        processedAccounts: results.length,
        successCount,
        errorCount,
        results
      }

      this.lastRunAt = startedAt
      this.lastDurationMs = durationMs
      this.lastSummary = summary
      if (errorCount === 0) {
        this.lastError = null
      } else if (this.lastError == null) {
        this.lastError = 'AI scheduler completed with errors'
      }

      this.running = false
    }

    return summary
  }
}
