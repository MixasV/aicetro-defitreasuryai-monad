import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { AIPreviewResult, AISimulationLogEntry } from '../../types/ai.js'

class AISimulationLogService {
  async record (result: AIPreviewResult): Promise<void> {
    try {
      await prisma.aISimulationLog.create({
        data: {
          accountAddress: result.account,
          delegateAddress: result.delegate,
          summary: result.summary,
          totalExecutableUsd: result.totalExecutableUsd,
          remainingDailyLimitUsd: result.remainingDailyLimitUsd,
          actions: result.actions as unknown as Prisma.JsonArray,
          analysis: result.analysis,
          evaluation: result.evaluation != null ? result.evaluation as unknown as Prisma.InputJsonValue : undefined,
          governanceSummary: result.governanceSummary,
          warnings: result.warnings != null ? result.warnings as unknown as Prisma.InputJsonValue : undefined,
          model: result.model,
          provider: result.provider,
          generatedAt: new Date(result.generatedAt)
        }
      })
    } catch (error) {
      console.error('[ai-simulation-log] Не удалось записать симуляцию', error)
    }
  }

  async list (account: string, limit = 10): Promise<AISimulationLogEntry[]> {
    if (limit <= 0) return []

    try {
      const logs = await prisma.aISimulationLog.findMany({
        where: { accountAddress: account.toLowerCase() },
        orderBy: { generatedAt: 'desc' },
        take: limit
      })

      return logs.map((log) => ({
        id: log.id,
        account: log.accountAddress,
        delegate: log.delegateAddress,
        summary: log.summary,
        totalExecutableUsd: log.totalExecutableUsd,
        remainingDailyLimitUsd: log.remainingDailyLimitUsd,
        actions: Array.isArray(log.actions) ? log.actions as unknown as AIPreviewResult['actions'] : [],
        analysis: log.analysis ?? undefined,
        evaluation: (log.evaluation ?? undefined) as unknown as AIPreviewResult['evaluation'],
        governanceSummary: log.governanceSummary ?? undefined,
        warnings: (log.warnings ?? undefined) as unknown as string[] | undefined,
        model: log.model ?? undefined,
        provider: log.provider ?? undefined,
        generatedAt: log.generatedAt.toISOString(),
        createdAt: log.createdAt.toISOString()
      }))
    } catch (error) {
      console.error('[ai-simulation-log] Не удалось получить историю симуляций', error)
      return []
    }
  }
}

export const aiSimulationLogService = new AISimulationLogService()
