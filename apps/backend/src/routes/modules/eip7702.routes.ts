/**
 * EIP-7702 Routes
 * 
 * Handles EIP-7702 EOA upgrade checks and status
 */

import { Router } from 'express';
import { metaMaskDelegationService } from '../../services/metamask/metamask-delegation.service';

const router = Router();

/**
 * GET /api/eip7702/status/:address
 * Check if EOA is upgraded via EIP-7702
 */
router.get('/status/:address', async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address'
      });
    }

    const isUpgraded = await metaMaskDelegationService.isEOAUpgraded(address as `0x${string}`);
    
    const response: any = {
      success: true,
      address,
      isUpgraded
    };

    // If upgraded, get the delegated contract address
    if (isUpgraded) {
      const expectedCode = metaMaskDelegationService.getExpectedEIP7702Code();
      response.delegatedContract = metaMaskDelegationService.getHybridDelegatorAddress();
      response.expectedCode = expectedCode;
    }

    res.json(response);
  } catch (error: any) {
    console.error('[EIP-7702 API] Error checking status:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to check EIP-7702 status'
    });
  }
});

/**
 * GET /api/eip7702/contracts
 * Get EIP-7702 contract addresses
 */
router.get('/contracts', async (req, res) => {
  try {
    res.json({
      success: true,
      contracts: {
        hybridDelegator: metaMaskDelegationService.getHybridDelegatorAddress(),
        delegationManager: metaMaskDelegationService.getDelegationManagerAddress(),
        entryPoint: metaMaskDelegationService.getEntryPointAddress()
      },
      chainId: 10143, // Monad Testnet
      chainName: 'Monad Testnet'
    });
  } catch (error: any) {
    console.error('[EIP-7702 API] Error getting contracts:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get contract addresses'
    });
  }
});

/**
 * POST /api/eip7702/upgrade
 * Upgrade EOA via EIP-7702 (GAS SPONSORED by Alchemy Gas Manager)
 * 
 * User signs authorization (no gas), backend sends 0x04 transaction
 */
router.post('/upgrade', async (req, res) => {
  try {
    const { eoaAddress, authorization, signature } = req.body;

    if (!eoaAddress || !authorization || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: eoaAddress, authorization, signature'
      });
    }

    console.log('[EIP-7702 API] Upgrading EOA:', eoaAddress);
    console.log('[EIP-7702 API] Authorization:', authorization);

    // Delegate to service
    const result = await metaMaskDelegationService.upgradeEOASponsored({
      eoaAddress,
      authorization,
      signature
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      txHash: result.txHash,
      message: 'EOA upgraded via EIP-7702 (gas sponsored)'
    });
  } catch (error: any) {
    console.error('[EIP-7702 API] Upgrade error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to upgrade EOA'
    });
  }
});

export default router;
