/**
 * Simple Delegation Routes
 * 
 * Lightweight delegation for individual users without Smart Account.
 * Uses the same ERC-4337 delegation architecture as Corporate mode.
 */

import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { delegationHelperService } from '../../services/erc4337/delegation-helper.service';
import { smartAccountDelegationService } from '../../services/erc4337/smart-account-delegation.service';
import { aiAgentSmartAccountService } from '../../services/erc4337/ai-agent-smart-account.service';
import { generateAIAgentAddress } from '../../utils/ai-agent-address';
import { generateAIAgentPrivateKey, encryptPrivateKey, testEncryption } from '../../utils/encryption';
import { isMetaMaskDelegation, extractCaveatTerms } from '../../utils/delegation-decode';
import { env } from '../../config/env';
import type { Address } from 'viem';

const router = Router();

interface SimpleDelegationRequest {
  userAddress: string;  // Smart Account address (delegator)
  eoaOwner?: string;    // EOA owner address (for AI agent generation)
  smartAccount?: string; // Optional Smart Account address (deprecated, use userAddress)
  dailyLimitUSD: number;
  maxRiskScore: number;
  allowedProtocols: string[];
  validDays: number;
  signedDelegation: any; // MetaMask ERC-7710 delegation with signature
  selectedNetworks?: any[]; // Networks & tokens selected for AI management
  managedAssetsUSD?: number; // Total managed assets USD
}

/**
 * GET /api/delegation/ai-agent-address/:userAddress
 * Get AI agent address for user (ONE AI Agent SA for ALL users)
 * 
 * @changed 2025-01-19 - Returns ONE AI Agent SA address instead of per-user address
 */
router.get('/ai-agent-address/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    // V2: Return ONE AI Agent Smart Account for ALL users
    const aiAgentAddress = aiAgentSmartAccountService.getAddress();
    
    console.log('[AI Agent API] Returning ONE AI Agent SA:', {
      user: userAddress,
      aiAgent: aiAgentAddress,
      note: 'Same AI Agent for all users (Gas Manager sponsors)'
    });

    res.json({
      aiAgentAddress,
      userAddress
    });
  } catch (error: any) {
    console.error('[AI Agent Address] Error:', error);
    res.status(500).json({
      error: 'Failed to get AI agent address',
      message: error.message
    });
  }
});

/**
 * POST /api/delegation/simple
 * Create simple delegation (signed by user via MetaMask)
 * 
 * Flow:
 * 1. Frontend prompts user to sign delegation with MetaMask
 * 2. Frontend sends signed delegation to this endpoint
 * 3. Backend stores signed delegation (no private keys!)
 * 4. AI agent can now execute within limits
 */
router.post('/simple', async (req, res) => {
  try {
    const {
      userAddress,
      eoaOwner,
      smartAccount,
      dailyLimitUSD,
      maxRiskScore,
      allowedProtocols,
      validDays,
      signedDelegation,
      selectedNetworks,
      managedAssetsUSD
    } = req.body as SimpleDelegationRequest;

    // Validate input
    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    if (!signedDelegation) {
      return res.status(400).json({ error: 'Signed delegation required. User must sign with MetaMask.' });
    }

    if (!dailyLimitUSD || dailyLimitUSD < 100 || dailyLimitUSD > 1000000) {
      return res.status(400).json({ error: 'Daily limit must be between $100 and $1,000,000' });
    }

    if (!maxRiskScore || maxRiskScore < 1 || maxRiskScore > 5) {
      return res.status(400).json({ error: 'Risk score must be between 1 and 5' });
    }

    if (!allowedProtocols || allowedProtocols.length === 0) {
      return res.status(400).json({ error: 'At least one protocol must be selected' });
    }

    if (!validDays || validDays < 1 || validDays > 365) {
      return res.status(400).json({ error: 'Validity must be between 1 and 365 days' });
    }

    console.log('[Simple Delegation] Creating for User EOA:', userAddress);
    console.log('[Simple Delegation] EOA Owner:', eoaOwner);

    // Get AI Agent SA address (delegate)
    const aiAgentAddress = aiAgentSmartAccountService.getAddress();
    
    console.log('[Simple Delegation] Architecture:', {
      userEOA: userAddress,
      aiAgentSA: aiAgentAddress,
      flow: 'User SA (counterfactual) → Delegation → Deploy on first UserOp'
    });

    // ⚠️ STEP 1: Get or Create User Smart Account
    const userEOA = userAddress.toLowerCase() as `0x${string}`;
    
    console.log('[Simple Delegation] STEP 1: Getting or creating User Smart Account...')
    console.log('[Simple Delegation] ⚠️ Frontend salt IGNORED - using deterministic salt')
    
    // Import User SA service
    const { userSmartAccountService } = await import('../../services/erc4337/user-smart-account.service')
    
    // ✅ ALWAYS get existing SA (or create with deterministic salt)
    // We IGNORE frontend salt to ensure ONE SA per user!
    const userSAConfig = await userSmartAccountService.getUserSmartAccount(userEOA)
    
    if (!userSAConfig) {
      return res.status(500).json({ 
        error: 'Failed to get User Smart Account',
        message: 'Could not get or create Smart Account for user'
      })
    }
    
    console.log('[Simple Delegation] User Smart Account:', {
      userEOA,
      smartAccount: userSAConfig.smartAccountAddress,
      isDeployed: userSAConfig.isDeployed,
      note: 'Using deterministic salt (ONE SA per user)'
    })
    
    // ✅ STEP 2: Deploy User Smart Account NOW (before delegation!)
    // This prevents AA23 errors when AI tries to execute
    console.log('[Simple Delegation] STEP 2: Deploying User Smart Account...')
    
    if (!userSAConfig.isDeployed) {
      const deployResult = await userSmartAccountService.deployUserSmartAccount(userEOA)
      
      if (!deployResult.success) {
        console.error('[Simple Delegation] Deployment failed:', deployResult.error)
        return res.status(500).json({
          error: 'Failed to deploy Smart Account',
          message: deployResult.error || 'Deployment transaction failed'
        })
      }
      
      console.log('[Simple Delegation] ✅ User Smart Account deployed!')
      console.log('[Simple Delegation] TX:', deployResult.txHash)
    } else {
      console.log('[Simple Delegation] ✅ User Smart Account already deployed')
    }
    
    // Use User's Smart Account address as delegator
    const accountAddress = userSAConfig.smartAccountAddress.toLowerCase();
    
    // Check if corporate account exists for this EOA
    let corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: accountAddress },
    });

    // Create corporate account if doesn't exist (Simple Mode = single owner)
    if (!corporateAccount) {
      corporateAccount = await prisma.corporateAccount.create({
        data: {
          address: accountAddress, // ✅ EOA address, not Smart Account!
          owners: [userAddress.toLowerCase()], // EOA is owner of itself
          threshold: 1, // No multisig
          aiAgentName: 'AI Treasury Agent (EIP-7702)',
        },
      });
      console.log('[Simple Delegation] Created CorporateAccount for EOA:', accountAddress)
    }

    // Calculate expiry
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // V2: No need to generate per-user AI agent key
    // ONE AI Agent SA already has deployer private key
    console.log('[Simple Delegation] Skipping AI agent key generation (V2: using ONE AI Agent SA)');
    
    // ⚠️ STEP 3: Save User SA address for redemption
    // This will be used as UserOp sender during redemption
    console.log('[Simple Delegation] STEP 3: Saving User SA address for redemption')
    console.log('[Simple Delegation] User SA will be sender of UserOp:', userSAConfig.smartAccountAddress)
    
    // Check if MetaMask ERC-7710 delegation format
    let finalDailyLimit = dailyLimitUSD;
    let finalProtocols = allowedProtocols;
    let finalMaxRisk = maxRiskScore;
    let finalValidDays = validDays;
    let finalSelectedNetworks = selectedNetworks || [];
    let finalManagedAssets = managedAssetsUSD || 0;
    
    if (isMetaMaskDelegation(signedDelegation)) {
      console.log('[Simple Delegation] ✅ MetaMask ERC-7710 delegation detected');
      
      // Extract caveat terms from delegation
      const terms = extractCaveatTerms(signedDelegation);
      if (terms) {
        console.log('[Simple Delegation] Decoded caveat terms:', terms);
        
        // Use values from delegation (more authoritative than request body)
        finalDailyLimit = terms.dailyLimitUsd;
        finalProtocols = terms.protocolWhitelist;
        finalMaxRisk = terms.maxRiskScore;
        finalValidDays = terms.validDays;
        finalSelectedNetworks = terms.selectedNetworks;
        finalManagedAssets = terms.managedAssetsUSD;
        
        // Mark as MetaMask delegation
        signedDelegation.type = 'metamask';
      }
    } else {
      console.log('[Simple Delegation] Legacy delegation format detected');
      // Mark as legacy
      if (typeof signedDelegation === 'object') {
        signedDelegation.type = 'legacy';
      }
    }
    
    // Use delegation helper service (EIP-7702 mode)
    const result = await delegationHelperService.setupDelegation({
      userAddress: accountAddress,  // ✅ User Smart Account address
      corporateId: corporateAccount.id,
      signedDelegation,
      smartAccountAddress: userSAConfig.smartAccountAddress, // Smart Account address
      userEOA: userEOA, // ✅ Original EOA
      masterPassword: env.masterEncryptionPassword // For deterministic AI agent key
    });

    // Update delegation limits + AUTO-ENABLE execution
    await prisma.delegation.update({
      where: {
        corporateId_delegate: {
          corporateId: corporateAccount.id,
          delegate: aiAgentAddress
        }
      },
      data: {
        dailyLimitUsd: finalDailyLimit,
        whitelist: finalProtocols,
        autoExecutionEnabled: true,  // ✅ AUTO-ENABLE by default!
        portfolioPercentage: req.body.portfolioPercentage || 100, // % от ВСЕГО портфеля который user выбрал
        aiAgentPrivateKeyEncrypted: null, // V2: Not used (ONE AI Agent SA)
        deploySalt: null, // ✅ NOT used anymore (deterministic salt in service)
        caveats: {
          maxRiskScore: finalMaxRisk,
          validDays: finalValidDays,
          validUntil: validUntil.toISOString(),
          mode: 'hybrid', // ✅ Hybrid Smart Account mode!
          selectedNetworks: finalSelectedNetworks, // Networks/tokens for AI management
          managedAssetsUSD: finalManagedAssets // Total managed assets
        }
      }
    });

    console.log('[Simple Delegation] Setup complete:', {
      userAddress,
      aiAgentAddress,
      delegationId: result.delegationId
    });

    // ✅ REMOVED AUTO-START AI EXECUTION
    // Frontend will call /api/ai/execute-now/:address AFTER transferring funds
    // This prevents AI from checking zero balance before funds arrive
    console.log('[Simple Delegation] ⚠️ Skipping auto-start AI - frontend will trigger after funds transfer');

    res.json({
      success: true,
      delegation: {
        id: result.delegationId,
        userAddress,
        userSmartAccount: userSAConfig.smartAccountAddress, // ✅ User Smart Account address
        userEOA: userEOA, // ✅ Original EOA
        aiAgentAddress,
        delegationHash: result.delegationHash,
        dailyLimitUSD,
        maxRiskScore,
        allowedProtocols,
        validUntil: validUntil.toISOString(),
        active: true,
        aiExecutionStarted: false, // ✅ Frontend must trigger after funds transfer
        message: 'Delegation created - transfer funds to User SA, then trigger AI execution'
      },
    });
  } catch (error: any) {
    console.error('[Simple Delegation] Error:', error);
    res.status(500).json({
      error: 'Failed to create delegation',
      message: error.message,
    });
  }
});

/**
 * POST /api/delegation/simple/revoke
 * Revoke simple delegation
 */
router.post('/simple/revoke', async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress required' });
    }

    console.log('[Simple Delegation] Revoking for user:', userAddress);

    // Use delegation helper service
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }
    await delegationHelperService.revokeDelegation(userAddress, env.masterEncryptionPassword);

    res.json({
      success: true,
      message: 'Delegation revoked - AI agent can no longer execute',
    });
  } catch (error: any) {
    console.error('[Simple Delegation] Revoke error:', error);
    res.status(500).json({
      error: 'Failed to revoke delegation',
      message: error.message,
    });
  }
});

/**
 * GET /api/delegation/:userAddress
 * Get delegation status (proxies to simple mode)
 * userAddress can be EITHER EOA (owner) OR Smart Account address
 */
router.get('/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    console.log('[Delegation] Getting status for:', userAddress);

    // FIRST: Try to find delegation by Smart Account address (most common case from frontend)
    let delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      },
      include: {
        corporate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // FALLBACK: If not found, try to find by generated AI agent (EOA case)
    if (!delegation) {
      if (!env.masterEncryptionPassword) {
        return res.status(500).json({ error: 'Master password not configured' });
      }
      delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword);
    }

    if (!delegation) {
      return res.status(404).json({
        exists: false,
        delegation: null,
        message: 'No active delegation found'
      });
    }

    const caveats = delegation.caveats as any;

    res.json({
      exists: true,
      delegation: {
        id: delegation.id,
        userAddress,
        aiAgentAddress: delegation.aiAgentAddress,
        delegationHash: delegation.delegationHash,
        dailyLimitUSD: delegation.dailyLimitUsd,
        maxRiskScore: caveats?.maxRiskScore || 3,
        allowedProtocols: delegation.whitelist,
        validUntil: caveats?.validUntil,
        active: delegation.active,
        mode: caveats?.mode || 'simple',
        createdAt: delegation.createdAt,
        updatedAt: delegation.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Delegation] Get status error:', error);
    res.status(500).json({
      error: 'Failed to get delegation status',
      message: error.message,
    });
  }
});

/**
 * GET /api/delegation/simple/:userAddress
 * Get simple delegation status (legacy endpoint)
 */
router.get('/simple/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    console.log('[Simple Delegation] Getting status for:', userAddress);

    // Use delegation helper service
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword);

    if (!delegation) {
      return res.json({
        exists: false,
        delegation: null,
        message: 'No active delegation found'
      });
    }

    const caveats = delegation.caveats as any;

    res.json({
      exists: true,
      delegation: {
        id: delegation.id,
        userAddress,
        aiAgentAddress: delegation.aiAgentAddress,
        delegationHash: delegation.delegationHash,
        dailyLimitUSD: delegation.dailyLimitUsd,
        maxRiskScore: caveats?.maxRiskScore || 3,
        allowedProtocols: delegation.whitelist,
        validUntil: caveats?.validUntil,
        active: delegation.active,
        mode: caveats?.mode || 'simple',
        createdAt: delegation.createdAt,
        updatedAt: delegation.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Simple Delegation] Get status error:', error);
    res.status(500).json({
      error: 'Failed to get delegation status',
      message: error.message,
    });
  }
});

/**
 * GET /api/delegation/ai-agent/:userAddress
 * Get AI agent address for user (convenience endpoint)
 */
router.get('/ai-agent/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    // Generate deterministic AI agent address
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }

    const aiAgentAddress = generateAIAgentAddress(userAddress, env.masterEncryptionPassword);

    res.json({
      userAddress,
      aiAgentAddress,
      message: 'AI agent address is deterministic (no private key exists)'
    });
  } catch (error: any) {
    console.error('[Simple Delegation] Get AI agent error:', error);
    res.status(500).json({
      error: 'Failed to generate AI agent address',
      message: error.message,
    });
  }
});

/**
 * GET /api/delegation/simple/:userAddress/utilization
 * Get 24h spending utilization for user's delegation
 */
router.get('/simple/:userAddress/utilization', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const normalized = userAddress.toLowerCase();

    if (!/^0x[a-f0-9]{40}$/.test(normalized)) {
      return res.status(400).json({ 
        error: 'Invalid address format' 
      });
    }

    console.log('[Delegation Utilization] Getting for user:', normalized);

    // Get active delegation
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }
    const delegation = await delegationHelperService.getActiveDelegation(normalized, env.masterEncryptionPassword);

    if (!delegation) {
      return res.json({
        dailyLimit: 0,
        spent24h: 0,
        remaining: 0,
        utilization: 0,
        message: 'No active delegation found'
      });
    }

    // Calculate spending in last 24 hours
    const since24h = new Date(Date.now() - 24 * 3600 * 1000);
    
    const recentExecutions = await prisma.aIExecutionLog.findMany({
      where: {
        accountAddress: normalized,
        generatedAt: { gte: since24h },
        executionMode: { in: ['auto', 'manual'] }
      }
    });

    // Sum up totalExecutedUsd from all executions
    const spent24h = recentExecutions.reduce((sum, exec) => {
      return sum + (exec.totalExecutedUsd || 0);
    }, 0);

    const dailyLimit = delegation.dailyLimitUsd;
    const remaining = Math.max(0, dailyLimit - spent24h);
    const utilization = dailyLimit > 0 ? spent24h / dailyLimit : 0;

    res.json({
      success: true,
      dailyLimit,
      spent24h: Math.round(spent24h * 100) / 100, // Round to 2 decimals
      remaining: Math.round(remaining * 100) / 100,
      utilization: Math.round(utilization * 1000) / 1000, // Round to 3 decimals
      recentTransactions: recentExecutions.length
    });
  } catch (error: any) {
    console.error('[Delegation Utilization] Error:', error);
    res.status(500).json({
      error: 'Failed to get delegation utilization',
      message: error.message,
    });
  }
});

/**
 * GET /api/delegation/:userAddress/whitelist
 * Get delegation whitelist pools
 */
router.get('/:userAddress/whitelist', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' });
    }
    
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword);
    
    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' });
    }
    
    // Fetch pool details for whitelist
    const pools = await prisma.pool.findMany({
      where: {
        id: { in: delegation.whitelist }
      },
      select: {
        id: true,
        protocol: true,
        chain: true,
        asset: true,
        address: true,
        apy: true,
        tvl: true,
        riskScore: true,
        aiScore: true
      }
    });
    
    res.json({
      success: true,
      pools,
      whitelist: delegation.whitelist
    });
  } catch (error: any) {
    console.error('[Get Whitelist] Error:', error);
    res.status(500).json({
      error: 'Failed to get whitelist',
      message: error.message
    });
  }
});

/**
 * PUT /api/delegation/simple/:userAddress
 * Update delegation settings (dailyLimit, maxRiskScore, whitelist, validUntil)
 * 
 * Body: {
 *   dailyLimitUSD?: number,
 *   maxRiskScore?: number,
 *   allowedProtocols?: string[],
 *   validDays?: number
 * }
 */
router.put('/simple/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { dailyLimitUSD, maxRiskScore, allowedProtocols, validDays } = req.body;

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    console.log('[Simple Delegation] Updating settings for:', userAddress, {
      dailyLimitUSD,
      maxRiskScore,
      allowedProtocols,
      validDays
    });

    // Find active delegation
    const delegation = await prisma.delegation.findFirst({
      where: {
        OR: [
          { userEOA: userAddress.toLowerCase() },
          { smartAccountAddress: userAddress.toLowerCase() }
        ],
        active: true
      }
    });

    if (!delegation) {
      return res.status(404).json({
        error: 'No active delegation found',
        message: 'Create a delegation first before updating settings'
      });
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Update dailyLimit
    if (dailyLimitUSD !== undefined) {
      if (dailyLimitUSD < 100 || dailyLimitUSD > 1000000) {
        return res.status(400).json({
          error: 'Daily limit must be between $100 and $1,000,000'
        });
      }
      updateData.dailyLimitUsd = dailyLimitUSD;
    }

    // Update whitelist
    if (allowedProtocols !== undefined) {
      if (!Array.isArray(allowedProtocols) || allowedProtocols.length === 0) {
        return res.status(400).json({
          error: 'At least one protocol must be selected'
        });
      }
      updateData.whitelist = allowedProtocols;
    }

    // Update caveats (maxRiskScore, validUntil)
    const currentCaveats = (delegation.caveats as any) || {};
    const newCaveats = { ...currentCaveats };

    if (maxRiskScore !== undefined) {
      if (maxRiskScore < 1 || maxRiskScore > 5) {
        return res.status(400).json({
          error: 'Risk score must be between 1 and 5'
        });
      }
      newCaveats.maxRiskScore = maxRiskScore;
    }

    if (validDays !== undefined) {
      if (validDays < 1 || validDays > 365) {
        return res.status(400).json({
          error: 'Validity must be between 1 and 365 days'
        });
      }
      newCaveats.validUntil = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();
    }

    // Save updated caveats
    updateData.caveats = newCaveats;

    // Update delegation
    const updatedDelegation = await prisma.delegation.update({
      where: { id: delegation.id },
      data: updateData
    });

    console.log('[Simple Delegation] ✅ Settings updated:', {
      id: updatedDelegation.id,
      dailyLimit: updatedDelegation.dailyLimitUsd,
      maxRisk: newCaveats.maxRiskScore,
      protocols: updatedDelegation.whitelist
    });

    res.json({
      success: true,
      message: 'Delegation settings updated successfully',
      delegation: {
        id: updatedDelegation.id,
        dailyLimitUSD: updatedDelegation.dailyLimitUsd,
        maxRiskScore: newCaveats.maxRiskScore || 3,
        allowedProtocols: updatedDelegation.whitelist,
        validUntil: newCaveats.validUntil,
        updatedAt: updatedDelegation.updatedAt
      }
    });
  } catch (error: any) {
    console.error('[Simple Delegation] Update error:', error);
    res.status(500).json({
      error: 'Failed to update delegation settings',
      message: error.message
    });
  }
});

export default router;
