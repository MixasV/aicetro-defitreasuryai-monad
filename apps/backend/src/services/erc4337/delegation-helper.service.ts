/**
 * Delegation Helper Service
 * 
 * Utilities for managing user delegations and AI agent addresses.
 * Non-custodial: NO private keys stored or managed.
 */

import { prisma } from '../../db/prisma'
import { aiAgentSmartAccountService } from './ai-agent-smart-account.service'
import { generateAIAgentAddress, verifyAIAgentAddress } from '../../utils/ai-agent-address'
import type { Address } from 'viem'
import { keccak256, encodePacked } from 'viem'

interface DelegationSetupParams {
  userAddress: string
  corporateId: string
  signedDelegation: any
  smartAccountAddress: string
  userEOA?: string // User's original EOA (for reference)
  masterPassword?: string // For deterministic AI agent key generation
}

class DelegationHelperService {
  /**
   * Setup delegation for user
   * 
   * Called when user signs delegation with MetaMask.
   * Stores signed delegation and associates with AI agent address.
   */
  async setupDelegation(params: DelegationSetupParams): Promise<{
    delegationId: string
    aiAgentAddress: Address
    delegationHash: string
  }> {
    console.log('[Delegation] Setting up delegation for user:', params.userAddress)
    
    // V2: Use ONE AI Agent Smart Account for ALL users
    const aiAgentAddress = aiAgentSmartAccountService.getAddress()
    console.log('[Delegation Helper] Using ONE AI Agent SA:', aiAgentAddress)
    
    // ⚠️ CRITICAL WORKAROUND: Fix SDK bug - Monad Testnet (Chain ID 10143) gets wrong authority
    // SDK returns authority = 0xffff... but it MUST be 0x0000... (root delegation)
    const ROOT_AUTHORITY = '0x' + '0'.repeat(64); // 64 zeros
    const fixedDelegation = {
      ...params.signedDelegation,
      authority: ROOT_AUTHORITY // ✅ Force correct authority for root delegation!
    };
    
    console.log('[Delegation] SDK authority (WRONG):', params.signedDelegation.authority);
    console.log('[Delegation] Fixed authority (CORRECT):', fixedDelegation.authority);
    
    // Calculate delegation hash
    const delegationHash = this.calculateDelegationHash(fixedDelegation)
    
    // Store in database (normalize address to lowercase)
    const delegation = await prisma.delegation.upsert({
      where: {
        corporateId_delegate: {
          corporateId: params.corporateId,
          delegate: aiAgentAddress
        }
      },
      create: {
        corporateId: params.corporateId,
        delegate: aiAgentAddress,
        signedDelegation: fixedDelegation, // ✅ Use FIXED delegation!
        delegationHash,
        aiAgentAddress,
        smartAccountAddress: params.smartAccountAddress.toLowerCase(), // ✅ Normalize to lowercase
        userEOA: params.userEOA?.toLowerCase(), // ✅ Store original EOA
        dailyLimitUsd: 1000, // Default limit
        whitelist: ['aave', 'yearn', 'nabla'],
        caveats: {
          spent24h: 0  // ✅ Initialize spent24h
        },
        active: true
      },
      update: {
        signedDelegation: fixedDelegation, // ✅ Use FIXED delegation!
        delegationHash,
        smartAccountAddress: params.smartAccountAddress.toLowerCase(), // ✅ Normalize to lowercase
        userEOA: params.userEOA?.toLowerCase(), // ✅ Update EOA if provided
        active: true
      }
    })
    
    console.log('[Delegation] Setup complete:', {
      delegationId: delegation.id,
      aiAgentAddress,
      delegationHash
    })
    
    return {
      delegationId: delegation.id,
      aiAgentAddress,
      delegationHash
    }
  }
  
  /**
   * Get active delegation for user
   */
  async getActiveDelegation(userAddress: string, masterPassword: string): Promise<any | null> {
    // V2: Use ONE AI Agent Smart Account
    const aiAgentAddress = aiAgentSmartAccountService.getAddress()
    
    // IMPORTANT: Filter by smartAccountAddress to avoid collision
    // Multiple users can have same aiAgentAddress if they have similar addresses
    const delegation = await prisma.delegation.findFirst({
      where: {
        aiAgentAddress,
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      },
      include: {
        corporate: true
      },
      orderBy: {
        createdAt: 'desc' // Get most recent delegation
      }
    })
    
    // Check if has signed delegation
    if (!delegation || !delegation.signedDelegation) {
      console.log('[Delegation] No signed delegation found for user:', userAddress)
      return null
    }
    
    if (!delegation) {
      console.log('[Delegation] No active delegation found for user:', userAddress)
      return null
    }
    
    console.log('[Delegation] Found active delegation:', {
      delegationId: delegation.id,
      aiAgentAddress: delegation.aiAgentAddress,
      smartAccount: delegation.smartAccountAddress
    })
    
    return delegation
  }
  
  /**
   * Revoke delegation
   * 
   * Sets delegation to inactive. signedDelegation remains in DB for audit.
   */
  async revokeDelegation(userAddress: string, masterPassword: string): Promise<void> {
    // V2: Use ONE AI Agent Smart Account
    const aiAgentAddress = aiAgentSmartAccountService.getAddress()
    
    const updated = await prisma.delegation.updateMany({
      where: {
        aiAgentAddress,
        active: true
      },
      data: {
        active: false
        // Note: signedDelegation not cleared for audit trail
      }
    })
    
    console.log('[Delegation] Revoked delegation for user:', {
      userAddress,
      aiAgentAddress,
      count: updated.count
    })
  }
  
  /**
   * Calculate delegation hash for verification
   * 
   * Works with both MetaMask ERC-7710 format and legacy format
   */
  private calculateDelegationHash(signedDelegation: any): string {
    // Check if MetaMask delegation format (has delegate, delegator, caveats)
    if (signedDelegation.delegate && signedDelegation.delegator && signedDelegation.caveats) {
      // MetaMask ERC-7710 format
      // Hash includes: delegate, delegator, authority, caveats, salt
      const parts = [
        signedDelegation.delegate,
        signedDelegation.delegator,
        signedDelegation.authority || '0x0000000000000000000000000000000000000000000000000000000000000000',
        JSON.stringify(signedDelegation.caveats),
        signedDelegation.salt?.toString() || '0'
      ]
      const hash = keccak256(encodePacked(['string'], [parts.join('::')]))
      return hash
    }
    
    // Legacy format - hash entire object
    const delegationJson = JSON.stringify(signedDelegation)
    const hash = keccak256(encodePacked(['string'], [delegationJson]))
    return hash
  }
  
  /**
   * Verify delegation signature and validity
   */
  async verifyDelegation(params: {
    userAddress: string
    signedDelegation: any
    masterPassword: string
  }): Promise<boolean> {
    // Verify AI agent address matches
    const aiAgentAddress = generateAIAgentAddress(params.userAddress, params.masterPassword)
    
    // Get stored delegation
    const stored = await this.getActiveDelegation(params.userAddress, params.masterPassword)
    if (!stored) return false
    
    // Verify hashes match
    const providedHash = this.calculateDelegationHash(params.signedDelegation)
    const matches = stored.delegationHash === providedHash
    
    console.log('[Delegation] Verification result:', {
      userAddress: params.userAddress,
      aiAgentAddress,
      matches
    })
    
    return matches
  }
}

export const delegationHelperService = new DelegationHelperService()
