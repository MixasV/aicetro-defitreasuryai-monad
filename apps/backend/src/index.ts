import { env } from './config/env'
import { logger } from './config/logger'
import { createServer } from './server'
import { initializeScheduler, shutdownScheduler } from './services/ai/scheduler.manager'
import { initializeMonitoringPoller, shutdownMonitoringPoller } from './services/monitoring/monitoring.poller.manager'
import { initializeMonitoringStream, shutdownMonitoringStream } from './services/monitoring/monitoring.stream.manager'

const app = createServer()
initializeScheduler()
initializeMonitoringPoller()
void initializeMonitoringStream()

const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info({ port: env.port, host: '0.0.0.0' }, 'Backend API started (all interfaces - protected by firewall)')
})

const gracefulShutdown = () => {
  logger.info('Received termination signal, stopping services...')
  shutdownScheduler()
  shutdownMonitoringPoller()
  void shutdownMonitoringStream()
  server.close(() => {
    logger.info('HTTP server stopped. Exiting process.')
    process.exit(0)
  })
}

process.once('SIGINT', gracefulShutdown)
process.once('SIGTERM', gracefulShutdown)
