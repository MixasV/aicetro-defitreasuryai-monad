import { poolDiscoveryService } from '../services/pools/pool-discovery.service'
import { logger } from '../config/logger'

/**
 * Hourly Snapshot Scheduler
 * 
 * Creates 1 snapshot/hour for each mainnet pool
 * Processes pools in batches over 60 minutes to spread load
 * 
 * Schedule: Runs every minute, determines batch based on current minute
 * Total: ~86 pools/minute × 60 minutes = ~5,165 pools/hour
 * Storage: 24 snapshots/day/pool × 5,165 pools = 124K snapshots/day (~6.25MB)
 * 
 * Cleanup: Deletes snapshots >30 days old once per day at 3:00 AM
 */
export class SnapshotScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private cleanupIntervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private lastCleanupDate: string | null = null
  
  /**
   * Start the scheduler (runs every minute)
   */
  start() {
    if (this.intervalId) {
      logger.warn('[SnapshotScheduler] Already running')
      return
    }
    
    logger.info('[SnapshotScheduler] Starting (runs every minute)')
    
    // Run immediately on start
    this.runBatch()
    
    // Then run every minute
    this.intervalId = setInterval(() => {
      this.runBatch()
    }, 60 * 1000) // 1 minute
    
    // Start cleanup checker (runs every hour, executes at 3:00 AM)
    this.startCleanupChecker()
  }
  
  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId)
      this.cleanupIntervalId = null
    }
    logger.info('[SnapshotScheduler] Stopped')
  }
  
  /**
   * Run one batch (called every minute)
   */
  private async runBatch() {
    if (this.isRunning) {
      logger.warn('[SnapshotScheduler] Previous batch still running, skipping')
      return
    }
    
    this.isRunning = true
    const startTime = Date.now()
    
    try {
      const result = await poolDiscoveryService.createHourlySnapshot()
      const duration = Date.now() - startTime
      
      logger.info({
        created: result.created,
        errors: result.errors,
        durationMs: duration
      }, '[SnapshotScheduler] Batch completed')
      
    } catch (error) {
      logger.error({ error }, '[SnapshotScheduler] Batch failed')
    } finally {
      this.isRunning = false
    }
  }
  
  /**
   * Start cleanup checker (runs every hour, executes at 3:00 AM)
   */
  private startCleanupChecker() {
    logger.info('[SnapshotScheduler] Starting cleanup checker (daily at 3:00 AM)')
    
    // Check every hour if it's time to cleanup
    this.cleanupIntervalId = setInterval(() => {
      const now = new Date()
      const currentHour = now.getHours()
      const currentDate = now.toISOString().split('T')[0]
      
      // Run at 3:00 AM, once per day
      if (currentHour === 3 && this.lastCleanupDate !== currentDate) {
        this.runCleanup()
        this.lastCleanupDate = currentDate
      }
    }, 60 * 60 * 1000) // Check every hour
  }
  
  /**
   * Run cleanup (delete snapshots >30 days old)
   */
  private async runCleanup() {
    logger.info('[SnapshotScheduler] Running daily cleanup')
    
    try {
      const result = await poolDiscoveryService.cleanupOldSnapshots()
      
      logger.info({
        deleted: result.deleted
      }, '[SnapshotScheduler] Cleanup completed')
      
    } catch (error) {
      logger.error({ error }, '[SnapshotScheduler] Cleanup failed')
    }
  }
  
  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      running: this.intervalId !== null,
      processing: this.isRunning,
      cleanupEnabled: this.cleanupIntervalId !== null,
      lastCleanupDate: this.lastCleanupDate
    }
  }
}

// Singleton instance
export const snapshotScheduler = new SnapshotScheduler()
