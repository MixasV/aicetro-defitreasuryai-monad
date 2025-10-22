'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useAccount } from 'wagmi';
import { Shield } from 'lucide-react';
import { useDashboardMode } from '@/hooks/useDashboardMode';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useDelegationData } from '@/hooks/useDelegationData';
import { useAIStats } from '@/hooks/useAIStats';
import { useDelegationUtilization } from '@/hooks/useDelegationUtilization';
import { DemoModeBanner, RealModeBanner } from '@/components/dashboard/DemoModeBanner';
import { AssetsUnderManagement } from '@/components/dashboard/AssetsUnderManagement';
import { NetAPYCard } from '@/components/dashboard/NetAPYCard';
import { ProjectedYieldCard } from '@/components/dashboard/ProjectedYieldCard';
import { DelegationGuardrailsCard } from '@/components/dashboard/DelegationGuardrailsCard';
import { DelegationControlsCard } from '@/components/dashboard/DelegationControlsCard';
import { AIAgentStatsCard } from '@/components/dashboard/AIAgentStatsCard';
import { UserSmartAccountCard } from '@/components/dashboard/UserSmartAccountCard';
import { PortfolioBreakdownTable } from '@/components/dashboard/PortfolioBreakdownTable';
import { RecentOperations } from '@/components/dashboard/RecentOperations';
import { LastTransactions } from '@/components/dashboard/LastTransactions';
import { useState, useEffect } from 'react';
import { DEMO_CORPORATE_ACCOUNT } from '@/config/demo';
import { useCorporateAccountContext } from '@/providers/CorporateAccountProvider';

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const { address: eoaAddress } = useAccount(); // EOA from MetaMask
  const { account } = useCorporateAccountContext(); // Smart Account from localStorage
  
  // Use Smart Account if available (from delegation setup), otherwise EOA, otherwise demo
  const effectiveAddress = account.address || eoaAddress || DEMO_CORPORATE_ACCOUNT;
  const { isDemo, isReal, isLoading: modeLoading } = useDashboardMode(effectiveAddress);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(effectiveAddress);
  const { data: delegationData } = useDelegationData(effectiveAddress);
  const { data: aiStats } = useAIStats(effectiveAddress);
  const { data: utilization } = useDelegationUtilization(effectiveAddress);
  const [isPaused, setIsPaused] = useState(false);
  
  // Get real operations and transactions from backend API
  const [operations, setOperations] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch operations and transactions for real mode
  useEffect(() => {
    if (isReal && effectiveAddress) {
      fetch(`/api/ai/operations/${effectiveAddress}/recent`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.operations) {
            // Filter out guardrails failures to avoid spam
            const filteredOps = data.operations.filter((op: any) => 
              !op.action?.includes('No actions satisfied') &&
              !op.action?.includes('guardrails')
            );
            setOperations(filteredOps);
          }
        })
        .catch(console.error);
      
      fetch(`/api/ai/transactions/${effectiveAddress}/recent`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.transactions) {
            setTransactions(data.transactions);
          }
        })
        .catch(console.error);
    }
  }, [isReal, effectiveAddress]);

  // Show loading only when really loading and have address
  if (eoaAddress && (modeLoading || statsLoading)) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // If no stats, show empty state (no delegation yet)
  if (!stats) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-white">No Dashboard Data</h2>
            <p className="text-muted mb-4">Create a delegation to start tracking your portfolio</p>
            <a href="/wizard" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition">
              Create Delegation
            </a>
          </div>
        </div>
      </AppShell>
    );
  }

  // REMOVED: Zero assets check - show dashboard even if balance is 0
  // User with delegation should see Real Mode dashboard with zero balances

  const handleWithdrawAll = async () => {
    if (!confirm('Withdraw ALL funds from all pools back to your Smart Account? This action cannot be undone.')) return;
    
    try {
      console.log('[Dashboard] Initiating withdraw all from Smart Account:', effectiveAddress);
      
      // Call backend API to withdraw all funds
      // Backend will construct UserOp for User SA owner to execute
      const response = await fetch(`/api/user-smart-account/${effectiveAddress}/withdraw-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Withdrawal failed');
      }
      
      const result = await response.json();
      console.log('[Dashboard] ✅ Withdrawal initiated:', result);
      
      alert(`Withdrawal successful! Funds returned to Smart Account: ${effectiveAddress}`);
      
      // Refresh page to show updated balances
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      console.error('[Dashboard] Withdrawal error:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  const handleStop = async () => {
    if (!confirm('Stop AI agent? Monitoring will continue, but no new investments.')) return;
    
    try {
      const response = await fetch(`/api/delegation/${effectiveAddress}/pause`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsPaused(true);
        alert('AI agent paused');
      }
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    }
  };

  const handleResume = async () => {
    try {
      const response = await fetch(`/api/delegation/${effectiveAddress}/resume`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setIsPaused(false);
        alert('AI agent resumed');
      }
    } catch (error: any) {
      alert(`Failed: ${error.message}`);
    }
  };

  // Get real positions from Envio via backend
  // ⚠️ CRITICAL FIX: Don't show demo positions in Real mode!
  // Only show demo positions in Demo mode (no delegation)
  const positions = isDemo && stats.totalAssets.total > 0 ? [
    // Demo positions
    {
      protocol: "Aave V3",
      asset: "USDC",
      valueUSD: (stats.totalAssets.inPoolsDirect + stats.totalAssets.inPoolsAI) * 0.4,
      currentAPY: 8.2,
      riskScore: 2,
      poolAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      source: 'ai' as const
    },
    {
      protocol: "Yearn Finance",
      asset: "USDC",
      valueUSD: (stats.totalAssets.inPoolsDirect + stats.totalAssets.inPoolsAI) * 0.35,
      currentAPY: 9.5,
      riskScore: 3,
      poolAddress: "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE",
      source: 'ai' as const
    },
    {
      protocol: "Compound V3",
      asset: "USDC",
      valueUSD: (stats.totalAssets.inPoolsDirect + stats.totalAssets.inPoolsAI) * 0.25,
      currentAPY: 7.8,
      riskScore: 2,
      poolAddress: "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
      source: 'manual' as const
    }
  ] : [];
  
  // TODO: Fetch real positions from Envio when user has actual pool positions
  // For now, positions will be empty in Real mode until Envio indexes them

  // Get real whitelist and quarantine from backend
  // TODO: Create hooks when data is available
  // Get whitelist from delegation data or use demo data
  const whitelist: any[] = isDemo ? [
    { name: 'Aave V3', tvl: 12500000000 },
    { name: 'Yearn Finance', tvl: 4200000000 },
    { name: 'Compound V3', tvl: 8900000000 },
    { name: 'Uniswap V3', tvl: 3800000000 }
  ] : (delegationData?.delegation?.allowedProtocols || []).map(name => ({
    name,
    tvl: 0 // TVL loaded separately if needed
  }));
  const quarantined: any[] = [];

  // Demo operations
  const demoOperations: any[] = isDemo ? [
    {
      id: '1',
      time: '2 hours ago',
      type: 'AI Rebalance',
      action: 'Moved $15,000 from Yearn to Aave V3',
      status: 'completed' as const
    },
    {
      id: '2',
      time: '1 day ago',
      type: 'Manual Deposit',
      action: 'Added $20,000 USDC to portfolio',
      status: 'completed' as const
    },
    {
      id: '3',
      time: '3 days ago',
      type: 'AI Emergency',
      action: 'Withdrew $5,000 from high-risk pool',
      status: 'completed' as const
    }
  ] : [];
  
  // Demo transactions
  const demoTransactions: any[] = isDemo ? [
    {
      id: '1',
      date: '2025-01-13 18:45',
      type: 'Deposit',
      protocol: 'Aave V3',
      amount: '$20,000',
      fee: '$0.42',
      status: 'success' as const,
      txHash: '0x123...abc'
    },
    {
      id: '2',
      date: '2025-01-13 14:20',
      type: 'Rebalance',
      protocol: 'Yearn → Aave',
      amount: '$15,000',
      fee: '$0.38',
      status: 'success' as const,
      txHash: '0x456...def'
    },
    {
      id: '3',
      date: '2025-01-13 09:10',
      type: 'Withdraw',
      protocol: 'Compound V3',
      amount: '$5,000',
      fee: '$0.31',
      status: 'success' as const,
      txHash: '0x789...ghi'
    },
    {
      id: '4',
      date: '2025-01-12 16:55',
      type: 'Deposit',
      protocol: 'Yearn Finance',
      amount: '$30,000',
      fee: '$0.45',
      status: 'success' as const,
      txHash: '0xabc...jkl'
    },
    {
      id: '5',
      date: '2025-01-12 11:30',
      type: 'Swap',
      protocol: 'Uniswap V3',
      amount: '$10,000',
      fee: '$0.52',
      status: 'success' as const,
      txHash: '0xdef...mno'
    }
  ] : [];

  // Use REAL delegation data or demo data
  const delegation = isReal && delegationData?.delegation ? {
    dailyLimitUsd: delegationData.delegation.dailyLimitUSD,
    spent24hUsd: utilization?.spent24h || 0,
    remainingUsd: utilization?.remaining || delegationData.delegation.dailyLimitUSD,
    utilization: utilization?.utilization || 0,
    maxRiskScore: delegationData.delegation.maxRiskScore,
    paused: !delegationData.delegation.active || isPaused
  } : {
    dailyLimitUsd: 5000,
    spent24hUsd: 1250,
    remainingUsd: 3750,
    utilization: 0.25,
    maxRiskScore: 7,
    paused: isPaused
  };

  // Use REAL AI stats or demo data
  const aiAgentStats = isReal && aiStats ? {
    portfolioValue: stats.totalAssets.inPoolsAI,
    roi: aiStats.roi,
    activePositions: positions.filter(p => p.source === 'ai').length,
    limitUtilization: delegation.utilization,
    monthlyFees: aiStats.monthlyFees,
    monthlyFeeLimit: aiStats.monthlyFeeLimit,
    totalTransactions: aiStats.totalTransactions,
    avgTransactionCost: aiStats.avgTransactionCost,
    savedByOptimization: aiStats.savedByOptimization,
    avgGasGwei: aiStats.avgGasGwei,
    lastExecutionAt: aiStats.lastExecutionAt,
    lastExecutionMode: aiStats.lastExecutionMode
  } : {
    portfolioValue: stats.totalAssets.inPoolsAI,
    roi: 325,
    activePositions: positions.filter(p => p.source === 'ai').length,
    limitUtilization: delegation.utilization,
    monthlyFees: 87.30,
    monthlyFeeLimit: 500,
    totalTransactions: 156,
    avgTransactionCost: 0.56,
    savedByOptimization: 245,
    avgGasGwei: 0
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Mode Banner */}
        {isDemo && <DemoModeBanner />}
        {isReal && effectiveAddress && <RealModeBanner address={effectiveAddress} />}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Treasury Dashboard</h1>
          <p className="text-muted mt-2">
            AI-powered treasury management and risk control
          </p>
        </div>

        {/* Top Stats */}
        <section className="grid gap-6 md:grid-cols-3">
          <AssetsUnderManagement data={stats.totalAssets} />
          <NetAPYCard data={stats.netAPY} />
          <ProjectedYieldCard data={stats.projectedYield} />
        </section>

        {/* AI Agent Stats & Delegation Controls */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
          <DelegationGuardrailsCard 
            delegation={delegation}
            fees={stats.fees}
            accountAddress={effectiveAddress}
          />
          <AIAgentStatsCard 
            data={aiAgentStats}
            delegation={delegation}
            accountAddress={effectiveAddress}
          />
          <DelegationControlsCard 
            whitelist={whitelist}
            quarantined={quarantined}
          />
        </section>

        {/* Portfolio */}
        <section>
          <PortfolioBreakdownTable 
            positions={positions}
            onWithdrawAll={handleWithdrawAll}
            onStop={handleStop}
            onResume={handleResume}
            isPaused={isPaused}
          />
        </section>

        {/* Recent Activity */}
        <section className="grid gap-6 md:grid-cols-2">
          <RecentOperations operations={isDemo ? demoOperations : operations} />
          <LastTransactions transactions={isDemo ? demoTransactions : transactions} />
        </section>
      </div>
    </AppShell>
  );
}
