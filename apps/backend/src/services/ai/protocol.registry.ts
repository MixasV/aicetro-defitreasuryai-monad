import { MONAD_PROTOCOLS } from '../../config/protocols.monad'
import type { MonadProtocolMetrics } from '../../types/ai.js'
import { isAddress } from 'viem'

interface ProtocolConfigIndex {
  byId: Map<string, string>
  byAddress: Map<string, string>
  byLabel: Map<string, string>
}

const buildConfigIndex = (): ProtocolConfigIndex => {
  const byId = new Map<string, string>()
  const byAddress = new Map<string, string>()
  const byLabel = new Map<string, string>()

  for (const pool of MONAD_PROTOCOLS.nabla.pools) {
    const id = pool.id.toLowerCase()
    const address = pool.address.toLowerCase()
    byId.set(id, address)
    byAddress.set(address, id)
    byLabel.set(pool.assetSymbol.toLowerCase(), id)
    byLabel.set(`nabla ${pool.assetSymbol}`.toLowerCase(), id)
  }

  for (const pair of MONAD_PROTOCOLS.uniswapV2.pairs) {
    const id = pair.id.toLowerCase()
    const address = pair.pairAddress.toLowerCase()
    byId.set(id, address)
    byAddress.set(address, id)

    const baseLabel = `${pair.token0.symbol}/${pair.token1.symbol}`.toLowerCase()
    byLabel.set(baseLabel, id)
    byLabel.set(`uniswap ${baseLabel}`, id)
  }

  return { byId, byAddress, byLabel }
}

export const PROTOCOL_CONFIG_INDEX = buildConfigIndex()

export const normalizeProtocolId = (value: string): string => value.trim().toLowerCase()

export const buildMetricsAddressIndex = (metrics?: MonadProtocolMetrics): Map<string, string> => {
  const map = new Map<string, string>()
  if (metrics == null) return map

  for (const pool of metrics.nablaPools) {
    map.set(pool.address.toLowerCase(), pool.id.toLowerCase())
  }

  for (const pair of metrics.uniswapPairs) {
    map.set(pair.pairAddress.toLowerCase(), pair.id.toLowerCase())
  }

  return map
}

export const resolveAllowedProtocolIdentifiers = (
  whitelist: string[],
  metrics?: MonadProtocolMetrics
): string[] => {
  const identifiers = new Set<string>()
  const metricsAddressIndex = buildMetricsAddressIndex(metrics)

  for (const entry of whitelist) {
    const trimmed = entry?.trim()
    if (trimmed == null || trimmed === '') continue
    const normalized = normalizeProtocolId(trimmed)

    const metricsIdentifier = metricsAddressIndex.get(normalized)
    if (metricsIdentifier != null) {
      identifiers.add(metricsIdentifier)
      continue
    }

    if (PROTOCOL_CONFIG_INDEX.byId.has(normalized)) {
      identifiers.add(normalized)
      continue
    }

    if (PROTOCOL_CONFIG_INDEX.byAddress.has(normalized)) {
      const resolvedId = PROTOCOL_CONFIG_INDEX.byAddress.get(normalized)
      if (resolvedId != null) {
        identifiers.add(resolvedId)
        continue
      }
      continue
    }

    if (normalized.includes(':')) {
      identifiers.add(normalized)
      continue
    }

    const labelMatch = PROTOCOL_CONFIG_INDEX.byLabel.get(normalized)
    if (labelMatch != null) {
      identifiers.add(labelMatch)
      continue
    }

    identifiers.add(normalized)
  }

  return Array.from(identifiers)
}

export const resolveProtocolAddress = (protocol: string, metrics?: MonadProtocolMetrics): string | null => {
  const normalized = normalizeProtocolId(protocol)

  if (metrics != null) {
    for (const pool of metrics.nablaPools) {
      if (pool.id.toLowerCase() === normalized || pool.address.toLowerCase() === normalized) {
        return pool.address
      }
    }

    for (const pair of metrics.uniswapPairs) {
      if (pair.id.toLowerCase() === normalized || pair.pairAddress.toLowerCase() === normalized) {
        return pair.pairAddress
      }
    }
  }

  if (PROTOCOL_CONFIG_INDEX.byId.has(normalized)) {
    return PROTOCOL_CONFIG_INDEX.byId.get(normalized) ?? null
  }

  if (isAddress(normalized)) {
    return normalized
  }

  return null
}
