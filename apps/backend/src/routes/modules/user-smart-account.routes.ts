/**
 * User Smart Account Routes
 * 
 * API endpoints for User Smart Account management
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { userSmartAccountService } from '../../services/erc4337/user-smart-account.service';
import type { Address } from 'viem';

const router = Router();

/**
 * GET /api/user-smart-account/:userEOA
 * 
 * Get User Smart Account info for given EOA
 */
router.get('/:userEOA', async (req: Request, res: Response) => {
  try {
    const { userEOA } = req.params;

    if (!userEOA || !userEOA.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user EOA address' 
      });
    }

    console.log('[User SA API] Getting Smart Account for EOA:', userEOA);

    const config = await userSmartAccountService.getUserSmartAccount(userEOA as Address);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'User Smart Account not found'
      });
    }

    return res.json({
      success: true,
      smartAccount: {
        userEOA: config.userAddress,
        smartAccountAddress: config.smartAccountAddress,
        isDeployed: config.isDeployed,
        hasInitCode: !!config.initCode
      }
    });

  } catch (error: any) {
    console.error('[User SA API] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get User Smart Account'
    });
  }
});

/**
 * POST /api/user-smart-account/:userEOA/deploy
 * 
 * Deploy User Smart Account for given EOA
 */
router.post('/:userEOA/deploy', async (req: Request, res: Response) => {
  try {
    const { userEOA } = req.params;

    if (!userEOA || !userEOA.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user EOA address' 
      });
    }

    console.log('[User SA API] Deploying Smart Account for EOA:', userEOA);

    const result = await userSmartAccountService.deployUserSmartAccount(userEOA as Address);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Deployment failed'
      });
    }

    // Refresh status
    await userSmartAccountService.refresh(userEOA as Address);

    const config = await userSmartAccountService.getUserSmartAccount(userEOA as Address);

    return res.json({
      success: true,
      deployment: {
        txHash: result.txHash,
        smartAccountAddress: config?.smartAccountAddress,
        isDeployed: config?.isDeployed || false
      }
    });

  } catch (error: any) {
    console.error('[User SA API] Deploy error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to deploy User Smart Account'
    });
  }
});

/**
 * POST /api/user-smart-account/:userEOA/refresh
 * 
 * Refresh deployment status for User Smart Account
 */
router.post('/:userEOA/refresh', async (req: Request, res: Response) => {
  try {
    const { userEOA } = req.params;

    if (!userEOA || !userEOA.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user EOA address' 
      });
    }

    await userSmartAccountService.refresh(userEOA as Address);

    const config = await userSmartAccountService.getUserSmartAccount(userEOA as Address);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'User Smart Account not found'
      });
    }

    return res.json({
      success: true,
      smartAccount: {
        userEOA: config.userAddress,
        smartAccountAddress: config.smartAccountAddress,
        isDeployed: config.isDeployed,
        hasInitCode: !!config.initCode
      }
    });

  } catch (error: any) {
    console.error('[User SA API] Refresh error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh User Smart Account status'
    });
  }
});

export default router;
