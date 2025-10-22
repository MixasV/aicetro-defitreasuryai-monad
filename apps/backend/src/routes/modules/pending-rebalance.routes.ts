/**
 * Pending Rebalance Routes
 * 
 * Handles "queued" transactions that AI wants to execute but is limited by daily limit.
 * User can review and "push" them immediately with temporary limit override.
 */

import { Router } from 'express';
import { prisma } from '../../db/prisma';

const router = Router();

interface PendingRebalanceSummary {
  totalCount: number;
  totalAmountUsd: number;
  estimatedGasSavings: number;
  estimatedApyGain: number;
  poolsAffected: string[];
  oldestPendingDays: number;
}

interface PendingRebalanceDetail {
  id: string;
  fromProtocol: string;
  toProtocol: string;
  amountUsd: number;
  currentApy: number;
  targetApy: number;
  apyDifference: number;
  daysToComplete: number;
  gasPerTransaction: number;
  totalGasCost: number;
  singleTransactionGas: number;
  gasSavings: number;
  apyGainIfPushNow: number;
  netBenefit: number;
  createdAt: string;
  scheduledFor: string;
  reasoning: string;
}

/**
 * GET /api/pending-rebalance/summary/:accountAddress
 * Get summary of pending rebalancing transactions
 */
router.get('/summary/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;

    // Get all pending deferred transactions for this account
    const deferredTxs = await prisma.deferredTransaction.findMany({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        status: 'pending'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (deferredTxs.length === 0) {
      return res.json({
        success: true,
        summary: null // No pending rebalances
      });
    }

    // Calculate summary
    const totalAmountUsd = deferredTxs.reduce((sum, tx) => {
      const rec = tx.recommendation as any;
      return sum + (rec?.amount || rec?.amountUsd || 0);
    }, 0);
    const poolsAffected = [...new Set(deferredTxs.map(tx => {
      const rec = tx.recommendation as any;
      return rec?.protocol || 'Unknown';
    }))];
    
    // Estimate gas savings (assuming daily execution vs single push)
    const avgGasPerTx = 150000; // Average gas units
    const gasPrice = 50; // gwei
    const ethPrice = 3000; // USD
    const gasCostPerTx = (avgGasPerTx * gasPrice * ethPrice) / 1e9;
    
    // Calculate how many days it would take with daily limit
    const dailyLimit = 1000; // TODO: Get from delegation
    const daysToComplete = Math.ceil(totalAmountUsd / dailyLimit);
    const totalGasCost = daysToComplete * gasCostPerTx;
    const singleTxGasCost = gasCostPerTx;
    const estimatedGasSavings = totalGasCost - singleTxGasCost;
    
    // Estimate APY gain (earning difference × days saved)
    const avgApyGain = 3; // Average 3% better APY in target pools
    const estimatedApyGain = (totalAmountUsd * (avgApyGain / 100) * daysToComplete) / 365;
    
    // Oldest pending
    const oldestTx = deferredTxs[0];
    const oldestPendingDays = Math.floor(
      (Date.now() - oldestTx.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const summary: PendingRebalanceSummary = {
      totalCount: deferredTxs.length,
      totalAmountUsd,
      estimatedGasSavings,
      estimatedApyGain,
      poolsAffected,
      oldestPendingDays
    };

    res.json({
      success: true,
      summary
    });
  } catch (error: any) {
    console.error('[PendingRebalance] Error getting summary:', error);
    res.status(500).json({
      error: 'Failed to get pending rebalance summary',
      message: error.message
    });
  }
});

/**
 * GET /api/pending-rebalance/details/:accountAddress
 * Get detailed list of pending rebalancing transactions
 */
router.get('/details/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;

    const deferredTxs = await prisma.deferredTransaction.findMany({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        status: 'pending'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (deferredTxs.length === 0) {
      return res.json({
        success: true,
        details: []
      });
    }

    // Build detailed list
    const details: PendingRebalanceDetail[] = deferredTxs.map(tx => {
      const recommendation = tx.recommendation as any;
      const amountUsd = recommendation?.amount || recommendation?.amountUsd || 0;
      
      const currentApy = recommendation?.currentApy || 5;
      const targetApy = recommendation?.targetApy || 8;
      const apyDifference = targetApy - currentApy;
      
      const dailyLimit = 1000; // TODO: Get from delegation
      const daysToComplete = Math.ceil(amountUsd / dailyLimit);
      
      const avgGasPerTx = 150000;
      const gasPrice = 50;
      const ethPrice = 3000;
      const gasCostPerTx = (avgGasPerTx * gasPrice * ethPrice) / 1e9;
      
      const totalGasCost = daysToComplete * gasCostPerTx;
      const singleTransactionGas = gasCostPerTx;
      const gasSavings = totalGasCost - singleTransactionGas;
      
      // APY gain = (amount × APY difference × days) / 365
      const apyGainIfPushNow = (amountUsd * (apyDifference / 100) * daysToComplete) / 365;
      const netBenefit = gasSavings + apyGainIfPushNow;
      
      return {
        id: tx.id,
        fromProtocol: recommendation?.fromProtocol || 'Current Position',
        toProtocol: recommendation?.protocol || 'Target Pool',
        amountUsd,
        currentApy,
        targetApy,
        apyDifference,
        daysToComplete,
        gasPerTransaction: gasCostPerTx,
        totalGasCost,
        singleTransactionGas,
        gasSavings,
        apyGainIfPushNow,
        netBenefit,
        createdAt: tx.createdAt.toISOString(),
        scheduledFor: tx.deferredUntil.toISOString(),
        reasoning: recommendation?.reasoning || tx.reason || 'Better yield opportunity'
      };
    });

    res.json({
      success: true,
      details
    });
  } catch (error: any) {
    console.error('[PendingRebalance] Error getting details:', error);
    res.status(500).json({
      error: 'Failed to get pending rebalance details',
      message: error.message
    });
  }
});

/**
 * POST /api/pending-rebalance/push/:id
 * Execute pending transaction immediately with temporary limit override
 * Requires user signature
 */
router.post('/push/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({
        error: 'Signature required',
        message: 'User must sign to approve limit override'
      });
    }

    // Get transaction
    const deferredTx = await prisma.deferredTransaction.findUnique({
      where: { id }
    });

    if (!deferredTx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (deferredTx.status !== 'pending') {
      return res.status(400).json({
        error: 'Transaction already executed or cancelled'
      });
    }

    // TODO: Verify signature matches account owner

    // Mark as "pushed" (will be executed with higher priority)
    await prisma.deferredTransaction.update({
      where: { id },
      data: {
        status: 'executing',
        executedAt: new Date(),
        // Store push info in recommendation JSON
        recommendation: {
          ...(deferredTx.recommendation as any),
          pushedByUser: true,
          pushedAt: new Date().toISOString(),
          limitOverride: true
        }
      }
    });

    // TODO: Trigger immediate execution via AI executor
    // await aiExecutor.executeDeferredTransaction(id, { limitOverride: true });

    res.json({
      success: true,
      message: 'Transaction queued for immediate execution',
      transactionId: id
    });
  } catch (error: any) {
    console.error('[PendingRebalance] Error pushing transaction:', error);
    res.status(500).json({
      error: 'Failed to push transaction',
      message: error.message
    });
  }
});

/**
 * POST /api/pending-rebalance/push-all/:accountAddress
 * Execute ALL pending transactions immediately with temporary limit override
 * Requires user signature
 */
router.post('/push-all/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({
        error: 'Signature required',
        message: 'User must sign to approve limit override for all transactions'
      });
    }

    // Get all pending
    const deferredTxs = await prisma.deferredTransaction.findMany({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        status: 'pending'
      }
    });

    if (deferredTxs.length === 0) {
      return res.status(400).json({
        error: 'No pending transactions found'
      });
    }

    // TODO: Verify signature

    // Mark all as pushed
    await prisma.deferredTransaction.updateMany({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        status: 'pending'
      },
      data: {
        status: 'executing',
        executedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: `${deferredTxs.length} transactions queued for immediate execution`,
      count: deferredTxs.length
    });
  } catch (error: any) {
    console.error('[PendingRebalance] Error pushing all transactions:', error);
    res.status(500).json({
      error: 'Failed to push all transactions',
      message: error.message
    });
  }
});

export default router;
