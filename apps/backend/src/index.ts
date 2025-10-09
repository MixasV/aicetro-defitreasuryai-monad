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

const server = app.listen(env.port, () => {
  logger.info({ port: env.port }, 'Backend API запущен')
})

const gracefulShutdown = () => {
  logger.info('Получен сигнал завершения, останавливаем сервисы...')
  shutdownScheduler()
  shutdownMonitoringPoller()
  void shutdownMonitoringStream()
  server.close(() => {
    logger.info('HTTP сервер остановлен. Завершение процесса.')
    process.exit(0)
  })
}

process.once('SIGINT', gracefulShutdown)
process.once('SIGTERM', gracefulShutdown)
