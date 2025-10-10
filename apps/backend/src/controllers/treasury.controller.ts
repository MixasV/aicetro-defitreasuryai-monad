import type { Request, Response } from 'express'
import Joi from 'joi'
import { blockchainService } from '../services/blockchain/blockchain.service'
import { emergencyEventBus } from '../services/emergency/emergency.events'
import { emergencyLogService } from '../services/emergency/emergency.service'
import { emergencyStateService } from '../services/emergency/emergency.state'
import { securityDashboardService } from '../services/security/security-dashboard.service'
import type {
  EmergencyActionResponse,
  EmergencyLogEntry,
  EmergencyStatus,
  EmergencyStopMode
} from '../types/ai.js'

interface CreateCorporateAccountInput {
  owners: string[]
  threshold: number
  agentName?: string
}

interface ConfigureDelegationInput {
  account: string
  delegate?: string
  dailyLimitUsd: number
  whitelist: string[]
  maxRiskScore: number
  agentName?: string
}

const accountSchema: Joi.ObjectSchema<CreateCorporateAccountInput> = Joi.object({
  owners: Joi.array().items(Joi.string().lowercase()).length(3).required(),
  threshold: Joi.number().valid(2).required(),
  agentName: Joi.string().trim().min(1).max(120).optional()
})

const delegationSchema: Joi.ObjectSchema<ConfigureDelegationInput> = Joi.object({
  account: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required(),
  delegate: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).optional(),
  dailyLimitUsd: Joi.number().positive().max(1_000_000).required(),
  whitelist: Joi.array().items(Joi.string().trim()).min(1).required(),
  maxRiskScore: Joi.number().integer().min(1).max(5).required(),
  agentName: Joi.string().trim().min(1).max(120).optional()
})

const accountParamSchema = Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required()

const isEmergencyActionTag = (value: unknown): value is EmergencyActionResponse['operation'] => (
  value === 'stop' || value === 'resume' || value === 'auto'
)

const isEmergencyStopMode = (value: unknown): value is EmergencyStopMode => (
  value === 'executed' || value === 'simulated' || value === 'skipped'
)

const buildActionResponse = (
  status: EmergencyStatus,
  entry?: EmergencyLogEntry
): EmergencyActionResponse | undefined => {
  if (entry == null) {
    return undefined
  }

  const rawAction = entry.metadata?.action
  const operation: EmergencyActionResponse['operation'] = isEmergencyActionTag(rawAction)
    ? rawAction
    : 'auto'

  const rawMode = entry.metadata?.mode
  const mode: EmergencyStopMode = isEmergencyStopMode(rawMode)
    ? rawMode
    : entry.status === 'error'
      ? 'skipped'
      : 'executed'

  return {
    operation,
    status,
    mode,
    simulated: entry.metadata?.simulated === true,
    txHash: typeof entry.metadata?.txHash === 'string' ? entry.metadata?.txHash : undefined,
    reason: typeof entry.metadata?.reason === 'string' ? entry.metadata?.reason : undefined,
    message: entry.message,
    completedAt: entry.createdAt,
    logEntry: entry
  }
}

export const createCorporateAccountHandler = async (req: Request, res: Response) => {
  try {
    const rawPayload = req.body as Record<string, unknown>
    const payload = await accountSchema.validateAsync(rawPayload, { abortEarly: false, stripUnknown: true })
    const account = await blockchainService.createCorporateAccount(payload.owners, payload.threshold, payload.agentName)
    res.status(201).json(account)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректные данные', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to create corporate account' })
  }
}

export const getDelegationsHandler = async (req: Request, res: Response) => {
  try {
    const delegations = await blockchainService.getDelegations(req.params.account)
    res.json(delegations)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to get delegations' })
  }
}

export const triggerEmergencyStopHandler = async (req: Request, res: Response) => {
  const rawAccount = req.params.account
  let account: string | undefined
  try {
    account = await accountParamSchema.validateAsync(rawAccount, { abortEarly: false })
    const result = await blockchainService.emergencyStop(account)

    const status = emergencyStateService.setPaused(account, {
      txHash: result.txHash,
      simulated: result.simulated,
      reason: result.reason,
      action: 'stop',
      mode: result.mode
    })

    const message = result.mode === 'executed'
      ? 'Emergency stop выполнен успешно'
      : `Emergency stop executed in demo mode${result.reason != null ? `: ${result.reason}` : ''}`

    const logEntry = emergencyLogService.recordSuccess(account, message, {
      mode: result.mode,
      txHash: result.txHash,
      simulated: result.simulated,
      reason: result.reason,
      action: 'stop'
    })

    res.status(200).json({
      operation: 'stop',
      status,
      mode: result.mode,
      message,
      completedAt: logEntry.createdAt,
      simulated: result.simulated,
      txHash: result.txHash,
      reason: result.reason,
      logEntry
    })
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    const reason = error instanceof Error ? error.message : 'unknown'
    const targetAccount = account ?? rawAccount
    emergencyStateService.setActive(targetAccount, { reason, simulated: false, action: 'auto' })
    emergencyLogService.recordFailure(rawAccount, 'Emergency stop completed with error', {
      reason,
      action: 'stop',
      mode: 'skipped',
      simulated: false
    })
    res.status(500).json({ message: 'Emergency stop завершился с ошибкой' })
  }
}

export const resumeEmergencyStopHandler = async (req: Request, res: Response) => {
  const rawAccount = req.params.account
  let account: string | undefined
  try {
    account = await accountParamSchema.validateAsync(rawAccount, { abortEarly: false })
    const result = await blockchainService.emergencyResume(account)

    const status = emergencyStateService.setActive(account, {
      txHash: result.txHash,
      simulated: result.simulated,
      reason: result.reason,
      action: 'resume',
      mode: result.mode
    })

    const message = result.mode === 'executed'
      ? 'Emergency resume выполнен успешно'
      : `Emergency resume executed in demo mode${result.reason != null ? `: ${result.reason}` : ''}`

    const logEntry = emergencyLogService.recordSuccess(account, message, {
      mode: result.mode,
      txHash: result.txHash,
      simulated: result.simulated,
      reason: result.reason,
      action: 'resume'
    })

    res.status(200).json({
      operation: 'resume',
      status,
      mode: result.mode,
      message,
      completedAt: logEntry.createdAt,
      simulated: result.simulated,
      txHash: result.txHash,
      reason: result.reason,
      logEntry
    })
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    const reason = error instanceof Error ? error.message : 'unknown'
    const targetAccount = account ?? rawAccount
    emergencyStateService.setPaused(targetAccount, { reason, simulated: false, action: 'auto' })
    emergencyLogService.recordFailure(rawAccount, 'Emergency resume завершился ошибкой', {
      reason,
      action: 'resume',
      mode: 'skipped',
      simulated: false
    })
    res.status(500).json({ message: 'Emergency resume завершился с ошибкой' })
  }
}

export const getEmergencyLogHandler = async (req: Request, res: Response) => {
  try {
    const rawAccount = req.params.account
    const filter = rawAccount != null
      ? await accountParamSchema.validateAsync(rawAccount, { abortEarly: false })
      : undefined
    const entries = emergencyLogService.list(filter)
    res.json(entries)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to get emergency event log' })
  }
}

export const getEmergencyStatusHandler = async (req: Request, res: Response) => {
  try {
    const account = await accountParamSchema.validateAsync(req.params.account, { abortEarly: false })
    const status = await emergencyStateService.syncWithController(account)
    res.json(status)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to get emergency stop status' })
  }
}

export const getEmergencyControlSnapshotHandler = async (req: Request, res: Response) => {
  try {
    const account = await accountParamSchema.validateAsync(req.params.account, { abortEarly: false })
    const status = await emergencyStateService.syncWithController(account)
    const entries = emergencyLogService.list(account)
    const lastEntry = entries.length > 0 ? entries[0] : undefined

    res.json({
      account: status.account,
      status,
      isPaused: status.state === 'paused',
      updatedAt: status.updatedAt,
      lastAction: buildActionResponse(status, lastEntry) ?? null
    })
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to get current emergency control state' })
  }
}

export const emergencyEventsStreamHandler = async (req: Request, res: Response) => {
  const rawAccount = req.params.account
  let account: string | undefined

  try {
    if (rawAccount != null) {
      account = await accountParamSchema.validateAsync(rawAccount, { abortEarly: false })
    }
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to open event stream' })
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

  const statusListener = (status: EmergencyStatus) => {
    if (normalizedAccount == null || status.account === normalizedAccount) {
      sendEvent('status', status)
    }
  }

  const logListener = (entry: EmergencyLogEntry) => {
    if (normalizedAccount == null || entry.account === normalizedAccount) {
      sendEvent('log', entry)
    }
  }

  emergencyEventBus.on('status', statusListener)
  emergencyEventBus.on('log', logListener)

  try {
    if (normalizedAccount != null) {
      const current = await emergencyStateService.syncWithController(normalizedAccount)
      sendEvent('status', current)
      const entries = emergencyLogService.list(normalizedAccount)
      if (entries.length > 0) {
        sendEvent('log-batch', entries)
      }
    } else {
      const all = emergencyLogService.list()
      if (all.length > 0) {
        sendEvent('log-batch', all)
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
    emergencyEventBus.off('status', statusListener)
    emergencyEventBus.off('log', logListener)
    res.end()
  }

  req.on('close', cleanup)
  req.on('error', cleanup)
}

export const configureDelegationHandler = async (req: Request, res: Response) => {
  try {
    const rawPayload = req.body as Record<string, unknown>
    const payload = await delegationSchema.validateAsync(rawPayload, { abortEarly: false, stripUnknown: true })
    const delegation = await blockchainService.configureDelegation(payload.account, {
      delegate: payload.delegate,
      dailyLimitUsd: payload.dailyLimitUsd,
      whitelist: payload.whitelist,
      maxRiskScore: payload.maxRiskScore
    })

    res.status(200).json(delegation)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid delegation data', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to update delegation' })
  }
}

export const getSecurityDashboardHandler = async (req: Request, res: Response) => {
  try {
    const account = await accountParamSchema.validateAsync(req.params.account, { abortEarly: false })
    const summary = await securityDashboardService.getSummary(account)
    res.json(summary)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid account address', details: error.details })
      return
    }
    console.error('[security] Failed to build dashboard summary', error)
    res.status(500).json({ message: 'Failed to build trustless security summary' })
  }
}
