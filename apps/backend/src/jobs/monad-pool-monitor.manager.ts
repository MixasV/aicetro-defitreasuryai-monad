import { monadPoolMonitor } from './monad-pool-monitor.scheduler'

export const initializeMonadPoolMonitor = (): void => {
  monadPoolMonitor.start()
}

export const shutdownMonadPoolMonitor = (): void => {
  monadPoolMonitor.stop()
}

export const runMonadPoolMonitorOnce = async () => {
  return await monadPoolMonitor.analyzeMonadPools()
}

export const getMonadPoolMonitorStatus = () => {
  return monadPoolMonitor.getStatus()
}
