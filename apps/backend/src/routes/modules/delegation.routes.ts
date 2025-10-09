import { Router } from 'express'
import {
  updateAutoExecutionHandler,
  getAutoExecutionStatusHandler
} from '../../controllers/delegation.controller'

const router = Router()

// Auto-execution settings
router.post('/:account/auto-execution', (req, res) => {
  void updateAutoExecutionHandler(req, res)
})

router.get('/:account/auto-execution', (req, res) => {
  void getAutoExecutionStatusHandler(req, res)
})

export default router
