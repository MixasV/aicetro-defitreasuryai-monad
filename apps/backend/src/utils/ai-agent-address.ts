/**
 * AI Agent Address Generation
 * 
 * Generates AI agent address from private key (derived deterministically).
 * Private key is generated from user address + master password.
 */

import { type Address } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { generateAIAgentPrivateKey } from './encryption'

/**
 * Generate deterministic AI agent address for a user
 * 
 * Properties:
 * - Deterministic: Same user + same master password = same address
 * - Unique: Each user gets different AI agent
 * - Has private key: Can sign redemptions
 * - Secure: Key derived from master password
 * 
 * @param userAddress - User's EOA address
 * @param masterPassword - Master password from ENV
 * @returns AI agent address (from deterministic key)
 */
export function generateAIAgentAddress(userAddress: string, masterPassword: string): Address {
  // Generate deterministic private key
  const privateKey = generateAIAgentPrivateKey(userAddress, masterPassword)
  
  // Derive address from private key
  const aiAgentAddress = privateKeyToAddress(privateKey as `0x${string}`)
  
  console.log('[AIAgent] Generated address for user:', {
    user: userAddress,
    aiAgent: aiAgentAddress,
    method: 'deterministic key derivation (scrypt)'
  })
  
  return aiAgentAddress
}

/**
 * Verify AI agent address belongs to user
 * 
 * @param userAddress - User's EOA address
 * @param aiAgentAddress - AI agent address to verify
 * @param masterPassword - Master password from ENV
 * @returns true if AI agent belongs to user
 */
export function verifyAIAgentAddress(
  userAddress: string,
  aiAgentAddress: string,
  masterPassword: string
): boolean {
  const expected = generateAIAgentAddress(userAddress, masterPassword)
  return expected.toLowerCase() === aiAgentAddress.toLowerCase()
}
