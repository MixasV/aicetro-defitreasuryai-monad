import { Router, type Request, type Response } from 'express'
import { envioAnalyticsService } from '../../services/monitoring/envio.analytics.service'
import { logger } from '../../config/logger'

const router = Router()

/**
 * GET /api/analytics/daily-metrics
 * Get daily metrics for the last N days
 */
router.get('/daily-metrics', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30
    const metrics = await envioAnalyticsService.getDailyMetrics(days)
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Daily metrics failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily metrics'
    })
  }
})

/**
 * GET /api/analytics/timeline/:account
 * Get event timeline for account
 */
router.get('/timeline/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    
    const timeline = await envioAnalyticsService.getEventTimeline(account, limit)
    
    res.json({
      success: true,
      account,
      data: timeline,
      count: timeline.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Timeline failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline'
    })
  }
})

/**
 * GET /api/analytics/historical/:account
 * Time-travel query: Get state at timestamp
 */
router.get('/historical/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const timestamp = parseInt(req.query.timestamp as string)
    
    if (!timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Timestamp query parameter required'
      })
    }
    
    const state = await envioAnalyticsService.getStateAtTimestamp(account, timestamp)
    
    res.json({
      success: true,
      account,
      timestamp,
      data: state
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Historical query failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical state'
    })
  }
})

/**
 * GET /api/analytics/performance/:account
 * Get performance metrics
 */
router.get('/performance/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'monthly'
    
    const metrics = await envioAnalyticsService.getPerformanceMetrics(account, period)
    
    res.json({
      success: true,
      account,
      period,
      data: metrics,
      count: metrics.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Performance failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance metrics'
    })
  }
})

/**
 * GET /api/analytics/compare/:account
 * Compare performance across two periods
 */
router.get('/compare/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const { period1Start, period1End, period2Start, period2End } = req.query
    
    if (!period1Start || !period1End || !period2Start || !period2End) {
      return res.status(400).json({
        success: false,
        error: 'All period parameters required: period1Start, period1End, period2Start, period2End'
      })
    }
    
    const comparison = await envioAnalyticsService.comparePerformance(
      account,
      period1Start as string,
      period1End as string,
      period2Start as string,
      period2End as string
    )
    
    res.json({
      success: true,
      account,
      data: comparison
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Comparison failed')
    res.status(500).json({
      success: false,
      error: 'Failed to compare performance'
    })
  }
})

/**
 * GET /api/analytics/protocol-rankings
 * Get top protocols by performance
 */
router.get('/protocol-rankings', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const rankings = await envioAnalyticsService.getProtocolRankings(limit)
    
    res.json({
      success: true,
      data: rankings,
      count: rankings.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Protocol rankings failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch protocol rankings'
    })
  }
})

/**
 * GET /api/analytics/ai-recommendation
 * Get latest AI recommendation snapshot
 */
router.get('/ai-recommendation', async (req: Request, res: Response) => {
  try {
    const recommendation = await envioAnalyticsService.getLatestAIRecommendation()
    
    res.json({
      success: true,
      data: recommendation
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] AI recommendation failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI recommendation'
    })
  }
})

/**
 * GET /api/analytics/risk-alerts
 * Get risk alerts (optionally filtered)
 */
router.get('/risk-alerts', async (req: Request, res: Response) => {
  try {
    const { account, severity, resolved } = req.query
    
    const alerts = await envioAnalyticsService.getRiskAlerts(
      account as string | undefined,
      severity as string | undefined,
      resolved !== undefined ? resolved === 'true' : undefined
    )
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Risk alerts failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch risk alerts'
    })
  }
})

/**
 * GET /api/analytics/anomalies/:account
 * Get anomaly events for account
 */
router.get('/anomalies/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const limit = parseInt(req.query.limit as string) || 20
    
    const anomalies = await envioAnalyticsService.getAnomalyEvents(account, limit)
    
    res.json({
      success: true,
      account,
      data: anomalies,
      count: anomalies.length
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Anomalies failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch anomalies'
    })
  }
})

/**
 * GET /api/analytics/allocation/:account
 * Get portfolio allocation snapshot
 */
router.get('/allocation/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const allocation = await envioAnalyticsService.getAllocationSnapshot(account)
    
    res.json({
      success: true,
      account,
      data: allocation
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Allocation failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch allocation'
    })
  }
})

/**
 * GET /api/analytics/dashboard/:account
 * Get complete dashboard summary
 */
router.get('/dashboard/:account', async (req: Request, res: Response) => {
  try {
    const { account } = req.params
    const summary = await envioAnalyticsService.getDashboardSummary(account)
    
    res.json({
      success: true,
      account,
      data: summary
    })
  } catch (error) {
    logger.error({ err: error }, '[Analytics API] Dashboard failed')
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary'
    })
  }
})

export { router as analyticsRoutes }
