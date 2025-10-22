import { aiPoolAnalysisScheduler } from '../../jobs/ai-pool-analysis.scheduler'

export const initializeAIPoolAnalysis = (): void => {
  aiPoolAnalysisScheduler.start()
}

export const shutdownAIPoolAnalysis = (): void => {
  aiPoolAnalysisScheduler.stop()
}

export const runAIPoolAnalysisOnce = async () => {
  return await aiPoolAnalysisScheduler.analyzeBatch()
}

export const getAIPoolAnalysisStatus = () => {
  return aiPoolAnalysisScheduler.getStatus()
}
