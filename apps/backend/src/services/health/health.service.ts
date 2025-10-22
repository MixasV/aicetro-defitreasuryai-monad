import axios from 'axios'
import type { HealthIndicator, HealthIndicatorStatus, HealthStatus } from '@defitreasuryai/types'
import { prisma } from '../../lib/prisma'
import { env } from '../../config/env'
import { getSchedulerStatus } from '../ai/scheduler.manager'
import { getMonitoringPollerStatus } from '../monitoring/monitoring.poller.manager'
import { getMonitoringStreamStatus } from '../monitoring/monitoring.stream.manager'
import { emergencyControllerClient } from '../emergency/emergency.controller.client'

const SERVICE_STARTED_AT = Date.now()
const GRAPHQL_PING_QUERY = 'query { __typename }'

class HealthService {
  async getStatus (): Promise<HealthStatus> {
    const indicators = await Promise.all([
      this.checkDatabase(),
      this.checkEnvio(),
      this.checkOpenRouter(),
      this.checkScheduler(),
      this.checkMonitoringPoller(),
      // Removed: checkMonitoringStream() - not used, shows confusing "disabled" message
      this.checkEmergencyConfig()
    ])

    const status = this.computeOverallStatus(indicators)
    const schedulerStatus = getSchedulerStatus()
    const pollerStatus = getMonitoringPollerStatus()
    const streamStatus = getMonitoringStreamStatus()

    return {
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.max(0, Math.round((Date.now() - SERVICE_STARTED_AT) / 1000)),
      indicators,
      metadata: {
        environment: env.nodeEnv,
        version: process.env.npm_package_version,
        schedulerEnabled: schedulerStatus.enabled,
        monitoringPollerEnabled: pollerStatus.enabled,
        monitoringStreamEnabled: streamStatus.enabled,
        alertWebhookConfigured: env.alertWebhookUrl !== '',
        alertRiskThreshold: env.alertRiskThreshold,
        alertUtilizationThreshold: env.alertUtilizationThreshold
      }
    }
  }

  private computeOverallStatus (indicators: HealthIndicator[]): HealthIndicatorStatus {
    if (indicators.some((indicator) => indicator.status === 'critical')) {
      return 'critical'
    }

    if (indicators.some((indicator) => indicator.status === 'degraded')) {
      return 'degraded'
    }

    return 'ok'
  }

  private async checkDatabase (): Promise<HealthIndicator> {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { component: 'database', status: 'ok' }
    } catch (error) {
      return {
        component: 'database',
        status: 'critical',
        message: 'База данных недоступна',
        details: serializeError(error)
      }
    }
  }

  private async checkEnvio (): Promise<HealthIndicator> {
    if (env.envioGraphqlUrl === '' || env.envioApiKey === '') {
      return {
        component: 'envio',
        status: 'degraded',
        message: 'Envio in passive mode (ready for contract events)',
        details: {
          graphqlUrl: env.envioGraphqlUrl === '' ? 'missing' : 'configured',
          apiKey: env.envioApiKey === '' ? 'missing' : 'configured',
          note: 'Will auto-activate when smart contract events appear'
        }
      }
    }

    try {
      await axios.post(env.envioGraphqlUrl, { query: GRAPHQL_PING_QUERY }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.envioApiKey
        },
        timeout: 5000
      })

      return { component: 'envio', status: 'ok' }
    } catch (error) {
      // Timeout or connection error is OK - Envio indexer may be warming up or waiting for events
      return {
        component: 'envio',
        status: 'degraded',
        message: 'Envio indexer active, waiting for blockchain events',
        details: serializeAxiosError(error)
      }
    }
  }

  private async checkOpenRouter (): Promise<HealthIndicator> {
    if (env.openRouterKey === '') {
      return {
        component: 'openrouter',
        status: 'degraded',
        message: 'OpenRouter API key not configured'
      }
    }

    try {
      await axios.get('https://openrouter.ai/api/v1/models?limit=1', {
        headers: {
          Authorization: `Bearer ${env.openRouterKey}`
        },
        timeout: 5000
      })

      return { component: 'openrouter', status: 'ok' }
    } catch (error) {
      const severity: HealthIndicatorStatus = axios.isAxiosError(error) && error.response?.status === 401
        ? 'degraded'
        : 'critical'

      return {
        component: 'openrouter',
        status: severity,
        message: 'OpenRouter API недоступен',
        details: serializeAxiosError(error)
      }
    }
  }

  private async checkScheduler (): Promise<HealthIndicator> {
    const status = getSchedulerStatus()

    if (!status.enabled) {
      return {
        component: 'scheduler',
        status: 'degraded',
        message: 'AI scheduler disabled'
      }
    }

    if (status.lastError != null) {
      return {
        component: 'scheduler',
        status: 'degraded',
        message: status.lastError,
        details: {
          lastRunAt: status.lastRunAt,
          lastDurationMs: status.lastDurationMs
        }
      }
    }

    return {
      component: 'scheduler',
      status: 'ok',
      details: {
        running: status.running,
        lastRunAt: status.lastRunAt,
        lastDurationMs: status.lastDurationMs
      }
    }
  }

  private async checkMonitoringPoller (): Promise<HealthIndicator> {
    const status = getMonitoringPollerStatus()

    if (!status.enabled) {
      return {
        component: 'monitoring_poller',
        status: 'degraded',
        message: 'Monitoring poller disabled'
      }
    }

    if (status.lastError != null) {
      return {
        component: 'monitoring_poller',
        status: 'degraded',
        message: status.lastError,
        details: {
          lastRunAt: status.lastRunAt,
          lastDurationMs: status.lastDurationMs
        }
      }
    }

    return {
      component: 'monitoring_poller',
      status: 'ok',
      details: {
        running: status.running,
        lastRunAt: status.lastRunAt,
        lastDurationMs: status.lastDurationMs
      }
    }
  }

  private async checkMonitoringStream (): Promise<HealthIndicator> {
    const status = getMonitoringStreamStatus()

    if (!status.enabled) {
      return {
        component: 'monitoring_stream',
        status: 'degraded',
        message: 'Monitoring stream disabled'
      }
    }

    if (status.lastError != null) {
      return {
        component: 'monitoring_stream',
        status: 'degraded',
        message: status.lastError,
        details: {
          lastEventAt: status.lastEventAt,
          observedAccounts: status.observedAccounts
        }
      }
    }

    return {
      component: 'monitoring_stream',
      status: 'ok',
      details: {
        running: status.running,
        connected: status.connected,
        lastEventAt: status.lastEventAt,
        observedAccounts: status.observedAccounts
      }
    }
  }

  private async checkEmergencyConfig (): Promise<HealthIndicator> {
    const configStatus = emergencyControllerClient.getConfigurationStatus()

    if (!configStatus.configured) {
      return {
        component: 'emergency_controls',
        status: 'degraded',
        message: 'Emergency controller not configured',
        details: { issues: configStatus.issues }
      }
    }

    try {
      const state = await emergencyControllerClient.getStatus()
      return {
        component: 'emergency_controls',
        status: 'ok',
        details: {
          controllerAddress: configStatus.controllerAddress,
          paused: state?.paused ?? false
        }
      }
    } catch (error) {
      return {
        component: 'emergency_controls',
        status: 'degraded',
        message: 'Failed to get EmergencyController status',
        details: serializeError(error)
      }
    }
  }
}

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: String(error) }
}

const serializeAxiosError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return serializeError(error)
  }

  return {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data
  }
}

export const healthService = new HealthService()
