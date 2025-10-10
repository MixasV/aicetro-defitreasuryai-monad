import type { Request, Response } from 'express'
import Joi from 'joi'
import type {
  AIRecommendationRequest,
  AIExecutionRequest,
  AIPreviewRequest
} from '../types/ai.js'
import { aiService } from '../services/ai/ai.service'
import { aiExecutionService } from '../services/ai/ai.executor'
import { aiExecutionHistoryService } from '../services/ai/ai.history'
import { aiPreviewService } from '../services/ai/ai.preview'
import { aiSimulationLogService } from '../services/ai/ai.simulation-log'
import {
  getSchedulerStatus,
  runSchedulerOnce,
  startScheduler,
  stopScheduler
} from '../services/ai/scheduler.manager'
import { aiTelemetryService } from '../services/ai/ai.telemetry'

const recommendationSchema: Joi.ObjectSchema<AIRecommendationRequest> = Joi.object({
  portfolio: Joi.object().required(),
  riskTolerance: Joi.string().valid('conservative', 'balanced', 'aggressive').default('balanced'),
  protocols: Joi.array().items(Joi.string().trim()).min(1).required(),
  constraints: Joi.object({
    dailyLimitUsd: Joi.number().positive().required(),
    remainingDailyLimitUsd: Joi.number().min(0).required(),
    maxRiskScore: Joi.number().min(0).max(5).required(),
    whitelist: Joi.array().items(Joi.string().trim()).min(1).required(),
    notes: Joi.string().max(240).optional()
  }).required(),
  context: Joi.object({
    account: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required(),
    delegate: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required(),
    chainId: Joi.number().integer().positive().required(),
    scenario: Joi.string().max(64)
  }).optional(),
  evaluationGoals: Joi.array().items(Joi.string().max(64)).max(6)
})

const executionSchema: Joi.ObjectSchema<AIExecutionRequest> = Joi.object({
  account: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required(),
  delegate: Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/),
  riskTolerance: Joi.string().valid('conservative', 'balanced', 'aggressive'),
  protocols: Joi.array().items(Joi.string().trim()).min(1)
})

export const getAIRecommendationHandler = async (req: Request, res: Response) => {
  try {
    const rawPayload = req.body as Record<string, unknown>
    const input = await recommendationSchema.validateAsync(rawPayload, { abortEarly: false, stripUnknown: true })
    const recommendation = await aiService.generateRecommendations(input)
    res.json(recommendation)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid input data', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to generate AI recommendation' })
  }
}

export const executeAIPlanHandler = async (req: Request, res: Response) => {
  try {
    const rawPayload = req.body as Record<string, unknown>
    const input = await executionSchema.validateAsync(rawPayload, { abortEarly: false, stripUnknown: true })
    const result = await aiExecutionService.execute(input)
    res.json(result)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid AI execution data', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to execute AI strategy' })
  }
}

export const previewAIPlanHandler = async (req: Request, res: Response) => {
  try {
    const rawPayload = req.body as Record<string, unknown>
    const input = await executionSchema.validateAsync(rawPayload, { abortEarly: false, stripUnknown: true }) as AIPreviewRequest
    const preview = await aiPreviewService.preview(input)
    res.json(preview)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid AI execution data', details: error.details })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Failed to build AI preview' })
  }
}

export const getAIExecutionHistoryHandler = async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const normalized = account.toLowerCase()
    if (!/^0x[a-f0-9]{4,}$/.test(normalized)) {
      res.status(400).json({ message: 'Invalid account address' })
      return
    }

    const limitParam = req.query.limit as string | undefined
    let limit = 10
    if (limitParam != null) {
      const parsed = Number.parseInt(limitParam, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50)
      }
    }
    const history = await aiExecutionHistoryService.listForAccount(normalized, limit)
    res.json(history)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to get AI execution history' })
  }
}

export const getAIExecutionSummaryHandler = async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const normalized = account.toLowerCase()
    if (!/^0x[a-f0-9]{4,}$/.test(normalized)) {
      res.status(400).json({ message: 'Invalid account address' })
      return
    }

    const summary = await aiExecutionHistoryService.getSummary(normalized)
    res.json(summary)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to build AI execution summary' })
  }
}

export const getAISimulationHistoryHandler = async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const normalized = account.toLowerCase()
    if (!/^0x[a-f0-9]{4,}$/.test(normalized)) {
      res.status(400).json({ message: 'Invalid account address' })
      return
    }

    const limitParam = req.query.limit as string | undefined
    let limit = 10
    if (limitParam != null) {
      const parsed = Number.parseInt(limitParam, 10)
      if (!Number.isNaN(parsed) && parsed > 0) {
        limit = Math.min(parsed, 50)
      }
    }

    const logs = await aiSimulationLogService.list(normalized, limit)
    res.json(logs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to get AI simulation history' })
  }
}

export const getAIExecutionAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const normalized = account.toLowerCase()
    if (!/^0x[a-f0-9]{4,}$/.test(normalized)) {
      res.status(400).json({ message: 'Invalid account address' })
      return
    }

    const analytics = await aiExecutionHistoryService.getAnalytics(normalized)
    res.json(analytics)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to build AI execution analytics' })
  }
}

export const getAISchedulerStatusHandler = (_req: Request, res: Response) => {
  res.json(getSchedulerStatus())
}

export const getOpenRouterMetricsHandler = (req: Request, res: Response) => {
  const limitParam = req.query.limit
  let limit = 20

  if (typeof limitParam === 'string') {
    const parsed = Number.parseInt(limitParam, 10)
    if (!Number.isNaN(parsed) && parsed > 0) {
      limit = Math.min(parsed, 100)
    }
  }

  res.json(aiTelemetryService.getMetrics(limit))
}

export const startAISchedulerHandler = (_req: Request, res: Response) => {
  const started = startScheduler()
  res.status(started ? 200 : 200).json({
    started,
    status: getSchedulerStatus()
  })
}

export const stopAISchedulerHandler = (_req: Request, res: Response) => {
  const stopped = stopScheduler()
  res.status(stopped ? 200 : 200).json({
    stopped,
    status: getSchedulerStatus()
  })
}

export const runAISchedulerOnceHandler = async (_req: Request, res: Response) => {
  try {
    const summary = await runSchedulerOnce()
    if (summary == null) {
      res.status(202).json({
        message: 'Execution skipped: previous iteration still running.',
        status: getSchedulerStatus()
      })
      return
    }

    res.json({
      summary,
      status: getSchedulerStatus()
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('already running')) {
      res.status(409).json({ message: error.message, status: getSchedulerStatus() })
      return
    }

    console.error(error)
    res.status(500).json({ message: 'Failed to manually trigger AI scheduler', status: getSchedulerStatus() })
  }
}
