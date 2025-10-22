/**
 * Caveat Enforcers for MetaMask Delegation
 * 
 * These encode restrictions (daily limits, protocol whitelist) into delegations.
 * Enforcers are smart contracts deployed on-chain that validate execution conditions.
 */

import { type Address, type Hex, encodePacked, keccak256, toHex } from 'viem'

/**
 * Daily Limit Enforcer
 * 
 * Restricts AI agent to spend maximum dailyLimitUSD per day.
 * Tracks spending via DelegationManager state.
 */
export interface DailyLimitCaveat {
  enforcer: Address
  terms: Hex
  args?: Hex
}

/**
 * Encode daily limit into caveat terms
 * 
 * @param dailyLimitUSD - Maximum USD to spend per day (in wei, 18 decimals)
 * @returns Encoded terms for DailyLimitEnforcer
 */
export function encodeDailyLimit(dailyLimitUSD: number): Hex {
  // Convert USD to wei (18 decimals)
  const limitWei = BigInt(Math.floor(dailyLimitUSD * 1e18))
  
  // Encode as uint256
  return toHex(limitWei, { size: 32 })
}

/**
 * Create DailyLimit caveat
 * 
 * NOTE: DailyLimitEnforcer must be deployed on-chain first.
 * For now, using DelegationManager as enforcer (simplified version).
 */
export function createDailyLimitCaveat(
  dailyLimitUSD: number,
  enforcerAddress?: Address
): DailyLimitCaveat {
  return {
    enforcer: enforcerAddress || '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a', // DelegationManager
    terms: encodeDailyLimit(dailyLimitUSD),
    args: '0x'
  }
}

/**
 * Protocol Whitelist Enforcer
 * 
 * Restricts AI agent to interact only with approved protocols.
 */
export interface ProtocolWhitelistCaveat {
  enforcer: Address
  terms: Hex
  args?: Hex
}

/**
 * Encode protocol whitelist into caveat terms
 * 
 * @param allowedProtocols - Array of protocol addresses
 * @returns Encoded terms for ProtocolWhitelistEnforcer
 */
export function encodeProtocolWhitelist(allowedProtocols: Address[]): Hex {
  if (allowedProtocols.length === 0) {
    return '0x'
  }

  // Encode as address[] (dynamic array)
  // Format: [length (32 bytes)][address1 (32 bytes)][address2 (32 bytes)]...
  const lengthHex = toHex(allowedProtocols.length, { size: 32 })
  
  const addressesHex = allowedProtocols
    .map(addr => addr.toLowerCase().padStart(64, '0').replace('0x', ''))
    .join('')

  return `0x${lengthHex.slice(2)}${addressesHex}` as Hex
}

/**
 * Create ProtocolWhitelist caveat
 * 
 * NOTE: ProtocolWhitelistEnforcer must be deployed on-chain first.
 * For now, using DelegationManager as enforcer (simplified version).
 */
export function createProtocolWhitelistCaveat(
  allowedProtocols: Address[],
  enforcerAddress?: Address
): ProtocolWhitelistCaveat {
  return {
    enforcer: enforcerAddress || '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a', // DelegationManager
    terms: encodeProtocolWhitelist(allowedProtocols),
    args: '0x'
  }
}

/**
 * Risk Score Limit Enforcer
 * 
 * Restricts AI agent to protocols with risk score <= maxRiskScore.
 */
export interface RiskScoreCaveat {
  enforcer: Address
  terms: Hex
  args?: Hex
}

/**
 * Encode max risk score into caveat terms
 * 
 * @param maxRiskScore - Maximum allowed risk score (1-5)
 * @returns Encoded terms for RiskScoreEnforcer
 */
export function encodeMaxRiskScore(maxRiskScore: number): Hex {
  // Clamp to 1-5 range
  const clampedScore = Math.max(1, Math.min(5, maxRiskScore))
  
  // Encode as uint8
  return toHex(clampedScore, { size: 32 })
}

/**
 * Create RiskScore caveat
 */
export function createRiskScoreCaveat(
  maxRiskScore: number,
  enforcerAddress?: Address
): RiskScoreCaveat {
  return {
    enforcer: enforcerAddress || '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a', // DelegationManager
    terms: encodeMaxRiskScore(maxRiskScore),
    args: '0x'
  }
}

/**
 * Time Window Enforcer
 * 
 * Restricts AI agent to execute only within specified time window.
 */
export interface TimeWindowCaveat {
  enforcer: Address
  terms: Hex
  args?: Hex
}

/**
 * Encode time window into caveat terms
 * 
 * @param startTime - Unix timestamp (seconds)
 * @param endTime - Unix timestamp (seconds)
 * @returns Encoded terms for TimeWindowEnforcer
 */
export function encodeTimeWindow(startTime: number, endTime: number): Hex {
  // Encode as [uint256 startTime][uint256 endTime]
  const startHex = toHex(startTime, { size: 32 }).slice(2)
  const endHex = toHex(endTime, { size: 32 }).slice(2)
  
  return `0x${startHex}${endHex}` as Hex
}

/**
 * Create TimeWindow caveat (valid for N days)
 */
export function createTimeWindowCaveat(
  validDays: number,
  enforcerAddress?: Address
): TimeWindowCaveat {
  const now = Math.floor(Date.now() / 1000)
  const endTime = now + (validDays * 24 * 60 * 60)

  return {
    enforcer: enforcerAddress || '0xFe66de7d0E0DF2Ef3e343ee6511dA27d149d8e2a', // DelegationManager
    terms: encodeTimeWindow(now, endTime),
    args: '0x'
  }
}

/**
 * Combine multiple caveats into delegation
 */
export function combineCaveats(
  dailyLimitUSD?: number,
  allowedProtocols?: Address[],
  maxRiskScore?: number,
  validDays?: number
): Array<DailyLimitCaveat | ProtocolWhitelistCaveat | RiskScoreCaveat | TimeWindowCaveat> {
  const caveats = []

  if (dailyLimitUSD) {
    caveats.push(createDailyLimitCaveat(dailyLimitUSD))
  }

  if (allowedProtocols && allowedProtocols.length > 0) {
    caveats.push(createProtocolWhitelistCaveat(allowedProtocols))
  }

  if (maxRiskScore) {
    caveats.push(createRiskScoreCaveat(maxRiskScore))
  }

  if (validDays) {
    caveats.push(createTimeWindowCaveat(validDays))
  }

  return caveats
}
