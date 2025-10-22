import { Router } from 'express'
import { poolUserAnalysisService } from '../../services/pools/pool-user-analysis.service'
import { logger } from '../../config/logger'

export const poolUserAnalysisRouter = Router()

/**
 * POST /api/pools/:poolId/analyze-for-user
 * Get AI analysis of whether user should add pool to whitelist
 * 
 * Body: { userAddress: string, type?: 'simple' | 'detailed' }
 * 
 * Response:
 * {
 *   shouldAdd: boolean,
 *   reason: string,
 *   riskLevel: 'low' | 'medium' | 'high',
 *   detailedAnalysis?: string,
 *   cached: boolean
 * }
 */
poolUserAnalysisRouter.post('/:poolId(*)/analyze-for-user', async (req, res) => {
  try {
    // URL decode poolId because it may contain slashes
    const poolId = decodeURIComponent(req.params.poolId)
    const { userAddress, type = 'simple' } = req.body

    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress required' })
    }

    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }

    if (type !== 'simple' && type !== 'detailed') {
      return res.status(400).json({ error: 'type must be "simple" or "detailed"' })
    }

    logger.info(`[PoolUserAnalysis] Request: pool=${poolId}, user=${userAddress}, type=${type}`)

    const analysis = await poolUserAnalysisService.analyzePoolForUser(
      poolId,
      userAddress,
      type
    )

    res.json({
      success: true,
      analysis
    })
  } catch (error: any) {
    logger.error({ error }, '[PoolUserAnalysis] Analysis failed')
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message })
    }
    
    if (error.message.includes('No active delegation')) {
      return res.status(400).json({ error: 'User must have an active delegation to get pool analysis' })
    }

    res.status(500).json({ 
      error: 'Failed to analyze pool',
      details: error.message 
    })
  }
})

/**
 * DELETE /api/pools/analyze-cache/expired
 * Clear expired cache entries (maintenance endpoint)
 */
poolUserAnalysisRouter.delete('/analyze-cache/expired', async (req, res) => {
  try {
    const deleted = await poolUserAnalysisService.clearExpiredCache()
    res.json({
      success: true,
      deleted
    })
  } catch (error: any) {
    logger.error({ error }, '[PoolUserAnalysis] Cache clear failed')
    res.status(500).json({ error: 'Failed to clear cache' })
  }
})
