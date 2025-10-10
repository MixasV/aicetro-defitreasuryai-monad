import type { Request, Response } from 'express'
import { healthService } from '../services/health/health.service'

export const getHealthStatusHandler = async (_req: Request, res: Response) => {
  try {
    const status = await healthService.getStatus()
    const httpStatus = status.status === 'critical' ? 503 : 200
    res.status(httpStatus).json(status)
  } catch (error) {
    console.error('[health] Failed to build health status', error)
    res.status(500).json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      indicators: [
        {
          component: 'health_service',
          status: 'critical',
          message: 'Health check недоступен'
        }
      ],
      metadata: {
        environment: process.env.NODE_ENV ?? 'development',
        version: process.env.npm_package_version,
        schedulerEnabled: false
      }
    })
  }
}

export const getLivenessHandler = (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
}
