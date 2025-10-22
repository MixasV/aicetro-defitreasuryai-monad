/**
 * AI Manual Execution Routes
 * 
 * Endpoints for manually triggering AI agent execution.
 * Used when user clicks "Start Now" after creating delegation.
 */

import { Router } from 'express';
import { aiExecutionService as autoExecutionService } from '../../services/ai/ai.execution.service';
import { aiExecutionService as legacyExecutionService } from '../../services/ai/ai.executor';
import { blockchainService } from '../../services/blockchain/blockchain.service';
import { prisma } from '../../db/prisma';

const router = Router();

/**
 * POST /api/ai/execute-manual
 * Manually trigger AI agent execution for a user account
 * 
 * Body:
 * - userAddress: string (required)
 * - riskTolerance: 'conservative' | 'balanced' | 'aggressive' (optional)
 */
/**
 * POST /api/ai/execute-now/:accountAddress
 * Trigger AI execution IMMEDIATELY (don't wait for 10min scheduler)
 * Used when user clicks "Start Now" after creating delegation
 */
router.post('/execute-now/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;

    if (!accountAddress || !accountAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address',
        message: 'accountAddress must be a valid Ethereum address' 
      });
    }

    console.log('[AI Manual] ⚡ Execute NOW triggered for:', accountAddress);

    // Execute AI immediately using auto-strategy
    const result = await autoExecutionService.executeAutoStrategy(accountAddress);

    console.log('[AI Manual] ✅ Execution complete');

    res.json({
      success: result.success,
      execution: result.execution,
      reason: result.reason,
      message: result.success ? 'AI execution triggered successfully' : 'AI execution skipped or failed'
    });
  } catch (error: any) {
    console.error('[AI Manual] ❌ Execution failed:', error);
    res.status(500).json({ 
      error: 'Failed to execute AI',
      message: error.message 
    });
  }
});

/**
 * POST /api/ai/execute-manual (legacy endpoint - kept for compatibility)
 */
router.post('/execute-manual', async (req, res) => {
  try {
    const { userAddress, riskTolerance = 'balanced' } = req.body;

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address',
        message: 'userAddress must be a valid Ethereum address' 
      });
    }

    console.log('[AI Manual] Triggering execution for:', userAddress);

    // Get delegation from DATABASE (Simple Mode compatibility)
    // Simple Mode stores delegation in DB only, not on-chain
    // User may send EOA address, but delegation is linked to Smart Account
    // So we need to find CorporateAccount first, then get delegation
    
    // Try to find delegation by smartAccountAddress (EIP-7702: EOA or Smart Account)
    const allDelegations = await prisma.delegation.findMany({
      where: { active: true }
    });
    
    let delegationRecord = allDelegations.find(d => 
      // EIP-7702: Match by smartAccountAddress (which is EOA for EIP-7702)
      d.smartAccountAddress?.toLowerCase() === userAddress.toLowerCase()
    );

    // EIP-7702: No CorporateAccount needed, delegation is directly on EOA

    if (!delegationRecord) {
      return res.status(400).json({
        error: 'No active delegation found',
        message: 'Please create a delegation first at /setup/simple',
        debug: {
          searchedAddress: userAddress.toLowerCase(),
          foundDelegations: allDelegations.map(d => ({
            smartAccountAddress: d.smartAccountAddress
          }))
        }
      });
    }

    // Calculate spent24h and remaining limit
    const caveats = delegationRecord.caveats as any || {};
    const spent24h = caveats.spent24h || 0;
    const remainingLimit = delegationRecord.dailyLimitUsd - spent24h;

    if (remainingLimit <= 0) {
      return res.status(400).json({
        error: 'Daily limit exhausted',
        message: 'Please wait for daily limit reset or increase your limit',
        details: {
          dailyLimitUsd: delegationRecord.dailyLimitUsd,
          spent24h: spent24h,
          remaining: remainingLimit
        }
      });
    }

    // Build delegation state for AI executor
    const delegationState = {
      delegate: delegationRecord.delegate,
      dailyLimitUsd: delegationRecord.dailyLimitUsd,
      spent24h: spent24h,
      remainingDailyLimitUsd: remainingLimit,
      whitelist: delegationRecord.whitelist as string[] || []
    };

    // Execute AI agent (legacy method)
    const result = await legacyExecutionService.execute({
      account: userAddress.toLowerCase(),
      delegate: delegationState.delegate,
      riskTolerance: riskTolerance as 'conservative' | 'balanced' | 'aggressive',
      protocols: delegationState.whitelist
    });

    console.log('[AI Manual] Execution complete:', {
      account: userAddress,
      totalExecutedUsd: result.totalExecutedUsd,
      actionsCount: result.actions.length
    });

    res.json({
      success: true,
      execution: {
        account: userAddress,
        totalExecutedUsd: result.totalExecutedUsd,
        remainingDailyLimitUsd: result.remainingDailyLimitUsd,
        actionsCount: result.actions.length,
        summary: result.summary,
        generatedAt: result.generatedAt
      }
    });
  } catch (error: any) {
    console.error('[AI Manual] Execution error:', error);
    res.status(500).json({
      error: 'AI execution failed',
      message: error.message,
      details: error.stack
    });
  }
});

/**
 * GET /api/ai/delegation-debug/:userAddress
 * Diagnostic endpoint to check delegation state and limits
 */
router.get('/delegation-debug/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;

    if (!userAddress || !userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ 
        error: 'Invalid wallet address' 
      });
    }

    console.log('[AI Debug] Checking delegation for:', userAddress);

    // Get delegation state
    const delegationState = await blockchainService.getDelegationState(userAddress.toLowerCase());

    // Get corporate account
    const { prisma } = await import('../../db/prisma');
    const corporateAccount = await prisma.corporateAccount.findUnique({
      where: { address: userAddress.toLowerCase() }
    });

    // Get delegation record
    let delegationRecord = null;
    if (corporateAccount) {
      delegationRecord = await prisma.delegation.findFirst({
        where: {
          corporateId: corporateAccount.id,
          active: true
        },
        select: {
          id: true,
          delegate: true,
          dailyLimitUsd: true,
          whitelist: true,
          autoExecutionEnabled: true,
          portfolioPercentage: true,
          caveats: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    res.json({
      userAddress,
      delegationState: {
        delegate: delegationState.delegate,
        dailyLimitUsd: delegationState.dailyLimitUsd,
        spent24h: delegationState.spent24h,
        remainingDailyLimitUsd: delegationState.remainingDailyLimitUsd,
        maxRiskScore: delegationState.maxRiskScore,
        whitelist: delegationState.whitelist
      },
      corporateAccount: corporateAccount ? {
        id: corporateAccount.id,
        address: corporateAccount.address,
        aiAgentAddress: corporateAccount.aiAgentAddress,
        aiAgentName: corporateAccount.aiAgentName
      } : null,
      delegationRecord,
      diagnosis: {
        hasCorporateAccount: !!corporateAccount,
        hasDelegation: !!delegationRecord,
        hasRemainingLimit: (delegationState.remainingDailyLimitUsd ?? 0) > 0,
        autoExecutionEnabled: delegationRecord?.autoExecutionEnabled || false,
        canExecute: !!delegationRecord && (delegationState.remainingDailyLimitUsd ?? 0) > 0
      }
    });
  } catch (error: any) {
    console.error('[AI Debug] Error:', error);
    res.status(500).json({
      error: 'Delegation debug failed',
      message: error.message
    });
  }
});

export default router;
