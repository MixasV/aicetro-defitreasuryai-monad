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

router.get('/backtest', async (req, res) => {
  try {
    const { defiLlamaService } = await import('../../services/external/defi-llama.service')
    const months = Number(req.query.months) || 6
    const initialBalance = Number(req.query.balance) || 100000
    
    const backtest = await defiLlamaService.getDefaultBacktest(initialBalance, months)
    res.json(backtest)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate backtest' })
  }
})

export default router
