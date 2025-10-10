import type { MonitoringStreamStatus } from '@defitreasuryai/types'
import { envioStreamService } from './envio.stream.service'
import { logger } from '../../config/logger'
import { env } from '../../config/env'

export const initializeMonitoringStream = async (): Promise<void> => {
  if (!env.envioStreamEnabled) {
    logger.info('Envio stream disabled via ENVIO_STREAM_ENABLED=false')
    return
  }

  try {
    await envioStreamService.start()
  } catch (error) {
    logger.error({ err: error }, 'Failed to start Envio stream during initialization')
  }
}

export const shutdownMonitoringStream = async (): Promise<void> => {
  try {
    await envioStreamService.stop()
  } catch (error) {
    logger.error({ err: error }, 'Failed to properly stop Envio stream')
  }
}

export const getMonitoringStreamStatus = (): MonitoringStreamStatus => envioStreamService.getStatus()

export const startMonitoringStream = async (): Promise<boolean> => await envioStreamService.start()

export const stopMonitoringStream = async (): Promise<boolean> => await envioStreamService.stop()
