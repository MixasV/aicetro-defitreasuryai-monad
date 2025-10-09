import { Router } from 'express'
import { getHealthStatusHandler, getLivenessHandler } from '../../controllers/health.controller'

const router = Router()

router.get('/', (req, res) => {
  void getHealthStatusHandler(req, res)
})
router.get('/live', getLivenessHandler)

export default router
