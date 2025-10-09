import type { Request, Response } from 'express'
import Joi from 'joi'
import { monitoringService } from '../services/monitoring/monitoring.service'
import {
  monitoringEventBus,
  type MonitoringAlertsEvent,
  type MonitoringProjectionEvent,
  type MonitoringRiskEvent,
  type MonitoringSnapshotEvent,
  type MonitoringProtocolMetricsEvent
} from '../services/monitoring/monitoring.events'
import { monitoringStateService } from '../services/monitoring/monitoring.state'
import { portfolioAnalyticsService } from '../services/monitoring/portfolio.analytics.service'
import { riskService } from '../services/risk/risk.service'
import {
  getMonitoringPollerStatus,
  getMonitoringPollerHistory,
  getMonitoringPollerMetrics,
  runMonitoringPollerOnce,
  startMonitoringPoller,
  stopMonitoringPoller
} from '../services/monitoring/monitoring.poller.manager'
import {
  getMonitoringStreamStatus,
  startMonitoringStream,
  stopMonitoringStream
} from '../services/monitoring/monitoring.stream.manager'

const addressSchema = Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required()

export const getPortfolioSnapshotHandler = async (req: Request, res: Response) => {
  try {
    const address = await addressSchema.validateAsync(req.params.address, { abortEarly: false })
    const snapshot = await monitoringService.getPortfolioSnapshot(address)
    res.json(snapshot)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Не удалось получить данные портфеля' })
  }
}

export const getRiskAlertsHandler = async (req: Request, res: Response) => {
  try {
    const address = await addressSchema.validateAsync(req.params.address, { abortEarly: false })
    const alerts = await monitoringService.getRiskAlerts(address)
    res.json(alerts)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Не удалось получить риск-алерты' })
  }
}

export const getRiskInsightsHandler = async (req: Request, res: Response) => {
  try {
    const address = await addressSchema.validateAsync(req.params.address, { abortEarly: false })
    const insights = await riskService.getRiskInsights(address)
    res.json(insights)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Не удалось рассчитать риск-профиль' })
  }
}

export const getProtocolMetricsHandler = async (_req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getProtocolMetrics()
    res.json(metrics)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Не удалось получить метрики протоколов' })
  }
}

export const getPortfolioProjectionHandler = async (req: Request, res: Response) => {
  try {
    const address = await addressSchema.validateAsync(req.params.address, { abortEarly: false })
    const projection = await portfolioAnalyticsService.buildProjection(address)
    res.json(projection)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Не удалось построить проекцию портфеля' })
  }
}

export const monitoringStreamHandler = async (req: Request, res: Response) => {
  const rawAccount = req.params.account
  let account: string | undefined

  try {
    if (rawAccount != null) {
      account = await addressSchema.validateAsync(rawAccount, { abortEarly: false })
    }
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Не удалось открыть поток событий мониторинга' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const normalizedAccount = account?.toLowerCase()

  const sendEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(payload)}\n\n`)
  }

  const snapshotListener = (payload: MonitoringSnapshotEvent) => {
    if (normalizedAccount == null || payload.account === normalizedAccount) {
      sendEvent('snapshot', payload)
    }
  }

  const alertsListener = (payload: MonitoringAlertsEvent) => {
    if (normalizedAccount == null || payload.account === normalizedAccount) {
      sendEvent('alerts', payload)
    }
  }

  const riskListener = (payload: MonitoringRiskEvent) => {
    if (normalizedAccount == null || payload.account === normalizedAccount) {
      sendEvent('risk', payload)
    }
  }

  const projectionListener = (payload: MonitoringProjectionEvent) => {
    if (normalizedAccount == null || payload.account === normalizedAccount) {
      sendEvent('projection', payload)
    }
  }

  const protocolMetricsListener = (payload: MonitoringProtocolMetricsEvent) => {
    sendEvent('protocol-metrics', payload)
  }

  monitoringEventBus.on('snapshot', snapshotListener)
  monitoringEventBus.on('alerts', alertsListener)
  monitoringEventBus.on('risk', riskListener)
  monitoringEventBus.on('projection', projectionListener)
  monitoringEventBus.on('protocol-metrics', protocolMetricsListener)

  try {
    if (normalizedAccount != null) {
      const snapshot = monitoringStateService.getSnapshot(normalizedAccount)
      if (snapshot != null) {
        sendEvent('snapshot', snapshot)
      }

      const alerts = monitoringStateService.getAlerts(normalizedAccount)
      if (alerts != null) {
        sendEvent('alerts', alerts)
      }

      const risk = monitoringStateService.getRisk(normalizedAccount)
      if (risk != null) {
        sendEvent('risk', risk)
      }

      const projection = monitoringStateService.getProjection(normalizedAccount)
      if (projection != null) {
        sendEvent('projection', projection)
      }

      const protocols = monitoringStateService.getProtocolMetrics('monad')
      if (protocols != null) {
        sendEvent('protocol-metrics', protocols)
      }
    } else {
      const snapshots = monitoringStateService.listSnapshots()
      if (snapshots.length > 0) {
        sendEvent('snapshot-batch', snapshots)
      }

      const alerts = monitoringStateService.listAlerts()
      if (alerts.length > 0) {
        sendEvent('alerts-batch', alerts)
      }

      const risks = monitoringStateService.listRisks()
      if (risks.length > 0) {
        sendEvent('risk-batch', risks)
      }

      const projections = monitoringStateService.listProjections()
      if (projections.length > 0) {
        sendEvent('projection-batch', projections)
      }

      const protocols = monitoringStateService.listProtocolMetrics()
      if (protocols.length > 0) {
        sendEvent('protocol-metrics-batch', protocols)
      }
    }
  } catch (error) {
    console.error(error)
  }

  const heartbeat = setInterval(() => {
    sendEvent('heartbeat', { ts: Date.now() })
  }, 25_000)

  const cleanup = () => {
    clearInterval(heartbeat)
    monitoringEventBus.off('snapshot', snapshotListener)
    monitoringEventBus.off('alerts', alertsListener)
    monitoringEventBus.off('risk', riskListener)
    monitoringEventBus.off('projection', projectionListener)
    monitoringEventBus.off('protocol-metrics', protocolMetricsListener)
    res.end()
  }

  req.on('close', cleanup)
  req.on('error', cleanup)
}

export const getMonitoringPollerStatusHandler = (_req: Request, res: Response) => {
  res.json(getMonitoringPollerStatus())
}

export const getMonitoringPollerHistoryHandler = (req: Request, res: Response) => {
  const { limit: limitParam } = req.query

  if (typeof limitParam === 'string') {
    const parsed = Number.parseInt(limitParam, 10)
    if (Number.isNaN(parsed) || parsed <= 0) {
      res.status(400).json({ message: 'Некорректное значение limit' })
      return
    }

    const limited = Math.min(parsed, 50)
    res.json({ summaries: getMonitoringPollerHistory(limited) })
    return
  }

  res.json({ summaries: getMonitoringPollerHistory() })
}

export const getMonitoringPollerMetricsHandler = (_req: Request, res: Response) => {
  res.json(getMonitoringPollerMetrics())
}

export const startMonitoringPollerHandler = (_req: Request, res: Response) => {
  const started = startMonitoringPoller()
  res.status(200).json({
    started,
    status: getMonitoringPollerStatus()
  })
}

export const stopMonitoringPollerHandler = (_req: Request, res: Response) => {
  const stopped = stopMonitoringPoller()
  res.status(200).json({
    stopped,
    status: getMonitoringPollerStatus()
  })
}

export const runMonitoringPollerOnceHandler = async (_req: Request, res: Response) => {
  try {
    const summary = await runMonitoringPollerOnce()
    if (summary == null) {
      res.status(202).json({
        message: 'Запуск пропущен: предыдущая итерация мониторинга ещё выполняется.',
        status: getMonitoringPollerStatus()
      })
      return
    }

    res.json({
      summary,
      status: getMonitoringPollerStatus()
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('уже выполняется')) {
      res.status(409).json({ message: error.message, status: getMonitoringPollerStatus() })
      return
    }

    console.error(error)
    res.status(500).json({ message: 'Не удалось выполнить мониторинговый poller вручную', status: getMonitoringPollerStatus() })
  }
}

export const getMonitoringStreamStatusHandler = (_req: Request, res: Response) => {
  res.json(getMonitoringStreamStatus())
}

export const startMonitoringStreamHandler = async (_req: Request, res: Response) => {
  const started = await startMonitoringStream()
  res.status(200).json({
    started,
    status: getMonitoringStreamStatus()
  })
}

export const stopMonitoringStreamHandler = async (_req: Request, res: Response) => {
  const stopped = await stopMonitoringStream()
  res.status(200).json({
    stopped,
    status: getMonitoringStreamStatus()
  })
}
