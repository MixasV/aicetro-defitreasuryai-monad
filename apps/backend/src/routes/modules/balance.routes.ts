/**
 * Balance Check Routes
 * 
 * API endpoints for checking user capital and mode requirements
 */

import { Router } from 'express';
import { balanceCheckerService } from '../../services/blockchain/balance-checker.service';

const router = Router();

/**
 * GET /api/balance/:address
 * Get user's balance across all networks (simple version)
 * Used by frontend components that expect this endpoint
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    console.log('[Balance API] Getting balance for:', address);

    const result = await balanceCheckerService.checkTotalCapital(address);

    res.json({
      success: true,
      address,
      totalUSD: result.totalUSD,
      tokens: result.tokens,
      networksScanned: result.networksScanned,
      checkedAt: result.checkedAt
    });
  } catch (error: any) {
    console.error('[Balance API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get balance',
      message: error.message,
    });
  }
});

/**
 * GET /api/balance/check/:address
 * Check user's total capital and get mode recommendation
 */
router.get('/check/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid address format' });
    }

    console.log('[Balance API] Checking capital for:', address);

    const result = await balanceCheckerService.checkTotalCapital(address);

    res.json({
      success: true,
      data: {
        totalUSD: result.totalUSD,
        requiresMultisig: result.requiresMultisig,
        recommendedMode: result.recommendedMode,
        tokens: result.tokens.map((t) => ({
          symbol: t.symbol,
          network: t.network,
          balance: t.balance,
          valueUSD: t.valueUSD,
        })),
        networksScanned: result.networksScanned,
        checkedAt: result.checkedAt,
        threshold: 100000, // $100k threshold
      },
    });
  } catch (error: any) {
    console.error('[Balance API] Error:', error);
    res.status(500).json({
      error: 'Failed to check balance',
      message: error.message,
    });
  }
});

/**
 * POST /api/balance/clear-cache
 * Clear cached balance for address (admin/dev use)
 */
router.post('/clear-cache', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    balanceCheckerService.clearCache(address);

    res.json({
      success: true,
      message: 'Cache cleared',
    });
  } catch (error: any) {
    console.error('[Balance API] Clear cache error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
});

export default router;
