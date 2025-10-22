import { prisma } from '../../db/prisma';
import { alchemyPricesService } from '../alchemy/alchemy-prices.service';

interface DashboardStats {
  totalAssets: {
    total: number;
    inPools: number;
    inPoolsDirect: number;
    inPoolsAI: number;
    inWallet: number;
    profitMonth?: number;
    profitAllTime?: number;
  };
  netAPY: {
    overall: number;
    manual: number;
    ai: number;
    growthMonth?: number;
    growthAllTime?: number;
  };
  projectedYield: {
    overall: number;
    manual: number;
    ai: number;
  };
  fees: {
    total: number;
    ai: number;
    manual: number;
  };
}

export class DashboardStatsService {
  async getStats(accountAddress: string): Promise<DashboardStats> {
    console.log('[DashboardStats] Getting stats for address:', accountAddress);
    
    const addr = accountAddress.toLowerCase();
    
    // Check if DEMO mode (no active delegation)
    // First check by smartAccountAddress (Smart Account mode)
    let delegation = await prisma.delegation.findFirst({
      where: {
        active: true,
        smartAccountAddress: addr
      },
      select: {
        id: true,
        userEOA: true,
        smartAccountAddress: true,
        aiAgentAddress: true,
        corporateId: true,
        active: true,
        corporate: true
      }
    });

    // If not found, check Simple Mode (find CorporateAccount where user is owner)
    if (!delegation) {
      console.log('[DashboardStats] No delegation by smartAccountAddress, checking Simple Mode...');
      
      const corporateAccount = await prisma.corporateAccount.findFirst({
        where: {
          address: addr
        }
      });

      if (corporateAccount) {
        delegation = await prisma.delegation.findFirst({
          where: {
            active: true,
            corporateId: corporateAccount.id
          },
          select: {
            id: true,
            userEOA: true,
            smartAccountAddress: true,
            aiAgentAddress: true,
            corporateId: true,
            active: true,
            corporate: true
          }
        });
      }
    }

    if (!delegation) {
      console.log('[DashboardStats] No active delegation found, showing DEMO data');
      return this.getDemoData();
    }

    console.log('[DashboardStats] Delegation found:', {
      id: delegation.id,
      userEOA: delegation.userEOA,
      smartAccountAddress: delegation.smartAccountAddress,
      aiAgentAddress: delegation.aiAgentAddress,
      mode: delegation.smartAccountAddress === addr ? 'Smart Account' : 'Simple Mode'
    });

    // Get real data
    const realData = await this.getRealData(accountAddress, delegation);
    
    // CHANGED: Show REAL data even if zero (user has delegation = Real Mode)
    // Show demo only if user has NO delegation at all
    console.log('[DashboardStats] Returning REAL data:', {
      total: realData.totalAssets.total,
      inPools: realData.totalAssets.inPools,
      inWallet: realData.totalAssets.inWallet
    });

    return realData;
  }

  private getDemoData(): DashboardStats {
    return {
      totalAssets: {
        total: 100000,
        inPools: 80000,
        inPoolsDirect: 50000,
        inPoolsAI: 30000,
        inWallet: 20000,
        profitMonth: 150,     // Demo: +$150 profit last month
        profitAllTime: 325    // Demo: +$325 profit all time
      },
      netAPY: {
        overall: 8.2,
        manual: 5.4,
        ai: 11.8,
        growthMonth: 1.5,      // Demo: +1.5% APY growth last month
        growthAllTime: 3.2     // Demo: +3.2% APY growth all time
      },
      projectedYield: {
        overall: 8200,
        manual: 2700,
        ai: 3540
      },
      fees: {
        total: 125.50,
        ai: 87.30,
        manual: 38.20
      }
    };
  }

  private async getRealData(accountAddress: string, delegation: any): Promise<DashboardStats> {
    // Get pool positions from Envio
    let inPoolsDirect = 0;
    let inPoolsAI = 0;
    let manualAPY = 0;
    let aiAPY = 0;

    try {
      const { envioClient } = await import('../monitoring/envio.client');
      const portfolio = await envioClient.fetchPortfolio(accountAddress);
      
      if (portfolio) {
        const aiPositions = portfolio.positions.filter((p: any) => p.source === 'ai');
        const manualPositions = portfolio.positions.filter((p: any) => p.source === 'manual');
        
        inPoolsAI = aiPositions.reduce((sum: number, p: any) => sum + (p.valueUSD || 0), 0);
        inPoolsDirect = manualPositions.reduce((sum: number, p: any) => sum + (p.valueUSD || 0), 0);
        
        // Calculate WEIGHTED average APY (not simple average!)
        // Correct: (amount1 * apy1 + amount2 * apy2) / totalAmount
        // Example: ($1000 * 10% + $10000 * 1%) / $11000 = ($100 + $100) / $11000 = 1.82%
        if (inPoolsAI > 0) {
          const weightedSum = aiPositions.reduce((sum: number, p: any) => 
            sum + ((p.valueUSD || 0) * (p.currentAPY || 0)), 0
          );
          aiAPY = weightedSum / inPoolsAI;
        }
        if (inPoolsDirect > 0) {
          const weightedSum = manualPositions.reduce((sum: number, p: any) => 
            sum + ((p.valueUSD || 0) * (p.currentAPY || 0)), 0
          );
          manualAPY = weightedSum / inPoolsDirect;
        }
      }
    } catch (error) {
      console.error('[DashboardStats] Failed to get Envio positions:', error);
    }

    // FIXED: Fallback to AIExecutionLog if Envio returns no positions
    // This ensures /wizard shows real data even when Envio indexer hasn't indexed yet
    if (inPoolsAI === 0 && inPoolsDirect === 0) {
      console.log('[DashboardStats] Envio positions empty, using AIExecutionLog fallback...');
      
      try {
        const recentExecutions = await prisma.aIExecutionLog.findMany({
          where: {
            accountAddress: accountAddress.toLowerCase(),
            totalExecutedUsd: { gt: 0 }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        if (recentExecutions.length > 0) {
          // Sum total executed USD from last 10 executions
          inPoolsAI = recentExecutions.reduce((sum, log) => sum + log.totalExecutedUsd, 0);

          // Calculate average APY from actions[]
          let totalWeightedAPY = 0;
          let totalAmount = 0;

          for (const log of recentExecutions) {
            const actions = log.actions as any[];
            if (Array.isArray(actions)) {
              for (const action of actions) {
                if (action.status === 'executed' && action.expectedAPY > 0) {
                  totalWeightedAPY += action.amountUsd * action.expectedAPY;
                  totalAmount += action.amountUsd;
                }
              }
            }
          }

          if (totalAmount > 0) {
            aiAPY = totalWeightedAPY / totalAmount;
          }

          console.log('[DashboardStats] AIExecutionLog fallback:', {
            inPoolsAI,
            aiAPY: aiAPY.toFixed(2),
            executionsUsed: recentExecutions.length
          });
        }
      } catch (error) {
        console.error('[DashboardStats] Failed to get AIExecutionLog fallback:', error);
      }
    }

    const inPools = inPoolsDirect + inPoolsAI;

    // FIXED: Get balance from BOTH addresses
    // - User EOA (userEOA): where user keeps remaining funds  
    // - Smart Account (smartAccountAddress): managed by AI
    let walletBalance = 0; // EOA balance
    let smartAccountBalance = 0; // Smart Account balance
    
    try {
      const { balanceCheckerService } = await import('../blockchain/balance-checker.service');
      
      // Get EOA balance (if different from request address)
      if (delegation.userEOA && delegation.userEOA.toLowerCase() !== accountAddress.toLowerCase()) {
        const eoaCapital = await balanceCheckerService.checkTotalCapital(delegation.userEOA);
        walletBalance = eoaCapital.totalUSD;
        console.log('[DashboardStats] EOA wallet balance:', {
          address: delegation.userEOA,
          balanceUSD: walletBalance
        });
      }
      
      // Get Smart Account balance (delegated funds)
      const saCapital = await balanceCheckerService.checkTotalCapital(delegation.smartAccountAddress);
      smartAccountBalance = saCapital.totalUSD;
      console.log('[DashboardStats] Smart Account balance:', {
        address: delegation.smartAccountAddress,
        balanceUSD: smartAccountBalance
      });
      
      // FIXED: Always show EOA wallet + SA managed, regardless of request address
      // User wallet = EOA (where they keep non-delegated funds)
      // AI managed = Smart Account (funds delegated to AI)
    } catch (error) {
      console.error('[DashboardStats] Failed to get balances:', error);
    }

    // ⚠️ CRITICAL FIX: DO NOT add SA balance to "In Pools"!
    // inPoolsAI = funds ACTUALLY IN POOLS (from Envio positions)
    // smartAccountBalance = idle funds ON Smart Account (NOT in pools!)
    // 
    // Old wrong logic: inPoolsAITotal = inPoolsAI + smartAccountBalance
    // This incorrectly showed SA balance as "In Pools" when it's NOT invested!
    //
    // Correct: Keep them separate
    // - In Pools (AI) = only inPoolsAI (real pool positions)
    // - In Wallet (SA) = smartAccountBalance (idle, waiting to be invested)
    
    const inPoolsAITotal = inPoolsAI; // Only actual pool positions!
    const saIdleFunds = smartAccountBalance; // Idle funds on SA, not in pools

    // Get fees from FeeTransaction table
    const feeTransactions = await prisma.feeTransaction.findMany({
      where: { accountAddress: accountAddress.toLowerCase() }
    });

    const totalFees = feeTransactions.reduce((sum, tx) => sum + tx.amountUSD, 0);
    const aiFees = feeTransactions
      .filter(tx => tx.action.includes('AI') || tx.action.includes('auto'))
      .reduce((sum, tx) => sum + tx.amountUSD, 0);
    const manualFees = totalFees - aiFees;

    const inPoolsTotal = inPoolsDirect + inPoolsAITotal;
    // Total wallet = EOA wallet + SA idle funds (not in pools)
    const totalWalletBalance = walletBalance + saIdleFunds;
    const total = inPoolsTotal + totalWalletBalance;

    // Calculate overall APY (only for funds IN pools, not idle)
    const overallAPY = inPoolsTotal > 0 
      ? ((inPoolsDirect * manualAPY) + (inPoolsAITotal * aiAPY)) / inPoolsTotal 
      : 0;

    console.log('[DashboardStats] Returning REAL data:', {
      total,
      inPools: inPoolsTotal,
      inWallet: totalWalletBalance,
      breakdown: {
        eoaWallet: walletBalance,
        saIdleFunds: saIdleFunds,
        inPoolsDirect,
        inPoolsAI: inPoolsAITotal
      }
    });

    return {
      totalAssets: {
        total,
        inPools: inPoolsTotal,
        inPoolsDirect,
        inPoolsAI: inPoolsAITotal,
        inWallet: totalWalletBalance
      },
      netAPY: {
        overall: overallAPY,
        manual: manualAPY,
        ai: aiAPY
      },
      projectedYield: {
        overall: (total * overallAPY) / 100,
        manual: (inPoolsDirect * manualAPY) / 100,
        ai: (inPoolsAITotal * aiAPY) / 100
      },
      fees: {
        total: totalFees,
        ai: aiFees,
        manual: manualFees
      }
    };
  }
}

export const dashboardStatsService = new DashboardStatsService();
