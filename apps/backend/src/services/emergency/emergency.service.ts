import { randomUUID } from 'node:crypto'
import type { EmergencyEventStatus, EmergencyLogEntry } from '../../types/ai.js'
import { emergencyEventBus } from './emergency.events.js'

const MAX_LOG_ENTRIES = 50

class EmergencyLogService {
  private readonly entries: EmergencyLogEntry[] = []

  recordSuccess (account: string, message: string, metadata?: Record<string, unknown>): EmergencyLogEntry {
    return this.record(account, 'success', message, metadata)
  }

  recordFailure (account: string, message: string, metadata?: Record<string, unknown>): EmergencyLogEntry {
    return this.record(account, 'error', message, metadata)
  }

  list (account?: string): EmergencyLogEntry[] {
    if (account == null) {
      return this.entries.slice()
    }

    return this.entries.filter((entry) => entry.account === account.toLowerCase())
  }

  private record (
    account: string,
    status: EmergencyEventStatus,
    message: string,
    metadata?: Record<string, unknown>
  ): EmergencyLogEntry {
    const entry: EmergencyLogEntry = {
      id: randomUUID(),
      account: account.toLowerCase(),
      status,
      message,
      metadata,
      createdAt: new Date().toISOString()
    }

    this.entries.unshift(entry)

    if (this.entries.length > MAX_LOG_ENTRIES) {
      this.entries.splice(MAX_LOG_ENTRIES)
    }

    emergencyEventBus.emit('log', entry)
    return entry
  }
}

export const emergencyLogService = new EmergencyLogService()
