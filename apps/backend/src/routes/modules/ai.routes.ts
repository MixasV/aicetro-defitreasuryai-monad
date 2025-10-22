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
  getOpenRouterMetricsHandler,
  getAIStatsHandler
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

router.get('/stats/:address', (req, res) => {
  void getAIStatsHandler(req, res)
})

router.get('/operations/:address/recent', async (req, res) => {
  try {
    const { address } = req.params
    const normalized = address.toLowerCase()
    
    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      return res.status(400).json({ message: 'Invalid account address' })
    }

    const { prisma } = await import('../../db/prisma')

    const executions = await prisma.aIExecutionLog.findMany({
      where: { accountAddress: normalized },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const operations = executions.map(exec => {
      const actions = exec.actions as any
      let action = exec.summary || 'AI Execution'
      let protocol = 'Multiple protocols'
      
      if (actions && Array.isArray(actions) && actions.length > 0) {
        const firstAction = actions[0]
        protocol = firstAction.protocol || 'Unknown'
        
        if (actions.length === 1) {
          // FIXED: actions[] has no 'action' field, generate from status/protocol
          const actionType = firstAction.status === 'executed' ? 'Swap' : 
                           firstAction.status === 'pending' ? 'Pending' :
                           firstAction.status === 'skipped' ? 'Skipped' : 'Unknown'
          action = `${actionType} ${firstAction.protocol || 'Unknown'}`
        } else {
          action = `Rebalanced across ${actions.length} protocols`
        }
      }
      
      const timeSince = getTimeSince(exec.createdAt)
      
      // Map status from actions
      const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
        'executed': 'success',
        'pending': 'pending',
        'skipped': 'failed',
        'deferred': 'pending'
      }
      const firstActionStatus = (actions && actions[0]?.status) || 'skipped'
      
      return {
        id: exec.id,
        action,
        protocol,
        amount: exec.totalExecutedUsd > 0 ? `$${exec.totalExecutedUsd.toFixed(0)}` : undefined,
        status: statusMap[firstActionStatus] || 'failed',
        timestamp: timeSince
      }
    })

    res.json({
      success: true,
      operations
    })
  } catch (error) {
    console.error('[AI Operations] Error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get recent operations' 
    })
  }
})

router.get('/transactions/:address/recent', async (req, res) => {
  try {
    const { address } = req.params
    const normalized = address.toLowerCase()
    
    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      return res.status(400).json({ message: 'Invalid account address' })
    }

    const { prisma } = await import('../../db/prisma')

    const executions = await prisma.aIExecutionLog.findMany({
      where: { accountAddress: normalized },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const transactions = executions.flatMap(exec => {
      const actions = exec.actions as any
      if (!actions || !Array.isArray(actions)) return []
      
      return actions.map((action, idx) => {
        const date = new Date(exec.createdAt).toISOString().replace('T', ' ').substring(0, 16)
        const type = action.action || 'Unknown'
        const protocol = action.protocol || 'Unknown'
        const amount = action.amountUsd ? `$${action.amountUsd.toFixed(0)}` : '$0'
        const fee = action.gasCost ? `$${parseFloat(action.gasCost).toFixed(2)}` : '$0.00'
        const status = action.status === 'executed' ? 'success' as const : 'failed' as const
        
        const txHashes = exec.txHashes as any
        let txHash = '0x0000000000000000000000000000000000000000000000000000000000000000'
        if (txHashes && Array.isArray(txHashes) && txHashes[idx]) {
          txHash = txHashes[idx]
        }
        
        return {
          id: `${exec.id}-${idx}`,
          date,
          type,
          protocol,
          amount,
          fee,
          status,
          txHash
        }
      })
    })

    res.json({
      success: true,
      transactions
    })
  } catch (error) {
    console.error('[AI Transactions] Error:', error)
    res.status(500).json({ 
      success: false,
      message: 'Failed to get recent transactions' 
    })
  }
})

function getTimeSince(date: Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export default router
