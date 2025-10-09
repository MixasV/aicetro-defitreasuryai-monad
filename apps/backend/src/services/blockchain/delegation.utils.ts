import type { Prisma } from '@prisma/client'

export const SPENT_RESET_WINDOW_MS = 24 * 60 * 60 * 1000

export interface DelegationCaveats {
  spent24h?: number
  spent24hUpdatedAt?: string
  maxRiskScore?: number
  notes?: string
  [key: string]: Prisma.JsonValue | undefined
}

export const parseCaveats = (value: unknown): DelegationCaveats => {
  if (value != null && typeof value === 'object') {
    return value as DelegationCaveats
  }
  return {}
}

export const clamp = (value: number, min: number, max: number): number => {
  if (Number.isNaN(value)) return min
  return Math.min(Math.max(value, min), max)
}

export const shouldResetSpent = (caveats: DelegationCaveats, referenceTimeMs: number = Date.now()): boolean => {
  if (typeof caveats.spent24hUpdatedAt !== 'string') {
    return true
  }

  const lastUpdateMs = Date.parse(caveats.spent24hUpdatedAt)
  if (Number.isNaN(lastUpdateMs)) {
    return true
  }

  return referenceTimeMs - lastUpdateMs >= SPENT_RESET_WINDOW_MS
}

export const computeNormalizedCaveats = (
  caveats: DelegationCaveats,
  dailyLimitUsd: number,
  referenceTime: Date = new Date()
): { caveats: DelegationCaveats, changed: boolean } => {
  const clampedSpent = clamp(typeof caveats.spent24h === 'number' ? caveats.spent24h : 0, 0, dailyLimitUsd)
  const resetNeeded = shouldResetSpent(caveats, referenceTime.getTime())
  const nowIso = referenceTime.toISOString()

  const nextCaveats: DelegationCaveats = {
    ...caveats,
    spent24h: resetNeeded ? 0 : clampedSpent,
    spent24hUpdatedAt: resetNeeded
      ? nowIso
      : (typeof caveats.spent24hUpdatedAt === 'string' ? caveats.spent24hUpdatedAt : nowIso)
  }

  const changed =
    nextCaveats.spent24h !== caveats.spent24h ||
    nextCaveats.spent24hUpdatedAt !== caveats.spent24hUpdatedAt

  return { caveats: nextCaveats, changed }
}
