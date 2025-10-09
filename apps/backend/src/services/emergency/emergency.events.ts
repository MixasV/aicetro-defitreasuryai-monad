import { EventEmitter } from 'node:events'
import type { EmergencyLogEntry, EmergencyStatus } from '../../types/ai.js'

interface EmergencyEventMap {
  status: EmergencyStatus
  log: EmergencyLogEntry
}

class EmergencyEventBus extends EventEmitter {
  emit<K extends keyof EmergencyEventMap>(event: K, payload: EmergencyEventMap[K]): boolean {
    return super.emit(event, payload)
  }

  on<K extends keyof EmergencyEventMap>(event: K, listener: (payload: EmergencyEventMap[K]) => void): this {
    return super.on(event, listener)
  }

  off<K extends keyof EmergencyEventMap>(event: K, listener: (payload: EmergencyEventMap[K]) => void): this {
    return super.off(event, listener)
  }
}

export const emergencyEventBus = new EmergencyEventBus()
