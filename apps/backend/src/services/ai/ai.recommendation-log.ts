import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import type { AIRecommendationEvaluation, AIRecommendationLogEntry, OpenRouterCallStatus } from '../../types/ai.js'

interface RecommendationLogInput {
  account: string
  delegate: string
  model: string
  provider?: string
  status: OpenRouterCallStatus
  latencyMs: number
  fallbackUsed: boolean
  prompt: string
  response: string
  evaluation?: AIRecommendationEvaluation
  errorMessage?: string
  createdAt?: Date
}

class AIRecommendationLogService {
  async record (input: RecommendationLogInput): Promise<void> {
    try {
      await prisma.aIRecommendationLog.create({
        data: {
          accountAddress: input.account,
          delegateAddress: input.delegate,
          model: input.model,
          provider: input.provider,
          status: input.status,
          latencyMs: Math.max(0, Math.round(input.latencyMs)),
          fallbackUsed: input.fallbackUsed,
          prompt: truncate(input.prompt, 16_000),
          response: truncate(input.response, 24_000),
          evaluation: input.evaluation != null ? (input.evaluation as unknown as Prisma.InputJsonValue) : undefined,
          errorMessage: input.errorMessage,
          createdAt: input.createdAt ?? new Date()
        }
      })
    } catch (error) {
      if (isTableMissingError(error)) {
        return
      }
      console.error('[ai-rec-log] Не удалось записать лог рекомендации', error)
    }
  }

  async list (account: string, limit = 20): Promise<AIRecommendationLogEntry[]> {
    try {
      const records = await prisma.aIRecommendationLog.findMany({
        where: { accountAddress: account.toLowerCase() },
        orderBy: { createdAt: 'desc' },
        take: Math.min(Math.max(limit, 1), 100)
      })

      return records.map((record) => ({
        id: record.id,
        account: record.accountAddress,
        delegate: record.delegateAddress,
        model: record.model,
        provider: record.provider ?? undefined,
        status: record.status as OpenRouterCallStatus,
        latencyMs: record.latencyMs,
        fallbackUsed: record.fallbackUsed,
        prompt: record.prompt,
        response: record.response,
        createdAt: record.createdAt.toISOString(),
        evaluation: (record.evaluation ?? undefined) as unknown as AIRecommendationEvaluation | undefined,
        errorMessage: record.errorMessage ?? undefined
      }))
    } catch (error) {
      if (!isTableMissingError(error)) {
        console.error('[ai-rec-log] Не удалось получить логи рекомендаций', error)
      }
      return []
    }
  }
}

const truncate = (value: string, max: number): string => {
  if (value.length <= max) return value
  return `${value.slice(0, max - 3)}...`
}

const isTableMissingError = (error: unknown): boolean => {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'
}

export const aiRecommendationLogService = new AIRecommendationLogService()
