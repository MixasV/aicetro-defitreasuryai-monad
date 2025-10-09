'use client';

import { AppShell } from '../../components/layout/AppShell';
import { DemoScenarioPanel } from '../../components/demo/DemoScenarioPanel';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';
import { useCorporateAccount } from '../../hooks/useCorporateAccount';

export default function DemoPage() {
  const { account } = useCorporateAccount();
  const accountAddress = account.address ?? DEMO_CORPORATE_ACCOUNT;
  const usingDemo = !account.address;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-4">
        {usingDemo ? (
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3 text-xs text-cyan-100">
            Demo scenario is running against the showcase account {DEMO_CORPORATE_ACCOUNT}. Configure your smart account to
            rehearse the flow with your own team.
          </div>
        ) : null}
        <DemoScenarioPanel accountAddress={accountAddress} />
      </div>
    </AppShell>
  );
}
