import type { AISchedulerRunSummary, AISchedulerStatus } from '@defitreasuryai/types'
import { env } from '../../config/env'
import { AIScheduler } from '../../jobs/ai.scheduler'

const scheduler = new AIScheduler(env.aiExecutionIntervalMs)

export const initializeScheduler = (): void => {
  if (env.aiExecutionEnabled) {
    scheduler.start()
  }
}

export const shutdownScheduler = (): void => {
  scheduler.stop()
}

export const getSchedulerStatus = (): AISchedulerStatus => scheduler.getStatus()

export const startScheduler = (): boolean => scheduler.start()

export const stopScheduler = (): boolean => scheduler.stop()

export const runSchedulerOnce = async (): Promise<AISchedulerRunSummary | null> => await scheduler.runOnce('manual')

export const aiSchedulerInstance = scheduler
