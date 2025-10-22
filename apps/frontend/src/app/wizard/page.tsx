'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEffectiveAddress } from '@/hooks/useEffectiveAddress';
import { trackGoal, GOALS } from '@/lib/yandex-metrika';
import { AIAgentStatusCard } from '@/components/wizard/AIAgentStatusCard';
import { DelegationSettingsCard } from '@/components/wizard/DelegationSettingsCard';
import { WhitelistManagementCard } from '@/components/wizard/WhitelistManagementCard';
import { PerformanceStatsCard } from '@/components/wizard/PerformanceStatsCard';
import { SetupModeCard } from '@/components/wizard/SetupModeCard';


export default function WizardPage() {
  usePageTitle('AI Control');
  const router = useRouter();
  const { effectiveAddress: address, eoaAddress, isDemo } = useEffectiveAddress();
  const [selected, setSelected] = useState<'simple' | 'corporate' | null>(null);
  const [loading, setLoading] = useState(true);
  const [delegation, setDelegation] = useState<any>(null);
  const [controlStatus, setControlStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [utilization, setUtilization] = useState<any>(null);
  const [aiStats, setAiStats] = useState<any>(null);


  // Check for existing delegation
  useEffect(() => {
    async function checkDelegation() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        // Fetch delegation
        const delegationResponse = await fetch(`/api/delegation/${address}`);
        if (delegationResponse.ok) {
          const data = await delegationResponse.json();
          if (data.exists && data.delegation) {
            setDelegation(data.delegation);
          }
        }

        // Fetch control status
        const statusResponse = await fetch(`/api/delegation-controls/${address}/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.success) {
            setControlStatus(statusData.status);
          }
        }

        // Fetch portfolio stats
        const statsResponse = await fetch(`/api/dashboard/stats/${address}`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }

        // Fetch AI stats
        const aiStatsResponse = await fetch(`/api/ai/stats/${address}`);
        if (aiStatsResponse.ok) {
          const aiStatsData = await aiStatsResponse.json();
          setAiStats(aiStatsData);
        }

        // Fetch utilization
        const utilizationResponse = await fetch(`/api/delegation/simple/${address}/utilization`);
        if (utilizationResponse.ok) {
          const utilizationData = await utilizationResponse.json();
          setUtilization(utilizationData);
        }
      } catch (error) {
        console.error('[Wizard] Failed to check delegation:', error);
      } finally {
        setLoading(false);
      }
    }

    checkDelegation();
  }, [address]);

  // AI Control handlers
  const handlePause = async () => {
    if (!address) return;
    try {
      const response = await fetch(`/api/delegation-controls/${address}/pause`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('AI agent paused successfully');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to pause AI agent');
    }
  };

  const handleResume = async () => {
    if (!address) return;
    try {
      const response = await fetch(`/api/delegation-controls/${address}/resume`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('AI agent resumed successfully');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to resume AI agent');
    }
  };

  const handleEmergency = async () => {
    if (!address) return;
    if (!confirm('🚨 EMERGENCY STOP: Withdraw all funds and pause AI? This cannot be undone easily.')) {
      return;
    }
    try {
      const response = await fetch(`/api/delegation-controls/${address}/emergency-stop`, {
        method: 'POST'
      });
      if (response.ok) {
        alert('🚨 Emergency stop activated! Withdrawing all funds...');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to activate emergency stop');
    }
  };

  const handleSettings = () => {
    router.push('/setup/simple');
  };



  // If has delegation, show AI Control Center
  if (delegation && controlStatus) {
    const caveats = delegation.caveats || {};
    const networks = caveats.selectedNetworks || [];
    
    // Real stats from API
    const portfolioStats = {
      portfolioValue: stats?.stats?.totalAssets?.total || 0,
      netAPY: stats?.stats?.netAPY?.overall || 0,
      profitToday: stats?.stats?.totalAssets?.profitMonth || 0,
      profitTodayPercent: 0 // TODO: calculate from profitMonth
    };

    const performanceStats = {
      totalProfit: aiStats?.totalProfitUSD || 0,
      totalProfitPercent: aiStats?.totalProfitPercent || 0,
      bestPosition: aiStats?.bestPosition || { pool: 'N/A', profit: 0 },
      winRate: aiStats?.winRate || 0,
      totalTrades: aiStats?.totalTransactions || 0,
      avgTradeCost: aiStats?.avgFeesUSD || 0
    };

    const whitelist = delegation.allowedProtocols || [];
    const whitelistPools = whitelist.map((protocol: string) => ({
      name: protocol,
      apy: 0 // TODO: fetch real APY from pools
    }));

    const settings = {
      dailyLimit: delegation.dailyLimitUSD || 1000,
      dailyUsed: utilization?.spentToday || 0,
      maxRisk: delegation.maxRiskScore || 3,
      validUntil: delegation.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      networks: delegation.mode === 'eip7702' ? [
        { name: 'Monad Testnet', icon: '🟣', enabled: true }
      ] : [],
      protocols: delegation.allowedProtocols || []
    };

    return (
      <AppShell>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">AI Control Center</h1>
            <p className="text-slate-400 mt-2">
              Manage your AI agent and monitor performance
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AIAgentStatusCard
              status={{
                active: controlStatus.active && !controlStatus.paused,
                paused: controlStatus.paused || false,
                emergencyStop: controlStatus.emergencyStop || false
              }}
              stats={portfolioStats}
              onPause={handlePause}
              onResume={handleResume}
              onEmergency={handleEmergency}
              onSettings={handleSettings}
            />
            <DelegationSettingsCard settings={settings} onEdit={handleSettings} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <WhitelistManagementCard whitelist={whitelistPools} />
            <PerformanceStatsCard stats={performanceStats} />
          </div>

          {/* Setup Mode Card */}
          <SetupModeCard
            mode="simple"
            hasSimple={true}
            hasCorporate={false}
          />
        </div>
      </AppShell>
    );
  }

  // If no delegation, show mode selection
  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to AIcetro
            </h1>
            <p className="text-xl text-gray-400">
              Choose how you want to manage your treasury
            </p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Simple Mode Card */}
            <button
              onClick={() => setSelected('simple')}
              className={`
                relative p-8 rounded-2xl border-2 text-left transition-all transform hover:scale-105
                ${selected === 'simple' 
                  ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' 
                  : 'border-white/20 bg-white/5 hover:border-primary/50'
                }
              `}
            >
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3">Simple Mode</h3>
              <p className="text-gray-400 mb-6">
                Perfect for individual users managing under $100,000
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">2-minute setup</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">No smart contract deployment</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Direct wallet delegation</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Zero gas fees for setup</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Easy to revoke anytime</span>
                </li>
              </ul>

              {selected === 'simple' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    trackGoal(GOALS.SIMPLE_SETUP_STARTED, { source: 'wizard' });
                    router.push('/setup/simple');
                  }}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Start Simple Setup →
                </button>
              )}
            </button>

            {/* Corporate Mode Card */}
            <button
              onClick={() => setSelected('corporate')}
              className={`
                relative p-8 rounded-2xl border-2 text-left transition-all transform hover:scale-105
                ${selected === 'corporate' 
                  ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' 
                  : 'border-white/20 bg-white/5 hover:border-primary/50'
                }
              `}
            >
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-white mb-3">Corporate Mode</h3>
              <p className="text-gray-400 mb-6">
                For organizations managing over $100,000
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Multi-signature support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Advanced risk controls</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Institutional-grade security</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Team collaboration tools</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 text-lg">✓</span>
                  <span className="text-gray-300">Detailed audit logs</span>
                </li>
              </ul>

              {selected === 'corporate' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/setup/corporate');
                  }}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition"
                >
                  Start Corporate Setup →
                </button>
              )}
            </button>
          </div>
        </div>
      </div>


    </AppShell>
  );
}
