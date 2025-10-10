import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type {
  AIExecutionResult,
  AIExecutionRecord,
  AIExecutionSummary,
  AIExecutionAnalytics,
  AIExecutionProtocolStat
} from '../../types/ai.js'

class AIExecutionHistoryService {
  async record (result: AIExecutionResult): Promise<void> {
    try {
      await prisma.aIExecutionLog.create({
        data: {
          accountAddress: result.account,
          delegateAddress: result.delegate,
          summary: result.summary,
          totalExecutedUsd: result.totalExecutedUsd,
          remainingDailyLimitUsd: result.remainingDailyLimitUsd,
          actions: result.actions as unknown as Prisma.JsonArray,
          generatedAt: new Date(result.generatedAt),
          analysis: result.analysis,
          suggestedActions: result.suggestedActions != null ? (result.suggestedActions as unknown as Prisma.InputJsonValue) : undefined,
          evaluation: result.evaluation != null ? (result.evaluation as unknown as Prisma.InputJsonValue) : undefined,
          governanceSummary: result.governanceSummary,
          warnings: result.warnings != null ? (result.warnings as unknown as Prisma.InputJsonValue) : undefined,
          model: result.model,
          provider: result.provider
        }
      })
    } catch (error) {
      console.error('[ai-history] Failed to persist execution record', error)
    }
  }

  async listForAccount (account: string, limit = 10): Promise<AIExecutionRecord[]> {
    try {
      const logs = await prisma.aIExecutionLog.findMany({
        where: { accountAddress: account.toLowerCase() },
        orderBy: { generatedAt: 'desc' },
        take: limit
      })

      return logs.map((log) => ({
        id: log.id,
        account: log.accountAddress,
        delegate: log.delegateAddress,
        summary: log.summary,
        totalExecutedUsd: log.totalExecutedUsd,
        remainingDailyLimitUsd: log.remainingDailyLimitUsd,
        actions: Array.isArray(log.actions) ? (log.actions as unknown as AIExecutionResult['actions']) : [],
        generatedAt: log.generatedAt.toISOString(),
        createdAt: log.createdAt.toISOString(),
        executionMode: (log.executionMode ?? 'manual') as AIExecutionRecord['executionMode'],
        txHashes: Array.isArray(log.txHashes) ? (log.txHashes as string[]) : undefined,
        profitLossUsd: log.profitLossUsd ?? undefined,
        reasoning: log.reasoning ?? undefined,
        userApproved: log.userApproved,
        analysis: log.analysis ?? undefined,
        suggestedActions: (log.suggestedActions ?? undefined) as unknown as string[] | undefined,
        evaluation: (log.evaluation ?? undefined) as unknown as AIExecutionResult['evaluation'],
        governanceSummary: log.governanceSummary ?? undefined,
        warnings: (log.warnings ?? undefined) as unknown as string[] | undefined,
        model: log.model ?? undefined,
        provider: log.provider ?? undefined
      }))
    } catch (error) {
      console.error('[ai-history] Failed to load execution history', error)
      return []
    }
  }

  async getSummary (account: string): Promise<AIExecutionSummary> {
    const normalized = account.toLowerCase()

    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const [aggregate, successes, lastLog, window24h] = await Promise.all([
        prisma.aIExecutionLog.aggregate({
          where: { accountAddress: normalized },
          _count: { _all: true },
          _sum: { totalExecutedUsd: true }
        }),
        prisma.aIExecutionLog.aggregate({
          where: {
            accountAddress: normalized,
            totalExecutedUsd: { gt: 0 }
          },
          _count: { _all: true }
        }),
        prisma.aIExecutionLog.findFirst({
          where: { accountAddress: normalized },
          orderBy: { generatedAt: 'desc' }
        }),
        prisma.aIExecutionLog.aggregate({
          where: {
            accountAddress: normalized,
            generatedAt: { gte: since }
          },
          _count: { _all: true },
          _sum: { totalExecutedUsd: true }
        })
      ])

      const totalExecutions = aggregate._count?._all ?? 0
      const executedVolumeUsd = Number(aggregate._sum?.totalExecutedUsd ?? 0)
      const successCount = successes._count?._all ?? 0
      const successRate = totalExecutions === 0 ? 0 : Number((successCount / totalExecutions).toFixed(4))
      const averageExecutedUsd = totalExecutions === 0 ? 0 : Number((executedVolumeUsd / totalExecutions).toFixed(2))
      const last24hCount = window24h._count?._all ?? 0
      const last24hVolume = Number(window24h._sum?.totalExecutedUsd ?? 0)

      const summary: AIExecutionSummary = {
        account: normalized,
        totalExecutions,
        executedVolumeUsd: Number(executedVolumeUsd.toFixed(2)),
        averageExecutedUsd,
        successCount,
        successRate,
        last24h: {
          count: last24hCount,
          volumeUsd: Number(last24hVolume.toFixed(2))
        }
      }

      if (lastLog != null) {
        summary.lastExecution = {
          generatedAt: lastLog.generatedAt.toISOString(),
          totalExecutedUsd: Number(lastLog.totalExecutedUsd.toFixed(2)),
          remainingDailyLimitUsd: Number(lastLog.remainingDailyLimitUsd.toFixed(2)),
          summary: lastLog.summary
        }
      }

      return summary
    } catch (error) {
      console.error('[ai-history] Failed to build execution summary', error)
      return {
        account: normalized,
        totalExecutions: 0,
        executedVolumeUsd: 0,
        averageExecutedUsd: 0,
        successCount: 0,
        successRate: 0,
        last24h: {
          count: 0,
          volumeUsd: 0
        }
      }
    }
  }

  async getAnalytics (account: string): Promise<AIExecutionAnalytics> {
    const normalized = account.toLowerCase()

    try {
      const logs = await prisma.aIExecutionLog.findMany({
        where: { accountAddress: normalized },
        orderBy: { generatedAt: 'desc' },
        take: 200
      })

      if (logs.length === 0) {
        return {
          account: normalized,
          totalExecutions: 0,
          successRate: 0,
          totalExecutedUsd: 0,
          executedProtocols: 0,
          topProtocols: []
        }
      }

      const protocolMap = new Map<string, AIExecutionProtocolStat & { apyAccumulator: number, riskAccumulator: number }>()
      let totalExecutedUsd = 0
      let successCount = 0

      for (const log of logs) {
        const actions = Array.isArray(log.actions)
          ? (log.actions as unknown as AIExecutionResult['actions'])
          : []

        let executedInLog = 0

        for (const action of actions) {
          const entry = protocolMap.get(action.protocol) ?? {
            protocol: action.protocol,
            executedUsd: 0,
            executedCount: 0,
            skippedCount: 0,
            averageAPY: 0,
            averageRisk: 0,
            apyAccumulator: 0,
            riskAccumulator: 0
          }

          if (action.status === 'executed') {
            entry.executedUsd = round(entry.executedUsd + action.amountUsd)
            entry.executedCount += 1
            entry.apyAccumulator += action.expectedAPY
            entry.riskAccumulator += action.riskScore
            executedInLog += action.amountUsd
          } else {
            entry.skippedCount += 1
          }

          protocolMap.set(action.protocol, entry)
        }

        if (executedInLog > 0) {
          successCount += 1
        }

        totalExecutedUsd = round(totalExecutedUsd + executedInLog)
      }

      const topProtocols: AIExecutionProtocolStat[] = Array
        .from(protocolMap.values())
        .map((stat) => ({
          protocol: stat.protocol,
          executedUsd: round(stat.executedUsd),
          executedCount: stat.executedCount,
          skippedCount: stat.skippedCount,
          averageAPY: stat.executedCount === 0 ? 0 : round(stat.apyAccumulator / stat.executedCount),
          averageRisk: stat.executedCount === 0 ? 0 : round(stat.riskAccumulator / stat.executedCount)
        }))
        .sort((a, b) => b.executedUsd - a.executedUsd)

      const totalExecutions = logs.length
      const successRate = totalExecutions === 0 ? 0 : round(successCount / totalExecutions)

      return {
        account: normalized,
        totalExecutions,
        successRate,
        totalExecutedUsd: round(totalExecutedUsd),
        executedProtocols: topProtocols.length,
        topProtocols: topProtocols.slice(0, 10),
        lastExecutionAt: logs[0]?.generatedAt.toISOString()
      }
    } catch (error) {
      console.error('[ai-history] Failed to build execution analytics', error)
      return {
        account: normalized,
        totalExecutions: 0,
        successRate: 0,
        totalExecutedUsd: 0,
        executedProtocols: 0,
        topProtocols: []
      }
    }
  }
}

const round = (value: number): number => Number(value.toFixed(2))

export const aiExecutionHistoryService = new AIExecutionHistoryService()
