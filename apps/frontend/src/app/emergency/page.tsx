'use client';
import { AppShell } from '../../components/layout/AppShell';
import { EmergencyPanel } from '../../components/emergency/EmergencyPanel';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';
import { useCorporateAccount } from '../../hooks/useCorporateAccount';
import { SecurityDashboard } from '../../components/security/SecurityDashboard';

export default function EmergencyPage() {
  const { account } = useCorporateAccount();
  const accountAddress = account.address ?? DEMO_CORPORATE_ACCOUNT;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-4">
        {!account.address ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            Emergency controls are running in demo mode for {DEMO_CORPORATE_ACCOUNT}. Provision your smart account to govern
            live operations.
          </div>
        ) : null}
        <EmergencyPanel accountAddress={accountAddress} />
        <SecurityDashboard account={accountAddress} />
      </div>
    </AppShell>
  );
}
