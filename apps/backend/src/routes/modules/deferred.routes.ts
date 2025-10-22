import { Router } from 'express'
import { deferredExecutionService } from '../../services/ai/deferred-execution.service'

export const deferredRouter = Router()

deferredRouter.get('/pending/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params
    
    const pending = await deferredExecutionService.getPendingTransactions(accountAddress)
    
    res.json({
      success: true,
      data: pending,
      total: pending.length
    })
  } catch (error) {
    console.error('[API] Get pending deferred transactions error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get pending transactions'
    })
  }
})

deferredRouter.post('/cancel/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const success = await deferredExecutionService.cancelTransaction(id)
    
    if (success) {
      res.json({
        success: true,
        message: 'Transaction cancelled'
      })
    } else {
      res.status(404).json({
        success: false,
        error: 'Transaction not found or already completed'
      })
    }
  } catch (error) {
    console.error('[API] Cancel deferred transaction error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel transaction'
    })
  }
})

deferredRouter.post('/check', async (req, res) => {
  try {
    await deferredExecutionService.checkAndExecutePending()
    
    res.json({
      success: true,
      message: 'Deferred transactions check completed'
    })
  } catch (error) {
    console.error('[API] Check deferred transactions error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check deferred transactions'
    })
  }
})

export default deferredRouter
