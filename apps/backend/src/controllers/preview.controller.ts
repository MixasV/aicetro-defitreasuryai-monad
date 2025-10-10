import type { Request, Response } from 'express'
import { previewDataService } from '../services/preview/preview.service'

export const getPreviewOverviewHandler = async (req: Request, res: Response) => {
  try {
    const force = req.query.refresh === 'true'
    const overview = await previewDataService.getOverview(force)
    res.json(overview)
  } catch (error) {
    console.error('[preview] Failed to build overview', error)
    res.status(500).json({ message: 'Failed to get Preview mode data' })
  }
}
