import type { Express } from 'express'
import aiRouter from './modules/ai.routes'
import healthRouter from './modules/health.routes'
import monitoringRouter from './modules/monitoring.routes'
import treasuryRouter from './modules/treasury.routes'
import demoRouter from './modules/demo.routes'
import previewRouter from './modules/preview.routes'
import modeRouter from './modules/mode.routes'
import delegationRouter from './modules/delegation.routes'

export const registerRoutes = (app: Express) => {
  app.use('/api/health', healthRouter)
  app.use('/api/ai', aiRouter)
  app.use('/api/monitoring', monitoringRouter)
  app.use('/api/treasury', treasuryRouter)
  app.use('/api/demo', demoRouter)
  app.use('/api/mode', modeRouter)
  app.use('/api/preview', previewRouter)
  app.use('/api/delegation', delegationRouter)
}
