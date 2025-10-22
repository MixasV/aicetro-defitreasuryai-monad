import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { verifyMessage } from 'ethers';

export const whitelistRouter = Router();

// Add protocol to whitelist (requires signature)
whitelistRouter.post('/add', async (req, res) => {
  try {
    const { accountAddress, protocol, signature, message } = req.body;
    
    if (!accountAddress || !protocol || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify signature
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Find delegation
    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: accountAddress.toLowerCase(),
        active: true
      }
    });

    if (!delegation) {
      return res.status(404).json({
        success: false,
        error: 'No active delegation found'
      });
    }

    // Add to whitelist
    const currentWhitelist = delegation.whitelist || [];
    if (currentWhitelist.includes(protocol)) {
      return res.status(400).json({
        success: false,
        error: 'Protocol already in whitelist'
      });
    }

    const updatedDelegation = await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        whitelist: [...currentWhitelist, protocol]
      }
    });

    console.log(`[Whitelist] Added ${protocol} to whitelist for ${accountAddress}`);

    res.json({
      success: true,
      whitelist: updatedDelegation.whitelist
    });
  } catch (error) {
    console.error('[API] Add to whitelist error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add protocol'
    });
  }
});

// Remove protocol from whitelist (requires signature)
whitelistRouter.post('/remove', async (req, res) => {
  try {
    const { accountAddress, protocol, signature, message } = req.body;
    
    if (!accountAddress || !protocol || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Verify signature
    const recoveredAddress = verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== accountAddress.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Find delegation
    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: accountAddress.toLowerCase(),
        active: true
      }
    });

    if (!delegation) {
      return res.status(404).json({
        success: false,
        error: 'No active delegation found'
      });
    }

    // Remove from whitelist
    const currentWhitelist = delegation.whitelist || [];
    const newWhitelist = currentWhitelist.filter(p => p !== protocol);

    const updatedDelegation = await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        whitelist: newWhitelist
      }
    });

    console.log(`[Whitelist] Removed ${protocol} from whitelist for ${accountAddress}`);

    res.json({
      success: true,
      whitelist: updatedDelegation.whitelist
    });
  } catch (error) {
    console.error('[API] Remove from whitelist error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove protocol'
    });
  }
});

// Get current whitelist
whitelistRouter.get('/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    
    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: accountAddress.toLowerCase(),
        active: true
      }
    });

    if (!delegation) {
      return res.json({
        success: true,
        whitelist: []
      });
    }

    res.json({
      success: true,
      whitelist: delegation.whitelist || []
    });
  } catch (error) {
    console.error('[API] Get whitelist error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get whitelist'
    });
  }
});

export default whitelistRouter;
