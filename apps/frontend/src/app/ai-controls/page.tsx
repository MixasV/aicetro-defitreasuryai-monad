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

  const { portfolio } = usePortfolio(accountAddress);

  const handleStreamError = useCallback((error: unknown) => {
    console.error('[monitoring] SSE stream error', error);
  }, []);

  useMonitoringEvents(accountAddress, {
    enabled: true,
    onError: handleStreamError
  });

  if (!portfolio) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">
          Synchronising HyperIndex portfolio…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AIControlsPanel portfolio={portfolio} accountAddress={accountAddress} usingDemo={usingDemo} />
    </AppShell>
  );
}
