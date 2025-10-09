import { Router } from 'express'
import { getPreviewOverviewHandler } from '../../controllers/preview.controller'

const router = Router()

router.get('/overview', (req, res) => {
  void getPreviewOverviewHandler(req, res)
})

export default router
