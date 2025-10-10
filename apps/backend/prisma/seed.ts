import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { prisma } from '../src/lib/prisma'

const rootEnvPath = path.resolve(__dirname, '../../.env')
loadEnv({ path: rootEnvPath })
loadEnv()

const DEFAULT_CORPORATE_ADDRESS = '0xcccccccccccccccccccccccccccccccccccccccc'
const DEFAULT_DELEGATE_ADDRESS = '0xa11ce00000000000000000000000000000000001'
const DEFAULT_OWNERS = ['0xOwner1', '0xOwner2', '0xOwner3']

async function main (): Promise<void> {
  console.log('[seed] Запуск инициализации MockCorp...')

  const corporateAccount = await prisma.corporateAccount.upsert({
    where: { address: DEFAULT_CORPORATE_ADDRESS },
    update: {
      owners: DEFAULT_OWNERS,
      threshold: 2
    },
    create: {
      address: DEFAULT_CORPORATE_ADDRESS,
      owners: DEFAULT_OWNERS,
      threshold: 2
    }
  })

  console.log('[seed] Корпоративный аккаунт:', corporateAccount.address)

  const delegation = await prisma.delegation.upsert({
    where: {
      corporateId_delegate: {
        corporateId: corporateAccount.id,
        delegate: DEFAULT_DELEGATE_ADDRESS
      }
    },
    update: {
      dailyLimitUsd: 50_000,
      whitelist: ['Aave Monad', 'Yearn Monad', 'Compound Monad'],
      caveats: {
        spent24h: 0,
        spent24hUpdatedAt: new Date().toISOString(),
        maxRiskScore: 4,
        notes: 'seed: default delegation with $50k daily limit for demo'
      }
    },
    create: {
      corporateId: corporateAccount.id,
      delegate: DEFAULT_DELEGATE_ADDRESS,
      dailyLimitUsd: 50_000,
      whitelist: ['Aave Monad', 'Yearn Monad', 'Compound Monad'],
      caveats: {
        spent24h: 0,
        spent24hUpdatedAt: new Date().toISOString(),
        maxRiskScore: 4,
        notes: 'seed: default delegation with $50k daily limit for demo'
      }
    }
  })

  console.log('[seed] Делегация подготовлена для делегата:', delegation.delegate)

  const snapshotExists = await prisma.portfolioSnapshot.findFirst({
    where: { accountId: corporateAccount.address }
  })

  if (snapshotExists == null) {
    await prisma.portfolioSnapshot.create({
      data: {
        accountId: corporateAccount.address,
        data: {
          totalValueUSD: 100_000,
          netAPY: 8.2,
          positions: [
            {
              protocol: 'Aave Monad',
              asset: 'USDC',
              amount: 50_000,
              valueUSD: 50_000,
              currentAPY: 8.4,
              riskScore: 2
            },
            {
              protocol: 'Yearn Monad',
              asset: 'USDT',
              amount: 25_000,
              valueUSD: 24_900,
              currentAPY: 11.8,
              riskScore: 4
            }
          ]
        }
      }
    })
    console.log('[seed] Добавлен дефолтный снимок портфеля')
  } else {
    console.log('[seed] Снимок портфеля уже существует, пропуск')
  }

  console.log('[seed] Инициализация завершена успешно')
}

main()
  .catch((error) => {
    console.error('[seed] Ошибка выполнения seed-скрипта', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
