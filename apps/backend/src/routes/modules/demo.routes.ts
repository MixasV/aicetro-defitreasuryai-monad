import { Router } from 'express'
import { getDemoSummaryHandler, runDemoScenarioHandler } from '../../controllers/demo.controller'

const router = Router()

router.get('/summary', (req, res) => {
  void getDemoSummaryHandler(req, res)
})

router.get('/summary/:account', (req, res) => {
  void getDemoSummaryHandler(req, res)
})

router.post('/run', (req, res) => {
  void runDemoScenarioHandler(req, res)
})

export default router
