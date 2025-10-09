import { describe, expect, it } from 'vitest'
import {
  clamp,
  computeNormalizedCaveats,
  parseCaveats,
  shouldResetSpent,
  type DelegationCaveats
} from '../delegation.utils'

describe('delegation utils', () => {
  it('parses caveats objects safely', () => {
    const raw: DelegationCaveats = { spent24h: 500, maxRiskScore: 4 }
    expect(parseCaveats(raw)).toEqual(raw)
    expect(parseCaveats(null)).toEqual({})
    expect(parseCaveats('invalid')).toEqual({})
  })

  it('clamps numbers within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
    expect(clamp(Number.NaN, 0, 10)).toBe(0)
  })

  it('resets spent amount when 24h window elapsed', () => {
    const now = new Date('2025-01-05T12:00:00Z')
    const staleCaveats: DelegationCaveats = {
      spent24h: 4_500,
      spent24hUpdatedAt: new Date('2025-01-04T10:00:00Z').toISOString()
    }

    expect(shouldResetSpent(staleCaveats, now.getTime())).toBe(true)

    const { caveats, changed } = computeNormalizedCaveats(staleCaveats, 10_000, now)
    expect(changed).toBe(true)
    expect(caveats.spent24h).toBe(0)
    expect(caveats.spent24hUpdatedAt).toBe(now.toISOString())
  })

  it('preserves spent amount within window while clamping to limit', () => {
    const now = new Date('2025-01-05T12:00:00Z')
    const caveats: DelegationCaveats = {
      spent24h: 12_500,
      spent24hUpdatedAt: new Date('2025-01-05T09:00:00Z').toISOString()
    }

    expect(shouldResetSpent(caveats, now.getTime())).toBe(false)

    const { caveats: normalized, changed } = computeNormalizedCaveats(caveats, 10_000, now)
    expect(changed).toBe(true)
    expect(normalized.spent24h).toBe(10_000)
    expect(normalized.spent24hUpdatedAt).toBe(caveats.spent24hUpdatedAt)
  })

  it('detects when no normalization changes are required', () => {
    const now = new Date('2025-01-05T12:00:00Z')
    const caveats: DelegationCaveats = {
      spent24h: 2_500,
      spent24hUpdatedAt: new Date('2025-01-05T11:30:00Z').toISOString()
    }

    const { caveats: normalized, changed } = computeNormalizedCaveats(caveats, 10_000, now)
    expect(changed).toBe(false)
    expect(normalized).toEqual(caveats)
  })
})
