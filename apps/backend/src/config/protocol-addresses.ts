/**
 * Protocol and Token Addresses on Monad Testnet
 * 
 * Centralized configuration for all protocol contracts and tokens.
 * Used by ERC-4337 UserOperation service.
 */

import type { Address } from 'viem'

/**
 * Token addresses on Monad Testnet
 */
export const TOKEN_ADDRESSES = {
  USDC: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea' as Address,
  USDT: '0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149' as Address,
  DAI: '0x0000000000000000000000000000000000000000' as Address, // TODO: Get real DAI address
  WBTC: '0x0000000000000000000000000000000000000000' as Address, // TODO: Get real WBTC address
  WMON: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701' as Address,
} as const

/**
 * Aave protocol addresses on Monad Testnet
 */
export const AAVE_ADDRESSES = {
  // Using addresses from pools.data.ts
  POOL: '0x1111111111111111111111111111111111111111' as Address,
  
  // Per-token pools
  USDC_POOL: '0x1111111111111111111111111111111111111111' as Address,
  USDT_POOL: '0x1111111111111111111111111111111111111112' as Address,
} as const

/**
 * Yearn protocol addresses on Monad Testnet
 */
export const YEARN_ADDRESSES = {
  // Using addresses from pools.data.ts
  ROUTER: '0x2222222222222222222222222222222222222220' as Address,
  
  // Per-token vaults
  USDC_VAULT: '0x2222222222222222222222222222222222222221' as Address,
  USDT_VAULT: '0x2222222222222222222222222222222222222222' as Address,
} as const

/**
 * Nabla protocol addresses on Monad Testnet
 */
export const NABLA_ADDRESSES = {
  // Using addresses from protocols.monad.ts
  ROUTER: '0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426' as Address, // USDC pool as router
  
  // Per-token pools
  USDC_POOL: '0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426' as Address,
  USDT_POOL: '0x356Fa6Db41717eccE81e7732A42eB4E99AE0D7D9' as Address,
  WBTC_POOL: '0x5b90901818F0d92825F8b19409323C82ABe911FC' as Address,
} as const

/**
 * Uniswap addresses on Monad Testnet
 */
export const UNISWAP_V2_ADDRESSES = {
  FACTORY: '0x733e88f248b742db6c14c0b1713af5ad7fdd59d0' as Address,
  ROUTER_V2: '0x0000000000000000000000000000000000000000' as Address, // V2 Router (if exists)
  UNIVERSAL_ROUTER: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD' as Address, // Universal Router (deterministic deployment)
  
  // Pairs (can swap directly without router)
  USDC_USDT_PAIR: '0x3D44D591C8FC89daE3bc5f312c67CA0b44497b86' as Address,
  USDC_WMON_PAIR: '0x5323821dE342c56b80c99fbc7cD725f2da8eB87B' as Address,
  ETH_WMON_PAIR: '0x0b924f975f67632c1b8af61b5b63415976a88791' as Address, // From GeckoTerminal
  WMON_USDC_PAIR: '0x5323821dE342c56b80c99fbc7cD725f2da8eB87B' as Address, // Same as USDC_WMON_PAIR
} as const

/**
 * NOTE: Uniswap on Monad uses Universal Router (not V2 Router)
 * 
 * Universal Router supports:
 * - V2 swaps
 * - V3 swaps  
 * - Permit2
 * - NFT trades
 * 
 * For swapping MON → USDC, use Universal Router with V2_SWAP_EXACT_IN command
 */

/**
 * Get protocol address by name
 */
export function getProtocolAddress(protocol: string): Address {
  const normalized = protocol.toLowerCase()
  
  if (normalized.includes('aave')) {
    return AAVE_ADDRESSES.POOL
  }
  
  if (normalized.includes('yearn')) {
    return YEARN_ADDRESSES.ROUTER
  }
  
  if (normalized.includes('nabla')) {
    return NABLA_ADDRESSES.ROUTER
  }
  
  if (normalized.includes('uniswap')) {
    return UNISWAP_V2_ADDRESSES.UNIVERSAL_ROUTER
  }
  
  throw new Error(`Unknown protocol: ${protocol}`)
}

/**
 * Get token address by symbol
 */
export function getTokenAddress(symbol: string): Address {
  const normalized = symbol.toUpperCase()
  
  if (normalized === 'USDC') return TOKEN_ADDRESSES.USDC
  if (normalized === 'USDT') return TOKEN_ADDRESSES.USDT
  if (normalized === 'DAI') return TOKEN_ADDRESSES.DAI
  if (normalized === 'WBTC') return TOKEN_ADDRESSES.WBTC
  if (normalized === 'WMON') return TOKEN_ADDRESSES.WMON
  
  throw new Error(`Unknown token: ${symbol}`)
}

/**
 * Get pool address for specific protocol+token combination
 */
export function getPoolAddress(protocol: string, token: string): Address {
  const protocolNorm = protocol.toLowerCase()
  const tokenNorm = token.toUpperCase()
  
  // Aave pools
  if (protocolNorm.includes('aave')) {
    if (tokenNorm === 'USDC') return AAVE_ADDRESSES.USDC_POOL
    if (tokenNorm === 'USDT') return AAVE_ADDRESSES.USDT_POOL
  }
  
  // Yearn vaults
  if (protocolNorm.includes('yearn')) {
    if (tokenNorm === 'USDC') return YEARN_ADDRESSES.USDC_VAULT
    if (tokenNorm === 'USDT') return YEARN_ADDRESSES.USDT_VAULT
  }
  
  // Nabla pools
  if (protocolNorm.includes('nabla')) {
    if (tokenNorm === 'USDC') return NABLA_ADDRESSES.USDC_POOL
    if (tokenNorm === 'USDT') return NABLA_ADDRESSES.USDT_POOL
    if (tokenNorm === 'WBTC') return NABLA_ADDRESSES.WBTC_POOL
  }
  
  // Fallback to protocol router
  return getProtocolAddress(protocol)
}
