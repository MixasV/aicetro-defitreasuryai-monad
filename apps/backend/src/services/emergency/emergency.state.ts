import type { EmergencyStatus, EmergencyStatusMetadata, EmergencyState } from '../../types/ai.js'
import { emergencyEventBus } from './emergency.events.js'
import { emergencyControllerClient } from './emergency.controller.client'
import { logger } from '../../config/logger'

const DEFAULT_STATE: EmergencyState = 'active'

class EmergencyStateService {
  private readonly states = new Map<string, EmergencyStatus>()

  getStatus (account: string): EmergencyStatus {
    const key = this.normalizeAccount(account)
    const existing = this.states.get(key)
    if (existing != null) {
      return existing
    }

    const fallback = this.buildStatus(key, DEFAULT_STATE)
    this.states.set(key, fallback)
    return fallback
  }

  setPaused (account: string, metadata?: EmergencyStatusMetadata): EmergencyStatus {
    const key = this.normalizeAccount(account)
    const previous = this.states.get(key)
    const metadataToUse = metadata ?? previous?.metadata

    if (previous?.state === 'paused' && metadataEquals(previous.metadata, metadataToUse)) {
      return previous
    }

    const status = this.buildStatus(key, 'paused', metadataToUse)
    this.states.set(key, status)
    emergencyEventBus.emit('status', status)
    return status
  }

  setActive (account: string, metadata?: EmergencyStatusMetadata): EmergencyStatus {
    const key = this.normalizeAccount(account)
    const previous = this.states.get(key)
    const metadataToUse = metadata ?? previous?.metadata

    if (previous?.state === 'active' && metadataEquals(previous.metadata, metadataToUse)) {
      return previous
    }

    const status = this.buildStatus(key, 'active', metadataToUse)
    this.states.set(key, status)
    emergencyEventBus.emit('status', status)
    return status
  }

  async syncWithController (account: string): Promise<EmergencyStatus> {
    const key = this.normalizeAccount(account)
    const config = emergencyControllerClient.getConfigurationStatus()

    if (!config.configured) {
      return this.getStatus(key)
    }

    try {
      const controller = await emergencyControllerClient.getStatus()
      if (controller == null) {
        return this.getStatus(key)
      }

      if (controller.paused) {
        return this.setPaused(key)
      }

      return this.setActive(key)
    } catch (error) {
      logger.warn({ err: error }, 'Failed to synchronize emergency status from controller')
      return this.getStatus(key)
    }
  }

  private buildStatus (account: string, state: EmergencyState, metadata?: EmergencyStatusMetadata): EmergencyStatus {
    return {
      account,
      state,
      updatedAt: new Date().toISOString(),
      metadata: metadata != null && Object.keys(metadata).length > 0 ? metadata : undefined
    }
  }

  private normalizeAccount (account: string): string {
    return account.trim().toLowerCase()
  }
}

const metadataEquals = (
  previous?: EmergencyStatusMetadata,
  next?: EmergencyStatusMetadata
): boolean => {
  if (previous == null && next == null) return true
  if (previous == null || next == null) return false
  const prevKeys = Object.keys(previous)
  const nextKeys = Object.keys(next)
  if (prevKeys.length !== nextKeys.length) return false

  return prevKeys.every((key) => (previous as Record<string, unknown>)[key] === (next as Record<string, unknown>)[key])
}

export const emergencyStateService = new EmergencyStateService()
