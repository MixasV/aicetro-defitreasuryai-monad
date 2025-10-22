/**
 * MetaMask Delegation Routes
 * 
 * Handles MetaMask Smart Account creation and delegation.
 * Works ALONGSIDE existing delegation system (not replacing it).
 */

import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { metaMaskDelegationService } from '../../services/metamask/metamask-delegation.service';
import { generateAIAgentAddress } from '../../utils/ai-agent-address';
import { getAddress, isAddress, type Address } from 'viem';
import { env } from '../../config/env';

const router = Router();

/**
 * POST /api/delegation/metamask/create-account
 * 
 * Step 1: Create MetaMask Smart Account for user
 * Returns predicted smart account address (no deployment yet)
 */
router.post('/metamask/create-account', async (req, res) => {
  try {
    let { userAddress } = req.body;

    if (!userAddress || typeof userAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Normalize to lowercase for validation (checksum-agnostic)
    const normalizedAddress = userAddress.toLowerCase();
    if (!isAddress(normalizedAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // Get checksummed address (EIP-55 compliant)
    const checksummedUserAddress = getAddress(normalizedAddress);
    console.log('[MetaMask Routes] Creating Smart Account for:', checksummedUserAddress);

    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }

    // Generate deterministic AI agent address
    const aiAgentAddress = generateAIAgentAddress(checksummedUserAddress, env.masterEncryptionPassword);

    // EIP-7702: No Smart Account creation needed, use EOA directly
    // For EIP-7702, the "smart account" IS the user's EOA after upgrade
    const smartAccountAddress = checksummedUserAddress;
    const implementation = 'eip7702'; // Stateless 7702 mode

    // Check if corporate account exists
    let corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: smartAccountAddress.toLowerCase() }
    });

    // Create corporate account if doesn't exist
    if (!corporateAccount) {
      corporateAccount = await prisma.corporateAccount.create({
        data: {
          address: smartAccountAddress.toLowerCase(),
          owners: [userAddress.toLowerCase()],
          threshold: 1,
          aiAgentAddress: aiAgentAddress,
          aiAgentName: 'AI Treasury Agent (MetaMask)',
        }
      });
    }

    console.log('[MetaMask Routes] Smart Account created:', {
      smartAccount: smartAccountAddress,
      aiAgent: aiAgentAddress,
      implementation
    });

    res.json({
      success: true,
      smartAccount: {
        address: smartAccountAddress,
        owner: userAddress,
        aiAgentAddress,
        implementation,
        deployed: false, // Will be deployed on first transaction
        delegationManager: metaMaskDelegationService.getDelegationManagerAddress(),
        entryPoint: metaMaskDelegationService.getEntryPointAddress()
      }
    });
  } catch (error: any) {
    console.error('[MetaMask Routes] Error creating Smart Account:', error);
    res.status(500).json({
      error: 'Failed to create Smart Account',
      message: error.message
    });
  }
});

/**
 * POST /api/delegation/metamask/create-delegation
 * 
 * Step 2: Create delegation structure
 * Returns unsigned delegation that user must sign with MetaMask
 */
router.post('/metamask/create-delegation', async (req, res) => {
  try {
    let {
      smartAccountAddress,
      dailyLimitUSD,
      maxRiskScore,
      allowedProtocols,
      validDays
    } = req.body;

    if (!smartAccountAddress || typeof smartAccountAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid smart account address' });
    }

    const normalizedAddress = smartAccountAddress.toLowerCase();
    if (!isAddress(normalizedAddress)) {
      return res.status(400).json({ error: 'Invalid smart account address' });
    }

    const checksummedSmartAccount = getAddress(normalizedAddress);

    console.log('[MetaMask Routes] Creating delegation for:', checksummedSmartAccount);

    // Get corporate account
    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: checksummedSmartAccount.toLowerCase() }
    });

    if (!corporateAccount) {
      return res.status(404).json({ error: 'Smart Account not found' });
    }

    const aiAgentAddress = corporateAccount.aiAgentAddress;

    // Import caveat builders for REAL restrictions
    const { combineCaveats } = require('../../services/metamask/caveat-enforcers');

    // Build REAL caveats with actual restrictions
    const caveats = combineCaveats(
      dailyLimitUSD || 1000,
      (allowedProtocols || []) as any,
      maxRiskScore || 3,
      validDays || 30
    );

    const delegation = {
      from: smartAccountAddress,
      to: aiAgentAddress,
      caveats: caveats,
      salt: Date.now(), // Unique salt to prevent replay
    };

    console.log('[MetaMask Routes] Delegation structure created with', caveats.length, 'caveats');

    res.json({
      success: true,
      delegation,
      restrictions: {
        dailyLimitUSD: dailyLimitUSD || 1000,
        maxRiskScore: maxRiskScore || 3,
        allowedProtocols: allowedProtocols || [],
        validDays: validDays || 30
      },
      instructions: {
        nextStep: 'Sign this delegation with MetaMask on frontend',
        endpoint: 'POST /api/delegation/metamask/save-delegation',
        requiredFields: ['signedDelegation', 'signature']
      }
    });
  } catch (error: any) {
    console.error('[MetaMask Routes] Error creating delegation:', error);
    res.status(500).json({
      error: 'Failed to create delegation',
      message: error.message
    });
  }
});

/**
 * POST /api/delegation/metamask/save-delegation
 * 
 * Step 3: Save signed delegation to database
 * User has signed delegation with MetaMask, now we store it
 */
router.post('/metamask/save-delegation', async (req, res) => {
  try {
    let {
      smartAccountAddress,
      signedDelegation,
      signature,
      dailyLimitUSD,
      maxRiskScore,
      allowedProtocols,
      validDays
    } = req.body;

    if (!smartAccountAddress || !signedDelegation || !signature) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['smartAccountAddress', 'signedDelegation', 'signature']
      });
    }

    if (typeof smartAccountAddress !== 'string') {
      return res.status(400).json({ error: 'Invalid smart account address' });
    }

    const normalizedAddress = smartAccountAddress.toLowerCase();
    if (!isAddress(normalizedAddress)) {
      return res.status(400).json({ error: 'Invalid smart account address' });
    }

    const checksummedSmartAccount = getAddress(normalizedAddress);
    console.log('[MetaMask Routes] Saving signed delegation for:', checksummedSmartAccount);

    // Get corporate account
    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: checksummedSmartAccount.toLowerCase() }
    });

    if (!corporateAccount) {
      return res.status(404).json({ error: 'Smart Account not found' });
    }

    if (!corporateAccount.aiAgentAddress) {
      return res.status(400).json({ error: 'AI agent address not set for this account' });
    }

    const aiAgentAddress = corporateAccount.aiAgentAddress;

    // Calculate expiry
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (validDays || 30));

    // Save to database with MetaMask flag
    const delegation = await prisma.delegation.upsert({
      where: {
        corporateId_delegate: {
          corporateId: corporateAccount.id,
          delegate: aiAgentAddress
        }
      },
      create: {
        corporateId: corporateAccount.id,
        delegate: aiAgentAddress,
        signedDelegation: {
          ...signedDelegation,
          signature,
          type: 'metamask', // Flag to distinguish from old delegations
        },
        delegationHash: signature,
        aiAgentAddress: aiAgentAddress,
        smartAccountAddress: smartAccountAddress.toLowerCase(),
        dailyLimitUsd: dailyLimitUSD || 1000,
        whitelist: allowedProtocols || [],
        autoExecutionEnabled: true,
        portfolioPercentage: 100,
        caveats: {
          maxRiskScore: maxRiskScore || 3,
          validDays: validDays || 30,
          validUntil: validUntil.toISOString(),
          mode: 'metamask',
          delegationManager: metaMaskDelegationService.getDelegationManagerAddress()
        },
        active: true
      },
      update: {
        signedDelegation: {
          ...signedDelegation,
          signature,
          type: 'metamask',
        },
        delegationHash: signature,
        aiAgentAddress: aiAgentAddress,
        dailyLimitUsd: dailyLimitUSD || 1000,
        whitelist: allowedProtocols || [],
        active: true
      }
    });

    console.log('[MetaMask Routes] Delegation saved:', delegation.id);

    res.json({
      success: true,
      delegation: {
        id: delegation.id,
        smartAccountAddress,
        aiAgentAddress,
        dailyLimitUSD: delegation.dailyLimitUsd,
        allowedProtocols: delegation.whitelist,
        validUntil: validUntil.toISOString(),
        active: true,
        type: 'metamask',
        delegationManager: metaMaskDelegationService.getDelegationManagerAddress()
      },
      message: 'MetaMask delegation created successfully'
    });
  } catch (error: any) {
    console.error('[MetaMask Routes] Error saving delegation:', error);
    res.status(500).json({
      error: 'Failed to save delegation',
      message: error.message
    });
  }
});

/**
 * GET /api/delegation/metamask/:smartAccountAddress
 * 
 * Get MetaMask delegation status
 */
router.get('/metamask/:smartAccountAddress', async (req, res) => {
  try {
    const { smartAccountAddress } = req.params;

    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: smartAccountAddress.toLowerCase() }
    });

    if (!corporateAccount) {
      return res.json({
        exists: false,
        delegation: null
      });
    }

    const delegation = await prisma.delegation.findFirst({
      where: {
        corporateId: corporateAccount.id,
        active: true
      }
    });

    if (!delegation) {
      return res.json({
        exists: false,
        delegation: null
      });
    }

    res.json({
      exists: true,
      delegation: {
        id: delegation.id,
        smartAccountAddress,
        aiAgentAddress: delegation.aiAgentAddress,
        dailyLimitUSD: delegation.dailyLimitUsd,
        allowedProtocols: delegation.whitelist,
        active: delegation.active,
        type: (delegation.caveats as any)?.mode || 'legacy',
        autoExecutionEnabled: delegation.autoExecutionEnabled
      }
    });
  } catch (error: any) {
    console.error('[MetaMask Routes] Error getting delegation:', error);
    res.status(500).json({
      error: 'Failed to get delegation',
      message: error.message
    });
  }
});

export default router;
