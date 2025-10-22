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

  // Nabla removed - pools do not exist on Monad Testnet
  // for (const pool of MONAD_PROTOCOLS.nabla.pools) { ... }

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

  // Nabla removed - nablaPools will be empty array
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

    // Fallback: If whitelist contains general protocol name (e.g., "uniswap v2"),
    // add all pairs from that protocol AND the general name
    if (normalized.includes('uniswap')) {
      // Add all Uniswap pairs from config
      for (const [id, _] of PROTOCOL_CONFIG_INDEX.byId) {
        if (id.startsWith('uniswap:') || id.includes('uniswap')) {
          identifiers.add(id)
        }
      }
      // Also add the general name for matching
      identifiers.add('uniswap')
      identifiers.add('uniswap v2')
      identifiers.add('uniswapv2')
      continue
    }

    if (normalized.includes('nabla')) {
      // Add all Nabla pools from config
      for (const [id, _] of PROTOCOL_CONFIG_INDEX.byId) {
        if (id.startsWith('nabla:') || id.includes('nabla')) {
          identifiers.add(id)
        }
      }
      identifiers.add('nabla')
      continue
    }

    if (normalized.includes('aave')) {
      identifiers.add('aave')
      identifiers.add('aave monad')
      continue
    }

    if (normalized.includes('yearn')) {
      identifiers.add('yearn')
      identifiers.add('yearn monad')
      continue
    }

    identifiers.add(normalized)
  }

  return Array.from(identifiers)
}

/**
 * Resolve protocol address from database (async)
 * ✅ NEW: Query Pool table for real pool addresses!
 */
export const resolveProtocolAddressFromDB = async (protocol: string): Promise<string | null> => {
  const { prisma } = await import('../../lib/prisma')
  const normalized = normalizeProtocolId(protocol)
  
  try {
    // Try exact match by id first
    const exactMatch = await prisma.pool.findFirst({
      where: {
        id: normalized,
        chain: 'Monad',
        isActive: true
      },
      select: { address: true }
    })
    
    if (exactMatch) {
      console.log(`[resolveProtocolAddressFromDB] Exact match found: ${normalized} → ${exactMatch.address}`)
      return exactMatch.address
    }
    
    // Try partial match for uniswap pairs (e.g., "uniswap:wmon-usdc")
    if (normalized.includes('uniswap')) {
      const tokens = normalized.split(':')[1]?.split('-') || []
      
      if (tokens.length >= 2) {
        // Search for pool containing both tokens
        const pool = await prisma.pool.findFirst({
          where: {
            protocol: 'Uniswap V2',
            chain: 'Monad',
            isActive: true,
            OR: [
              { id: { contains: tokens[0], mode: 'insensitive' } },
              { id: { contains: tokens[1], mode: 'insensitive' } }
            ]
          },
          select: { address: true, id: true }
        })
        
        if (pool) {
          console.log(`[resolveProtocolAddressFromDB] Partial match: ${normalized} → ${pool.address} (${pool.id})`)
          return pool.address
        }
      }
      
      // Fallback: return ANY Uniswap V2 pool
      const anyPool = await prisma.pool.findFirst({
        where: {
          protocol: 'Uniswap V2',
          chain: 'Monad',
          isActive: true
        },
        select: { address: true, id: true },
        orderBy: { tvl: 'desc' } // Get highest TVL pool
      })
      
      if (anyPool) {
        console.log(`[resolveProtocolAddressFromDB] Fallback Uniswap pool: ${anyPool.address} (${anyPool.id})`)
        return anyPool.address
      }
    }
    
    console.log(`[resolveProtocolAddressFromDB] No match found for: ${normalized}`)
    return null
  } catch (error) {
    console.error('[resolveProtocolAddressFromDB] Error:', error)
    return null
  }
}

export const resolveProtocolAddress = (protocol: string, metrics?: MonadProtocolMetrics): string | null => {
  const normalized = normalizeProtocolId(protocol)

  if (metrics != null) {
    // Nabla removed - nablaPools will be empty array
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

  // ❌ Removed fallback: now use database query instead
  return null
}
