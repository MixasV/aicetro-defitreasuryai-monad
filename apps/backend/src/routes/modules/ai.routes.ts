import { Router } from 'express'
import {
  getAIRecommendationHandler,
  executeAIPlanHandler,
  previewAIPlanHandler,
  getAIExecutionHistoryHandler,
  getAIExecutionAnalyticsHandler,
  getAIExecutionSummaryHandler,
  getAISimulationHistoryHandler,
  getAISchedulerStatusHandler,
  startAISchedulerHandler,
  stopAISchedulerHandler,
  runAISchedulerOnceHandler,
  getOpenRouterMetricsHandler
} from '../../controllers/ai.controller'

const router = Router()

router.post('/recommendations', (req, res) => {
  void getAIRecommendationHandler(req, res)
})

router.post('/preview', (req, res) => {
  void previewAIPlanHandler(req, res)
})

router.post('/execute', (req, res) => {
  void executeAIPlanHandler(req, res)
})

router.get('/executions/:account/summary', (req, res) => {
  void getAIExecutionSummaryHandler(req, res)
})

router.get('/executions/:account/analytics', (req, res) => {
  void getAIExecutionAnalyticsHandler(req, res)
})

router.get('/executions/:account', (req, res) => {
  void getAIExecutionHistoryHandler(req, res)
})

router.get('/simulations/:account', (req, res) => {
  void getAISimulationHistoryHandler(req, res)
})

router.get('/scheduler/status', (req, res) => {
  getAISchedulerStatusHandler(req, res)
})

router.post('/scheduler/start', (req, res) => {
  startAISchedulerHandler(req, res)
})

router.post('/scheduler/stop', (req, res) => {
  stopAISchedulerHandler(req, res)
})

router.post('/scheduler/run', (req, res) => {
  void runAISchedulerOnceHandler(req, res)
})

router.get('/openrouter/metrics', (req, res) => {
  getOpenRouterMetricsHandler(req, res)
})

export default router
