'use client';

import { useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { AIControlsPanel } from '../../components/ai/AIControlsPanel';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useMonitoringEvents } from '../../hooks/useMonitoringEvents';
import { usePageTitle } from '../../hooks/usePageTitle';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';
import { useCorporateAccount } from '../../hooks/useCorporateAccount';

export default function AIControlsPage() {
  usePageTitle('AI Controls');
  const { account } = useCorporateAccount();
  const accountAddress = account.address ?? DEMO_CORPORATE_ACCOUNT;
  const usingDemo = !account.address;

  const { portfolio, isLoading, isError } = usePortfolio(accountAddress);

  const handleStreamError = useCallback((error: unknown) => {
    console.error('[monitoring] SSE stream error', error);
  }, []);

  useMonitoringEvents(accountAddress, {
    enabled: true,
    onError: handleStreamError
  });

  // Show demo portfolio if loading or error
  // NOTE: Demo uses ONLY real protocols available on Monad Testnet
  const demoPortfolio = {
    totalValueUSD: 100000,
    netAPY: 12.5,
    positions: [
      {
        protocol: "Uniswap V2 Monad",
        asset: "WMON-USDC LP",
        amount: 70000,
        valueUSD: 70000,
        currentAPY: 15.03,  // Real APY from Pool table
        riskScore: 3
      },
      {
        protocol: "Cash Reserve",
        asset: "MON",
        amount: 30000,
        valueUSD: 30000,
        currentAPY: 0,
        riskScore: 1
      }
    ]
  };

  const displayPortfolio = portfolio || demoPortfolio;
  const showDemoWarning = !portfolio || isError;

  return (
    <AppShell>
      {showDemoWarning && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3 text-sm text-amber-200">
            <span className="text-xl">ℹ️</span>
            <div>
              <strong className="font-semibold">Demo Mode</strong> — 
              {isLoading ? ' Loading your portfolio data...' : ' Showing demo portfolio. Connect wallet to see real data.'}
            </div>
          </div>
        </div>
      )}
      <AIControlsPanel portfolio={displayPortfolio} accountAddress={accountAddress} usingDemo={usingDemo} />
    </AppShell>
  );
}
