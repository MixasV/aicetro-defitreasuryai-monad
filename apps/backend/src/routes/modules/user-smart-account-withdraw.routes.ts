import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/user-smart-account/:address/withdraw-all
 * 
 * Withdraws ALL funds from all pools back to User Smart Account.
 * 
 * CRITICAL: This is User SA owner action (NOT AI agent!)
 * User signs with MetaMask, tx executes from User SA owner.
 * 
 * Flow:
 * 1. Get User SA delegation
 * 2. Get all positions in pools (from Envio or database)
 * 3. Construct withdraw transactions for each pool
 * 4. Return UserOp for User to sign with MetaMask
 * 
 * NOTE: For MVP, we return simple withdrawal instructions.
 * User can withdraw by calling Smart Account owner methods directly.
 */
router.post('/:address/withdraw-all', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    console.log('[Withdraw] Withdraw all requested for User SA:', address);

    // Get delegation
    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: address.toLowerCase(),
        active: true
      }
    });

    if (!delegation) {
      return res.status(404).json({
        success: false,
        message: 'No active delegation found for this Smart Account'
      });
    }

    console.log('[Withdraw] Found delegation:', delegation.id);
    console.log('[Withdraw] User EOA (owner):', delegation.userEOA);

    // Get all AI execution logs to find actual positions
    const executions = await prisma.aIExecutionLog.findMany({
      where: {
        accountAddress: address.toLowerCase(),
        executionMode: 'auto'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    console.log('[Withdraw] Found executions:', executions.length);

    // Extract pools from executions
    const poolsSet = new Set<string>();
    const positionsByPool: any[] = [];

    for (const exec of executions) {
      try {
        // actions is Json field (array of actions)
        const actions = Array.isArray(exec.actions) ? exec.actions : JSON.parse(exec.actions as string);
        
        for (const action of actions) {
          if (action.pool && action.protocol && action.type === 'deposit') {
            const poolKey = `${action.protocol}:${action.pool}`;
            if (!poolsSet.has(poolKey)) {
              poolsSet.add(poolKey);
              positionsByPool.push({
                protocol: action.protocol,
                poolAddress: action.pool,
                asset: action.asset || 'Unknown',
                depositedAt: exec.createdAt
              });
            }
          }
        }
      } catch (error) {
        // Skip invalid JSON
        console.warn('[Withdraw] Failed to parse actions:', error);
      }
    }

    console.log('[Withdraw] Extracted pools:', positionsByPool.length);

    // CRITICAL: For User SA owner withdrawal, use direct contract calls
    // User SA owner = User EOA (delegation.userEOA)
    // User signs with MetaMask, calls withdraw() on each pool contract
    
    // For hackathon MVP: return pool addresses for User to withdraw
    // In production: construct UserOperation with multicall withdraw calldata

    return res.json({
      success: true,
      message: positionsByPool.length > 0 
        ? 'Found active positions for withdrawal'
        : 'No active positions found',
      data: {
        smartAccountAddress: address,
        ownerAddress: delegation.userEOA,
        positions: positionsByPool,
        withdrawalMethod: 'owner_direct',
        instructions: {
          method: 'User SA Owner Direct Withdrawal',
          step1: 'Connect MetaMask with User EOA (Smart Account owner)',
          step2: 'For each pool, call withdraw() function on pool contract',
          step3: 'Funds return to Smart Account',
          step4: 'Optional: Transfer from Smart Account to EOA',
          security: 'Only User EOA can execute (AI agent has NO access)',
          gasRequired: '~50,000-100,000 gas per pool withdrawal'
        },
        note: 'User SA owner has FULL control. AI agent delegation does NOT affect owner withdrawals.'
      }
    });

  } catch (error: any) {
    console.error('[Withdraw] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Withdrawal failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
