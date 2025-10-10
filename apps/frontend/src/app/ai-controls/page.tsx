'use client';

import { useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { AIControlsPanel } from '../../components/ai/AIControlsPanel';
import { usePortfolio } from '../../hooks/usePortfolio';
import { useMonitoringEvents } from '../../hooks/useMonitoringEvents';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';
import { useCorporateAccount } from '../../hooks/useCorporateAccount';

export default function AIControlsPage() {
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
  const demoPortfolio = {
    totalValueUSD: 100000,
    netAPY: 8.2,
    positions: [
      {
        protocol: "Aave Monad",
        asset: "USDC",
        amount: 50000,
        valueUSD: 50000,
        currentAPY: 8.4,
        riskScore: 2
      },
      {
        protocol: "Yearn Monad",
        asset: "USDT",
        amount: 25000,
        valueUSD: 24900,
        currentAPY: 11.8,
        riskScore: 4
      },
      {
        protocol: "Nabla Finance",
        asset: "USDC",
        amount: 25000,
        valueUSD: 25100,
        currentAPY: 15.6,
        riskScore: 6
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
