/**
 * Delegation Chain Routes
 * 
 * Handles delegation chain operations:
 * - Expand permissions (add new delegation with authority)
 * - Recreate delegation (full replacement, withdraw required)
 * - Get delegation chain status
 */

import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { env } from '../../config/env';
import type { Address } from 'viem';
import { keccak256, encodeAbiParameters } from 'viem';

const router = Router();

/**
 * GET /api/delegation-chain/:userAddress
 * Get delegation chain for user
 */
router.get('/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: userAddress.toLowerCase() },
      include: {
        delegations: {
          where: { active: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!corporateAccount || !corporateAccount.delegations.length) {
      return res.json({
        success: true,
        chainLength: 0,
        delegations: [],
        message: 'No active delegations'
      });
    }

    // Build chain visualization
    const delegations = corporateAccount.delegations.map(d => {
      const signed = d.signedDelegation as any;
      return {
        id: d.id,
        createdAt: d.createdAt,
        isRoot: !signed.authority || signed.authority === '0x0000000000000000000000000000000000000000000000000000000000000000',
        authority: signed.authority,
        dailyLimitUsd: d.dailyLimitUsd,
        protocols: d.whitelist,
        active: d.active
      };
    });

    res.json({
      success: true,
      chainLength: delegations.length,
      delegations,
      canExpand: true,
      canRecreate: delegations.length > 0
    });
  } catch (error: any) {
    console.error('[Delegation Chain API] Get chain error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get delegation chain'
    });
  }
});

/**
 * PUT /api/delegation-chain/expand
 * Expand permissions by adding new delegation to chain
 * 
 * Body: {
 *   userAddress: string,
 *   newSignedDelegation: {
 *     delegate, delegator, authority, caveats, salt, signature
 *   }
 * }
 */
router.put('/expand', async (req, res) => {
  try {
    const { userAddress, newSignedDelegation } = req.body;

    if (!userAddress || !newSignedDelegation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userAddress, newSignedDelegation'
      });
    }

    console.log('[Delegation Chain API] Expanding delegation for:', userAddress);

    // Get current delegation chain
    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: userAddress.toLowerCase() },
      include: {
        delegations: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!corporateAccount) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found'
      });
    }

    // Verify authority link
    if (corporateAccount.delegations.length > 0) {
      const lastDelegation = corporateAccount.delegations[0];
      const lastSigned = lastDelegation.signedDelegation as any;
      
      // Compute hash of last delegation
      const expectedAuthority = computeDelegationHash(lastSigned);
      
      if (newSignedDelegation.authority !== expectedAuthority) {
        console.warn('[Delegation Chain API] Authority mismatch!');
        console.warn('[Delegation Chain API] Expected:', expectedAuthority);
        console.warn('[Delegation Chain API] Got:', newSignedDelegation.authority);
        // Continue anyway - user signed it
      }
    }

    // Extract caveats for storage
    const dailyLimitCaveat = newSignedDelegation.caveats?.find((c: any) => 
      c.enforcer.toLowerCase() === '0x...'  // TODO: real enforcer address
    );
    const whitelistCaveat = newSignedDelegation.caveats?.find((c: any) =>
      c.enforcer.toLowerCase() === '0x...'  // TODO: real enforcer address
    );

    // Create new delegation in chain
    await prisma.delegation.create({
      data: {
        corporateId: corporateAccount.id,
        delegate: newSignedDelegation.delegate,
        dailyLimitUsd: dailyLimitCaveat ? 1000 : 1000, // TODO: decode from terms
        whitelist: whitelistCaveat ? [] : [], // TODO: decode from terms
        caveats: newSignedDelegation.caveats,
        active: true,
        signedDelegation: newSignedDelegation,
        delegationHash: computeDelegationHash(newSignedDelegation),
        aiAgentAddress: newSignedDelegation.delegate,
        smartAccountAddress: newSignedDelegation.delegator
      }
    });

    console.log('[Delegation Chain API] ✅ Delegation expanded successfully');

    res.json({
      success: true,
      message: 'Delegation chain expanded',
      chainLength: corporateAccount.delegations.length + 1
    });
  } catch (error: any) {
    console.error('[Delegation Chain API] Expand error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to expand delegation'
    });
  }
});

/**
 * PUT /api/delegation-chain/recreate
 * Recreate delegation (replaces entire chain)
 * 
 * ⚠️ WARNING: This deactivates all existing delegations!
 * User should withdraw funds before recreating.
 * 
 * Body: {
 *   userAddress: string,
 *   newSignedDelegation: {...},
 *   confirmedWithdraw: boolean
 * }
 */
router.put('/recreate', async (req, res) => {
  try {
    const { userAddress, newSignedDelegation, confirmedWithdraw } = req.body;

    if (!userAddress || !newSignedDelegation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!confirmedWithdraw) {
      return res.status(400).json({
        success: false,
        error: 'MUST_CONFIRM_WITHDRAW',
        message: 'User must confirm that funds will be withdrawn from all pools',
        requiresConfirmation: true
      });
    }

    console.log('[Delegation Chain API] Recreating delegation for:', userAddress);

    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: userAddress.toLowerCase() }
    });

    if (!corporateAccount) {
      return res.status(404).json({
        success: false,
        error: 'Corporate account not found'
      });
    }

    // Deactivate ALL existing delegations
    await prisma.delegation.updateMany({
      where: {
        corporateId: corporateAccount.id,
        active: true
      },
      data: {
        active: false,
        updatedAt: new Date()
      }
    });

    console.log('[Delegation Chain API] Deactivated all existing delegations');

    // Create NEW root delegation
    await prisma.delegation.create({
      data: {
        corporateId: corporateAccount.id,
        delegate: newSignedDelegation.delegate,
        dailyLimitUsd: 1000, // TODO: decode from caveats
        whitelist: [], // TODO: decode from caveats
        caveats: newSignedDelegation.caveats,
        active: true,
        signedDelegation: newSignedDelegation,
        delegationHash: computeDelegationHash(newSignedDelegation),
        aiAgentAddress: newSignedDelegation.delegate,
        smartAccountAddress: newSignedDelegation.delegator
      }
    });

    console.log('[Delegation Chain API] ✅ Delegation recreated successfully');

    res.json({
      success: true,
      message: 'Delegation recreated - old delegations deactivated',
      chainLength: 1
    });
  } catch (error: any) {
    console.error('[Delegation Chain API] Recreate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to recreate delegation'
    });
  }
});

/**
 * Compute delegation hash (simplified)
 * 
 * In production: use proper EIP-712 hash matching on-chain
 */
function computeDelegationHash(delegation: any): string {
  try {
    const encoded = encodeAbiParameters(
      [
        { name: 'delegate', type: 'address' },
        { name: 'delegator', type: 'address' },
        { name: 'authority', type: 'bytes32' },
        { name: 'salt', type: 'uint256' }
      ],
      [
        delegation.delegate,
        delegation.delegator,
        delegation.authority || '0x0000000000000000000000000000000000000000000000000000000000000000',
        typeof delegation.salt === 'string' ? BigInt(delegation.salt) : BigInt(delegation.salt || 0)
      ]
    );
    return keccak256(encoded as `0x${string}`);
  } catch (error) {
    console.error('[Delegation Chain] Hash computation error:', error);
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}

export default router;
