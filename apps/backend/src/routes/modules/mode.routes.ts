import { Router } from 'express'
import { getAppModeHandler, updateAppModeHandler } from '../../controllers/app-mode.controller'

const router = Router()

router.get('/', (req, res) => {
  getAppModeHandler(req, res)
})

router.post('/', (req, res) => {
  void updateAppModeHandler(req, res)
})

export default router
