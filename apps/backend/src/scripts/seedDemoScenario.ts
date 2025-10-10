import type { Prisma } from '@prisma/client'
import type { AIExecutionAction } from '../types/ai.js'
import '../config/env'
import { prisma } from '../lib/prisma'
import {
  DEMO_CORPORATE_ACCOUNT,
  DEMO_DELEGATE,
  DEMO_DAILY_LIMIT_USD,
  DEMO_MAX_RISK_SCORE,
  DEMO_OWNERS,
  DEMO_PROTOCOLS,
  DEMO_THRESHOLD
} from '../config/demo'

interface LogBlueprint {
  offsetHours: number
  actions: AIExecutionAction[]
  note?: string
}

const logBlueprints: LogBlueprint[] = [
  {
    offsetHours: 3,
    note: 'Перераспределение ликвидности между Aave и Yearn.',
    actions: [
      {
        protocol: 'Aave Monad',
        allocationPercent: 32,
        amountUsd: 4_800,
        expectedAPY: 8.4,
        riskScore: 2.1,
        status: 'executed'
      },
      {
        protocol: 'Yearn Monad',
        allocationPercent: 20,
        amountUsd: 3_000,
        expectedAPY: 11.2,
        riskScore: 3.2,
        status: 'executed'
      },
      {
        protocol: 'MonadSwap',
        allocationPercent: 15,
        amountUsd: 2_200,
        expectedAPY: 16.5,
        riskScore: 4.5,
        status: 'skipped',
        reason: 'Risk exceeds limit'
      }
    ]
  },
  {
    offsetHours: 9,
    note: 'Strengthening Compound and Yearn positions.',
    actions: [
      {
        protocol: 'Compound Monad',
        allocationPercent: 18,
        amountUsd: 3_200,
        expectedAPY: 7.4,
        riskScore: 2.4,
        status: 'executed'
      },
      {
        protocol: 'Yearn Monad',
        allocationPercent: 12,
        amountUsd: 2_000,
        expectedAPY: 10.9,
        riskScore: 3.6,
        status: 'executed'
      },
      {
        protocol: 'MonadSwap',
        allocationPercent: 10,
        amountUsd: 1_800,
        expectedAPY: 17.2,
        riskScore: 4.4,
        status: 'skipped',
        reason: 'Protocol not in whitelist'
      }
    ]
  },
  {
    offsetHours: 27,
    note: 'Expanding low-risk positions and rejecting large LRT.',
    actions: [
      {
        protocol: 'Aave Monad',
        allocationPercent: 20,
        amountUsd: 2_500,
        expectedAPY: 8.1,
        riskScore: 2.0,
        status: 'executed'
      },
      {
        protocol: 'Compound Monad',
        allocationPercent: 15,
        amountUsd: 1_800,
        expectedAPY: 7.1,
        riskScore: 2.5,
        status: 'executed'
      },
      {
        protocol: 'LRT Vault',
        allocationPercent: 25,
        amountUsd: 23_000,
        expectedAPY: 14.8,
        riskScore: 4.7,
        status: 'skipped',
        reason: 'Insufficient daily limit'
      }
    ]
  },
  {
    offsetHours: 51,
    note: 'Rebalancing liquidity and blocking high risk.',
    actions: [
      {
        protocol: 'Aave Monad',
        allocationPercent: 22,
        amountUsd: 3_500,
        expectedAPY: 8.0,
        riskScore: 2.2,
        status: 'executed'
      },
      {
        protocol: 'Yearn Monad',
        allocationPercent: 16,
        amountUsd: 2_600,
        expectedAPY: 11.5,
        riskScore: 3.5,
        status: 'executed'
      },
      {
        protocol: 'Pendle Monad',
        allocationPercent: 12,
        amountUsd: 2_400,
        expectedAPY: 19.1,
        riskScore: 4.8,
        status: 'skipped',
        reason: 'Risk exceeds limit'
      }
    ]
  },
  {
    offsetHours: 75,
    note: 'High-risk proposals rejected.',
    actions: [
      {
        protocol: 'MonadSwap',
        allocationPercent: 15,
        amountUsd: 4_000,
        expectedAPY: 17.9,
        riskScore: 4.6,
        status: 'skipped',
        reason: 'Protocol not in whitelist'
      },
      {
        protocol: 'Experimental Vault',
        allocationPercent: 12,
        amountUsd: 3_500,
        expectedAPY: 21.4,
        riskScore: 4.9,
        status: 'skipped',
        reason: 'Risk exceeds limit'
      }
    ]
  }
]

const demoSnapshot = {
  totalValueUSD: 125_000,
  netAPY: 9.4,
  positions: [
    {
      protocol: 'Aave Monad',
      asset: 'USDC',
      amount: 55_000,
      valueUSD: 55_000,
      currentAPY: 8.6,
      riskScore: 2.1
    },
    {
      protocol: 'Yearn Monad',
      asset: 'USDT',
      amount: 30_000,
      valueUSD: 29_800,
      currentAPY: 11.2,
      riskScore: 3.6
    },
    {
      protocol: 'Compound Monad',
      asset: 'DAI',
      amount: 20_000,
      valueUSD: 20_150,
      currentAPY: 7.4,
      riskScore: 2.8
    },
    {
      protocol: 'MonadSwap',
      asset: 'USDC-USDT LP',
      amount: 15_000,
      valueUSD: 15_050,
      currentAPY: 19.3,
      riskScore: 4.5
    }
  ]
}

const subHours = (hours: number): Date => new Date(Date.now() - hours * 60 * 60 * 1000)
const calculateExecuted = (actions: AIExecutionAction[]): number =>
  actions
    .filter((action) => action.status === 'executed')
    .reduce((sum, action) => sum + action.amountUsd, 0)

const buildSummary = (executedUsd: number, note?: string): string => {
  const base = executedUsd > 0
    ? `AI выполнил операции на ${executedUsd.toFixed(2)} USD.`
    : 'Нет операций, удовлетворяющих ограничениям.'
  return note != null && note.trim().length > 0 ? `${base} ${note.trim()}` : base
}

async function seedDemoScenario () {
  console.log('[demo-seed] Подготовка демо-сценария MockCorp...')

  const totalExecutedLast24h = logBlueprints
    .filter((log) => log.offsetHours <= 24)
    .map((log) => calculateExecuted(log.actions))
    .reduce((sum, value) => sum + value, 0)

  const caveatsPayload = {
    spent24h: Number(totalExecutedLast24h.toFixed(2)),
    spent24hUpdatedAt: new Date().toISOString(),
    maxRiskScore: DEMO_MAX_RISK_SCORE,
    notes: 'demo seed script baseline'
  } satisfies Record<string, unknown>

  const corporate = await prisma.corporateAccount.upsert({
    where: { address: DEMO_CORPORATE_ACCOUNT },
    update: {
      owners: DEMO_OWNERS,
      threshold: DEMO_THRESHOLD
    },
    create: {
      address: DEMO_CORPORATE_ACCOUNT,
      owners: DEMO_OWNERS,
      threshold: DEMO_THRESHOLD
    }
  })

  await prisma.delegation.upsert({
    where: {
      corporateId_delegate: {
        corporateId: corporate.id,
        delegate: DEMO_DELEGATE
      }
    },
    update: {
      dailyLimitUsd: DEMO_DAILY_LIMIT_USD,
      whitelist: Array.from(DEMO_PROTOCOLS),
      caveats: caveatsPayload as Prisma.JsonObject
    },
    create: {
      corporateId: corporate.id,
      delegate: DEMO_DELEGATE,
      dailyLimitUsd: DEMO_DAILY_LIMIT_USD,
      whitelist: Array.from(DEMO_PROTOCOLS),
      caveats: caveatsPayload as Prisma.JsonObject
    }
  })

  await prisma.portfolioSnapshot.deleteMany({ where: { accountId: DEMO_CORPORATE_ACCOUNT } })
  await prisma.portfolioSnapshot.create({
    data: {
      accountId: DEMO_CORPORATE_ACCOUNT,
      data: demoSnapshot as Prisma.JsonObject,
      capturedAt: subHours(1)
    }
  })

  await prisma.aIExecutionLog.deleteMany({ where: { accountAddress: DEMO_CORPORATE_ACCOUNT } })

  for (const blueprint of logBlueprints) {
    const executedUsd = Number(calculateExecuted(blueprint.actions).toFixed(2))
    const summary = buildSummary(executedUsd, blueprint.note)
    const remaining = Number((Math.max(DEMO_DAILY_LIMIT_USD - executedUsd, 0)).toFixed(2))

    await prisma.aIExecutionLog.create({
      data: {
        accountAddress: DEMO_CORPORATE_ACCOUNT,
        delegateAddress: DEMO_DELEGATE,
        summary,
        totalExecutedUsd: executedUsd,
        remainingDailyLimitUsd: remaining,
        actions: blueprint.actions as unknown as Prisma.JsonArray,
        generatedAt: subHours(blueprint.offsetHours)
      }
    })
  }

  console.log('[demo-seed] Добавлено записей истории AI:', logBlueprints.length)
  console.log('[demo-seed] Потрачено за 24ч:', Number(totalExecutedLast24h.toFixed(2)), 'USD')
  console.log('[demo-seed] Демонстрационный сценарий готов.')
}

seedDemoScenario()
  .catch((error) => {
    console.error('[demo-seed] Ошибка подготовки демо-сценария', error)
    process.exitCode = 1
  })
  .finally(() => {
    prisma.$disconnect().catch((disconnectError) => {
      console.error('[demo-seed] Не удалось закрыть соединение Prisma', disconnectError)
    })
  })
