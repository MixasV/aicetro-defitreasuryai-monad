"use client";

import { useCallback, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ExecutiveDashboard } from '../../components/dashboard/ExecutiveDashboard';
import { MonitoringOperationsPanel } from '../../components/dashboard/MonitoringOperationsPanel';
import { PreviewOverviewPanel } from '../../components/dashboard/PreviewOverviewPanel';
import { useAlerts, usePortfolio, usePortfolioProjection } from '../../hooks/usePortfolio';
import { useRiskInsights } from '../../hooks/useRiskInsights';
import { useMonitoringEvents } from '../../hooks/useMonitoringEvents';
import type { AlertEvent, PortfolioMetricPoint } from '@defitreasuryai/types';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';
import { useCorporateAccount } from '../../hooks/useCorporateAccount';
import { useDelegations } from '../../hooks/useDelegations';
import { useEmergencyStatus } from '../../hooks/useEmergencyStatus';
import { useAppMode } from '../../hooks/useAppMode';
import { usePreviewOverview } from '../../hooks/usePreviewOverview';

const buildFallbackProjection = (value: number, netApy: number): PortfolioMetricPoint[] => {
  const horizons = [0, 30, 90];
  return horizons.map((days) => {
    const factor = days === 0 ? 1 : Math.pow(1 + netApy / 100, days / 365);
    const nav = Number((value * factor).toFixed(2));
    const projectedYield = Number((nav - value).toFixed(2));

    return {
      timestamp: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      netAssetValue: nav,
      projectedYield
    };
  });
};

export default function DashboardPage() {
  const { account } = useCorporateAccount();
  const accountAddress = account.address ?? DEMO_CORPORATE_ACCOUNT;
  const usingDemoAccount = !account.address;
  const { mode } = useAppMode();
  const isPreviewMode = mode === 'preview';

  const { overview: previewOverview, isLoading: isPreviewLoading } = usePreviewOverview(mode);

  const { portfolio, isLoading } = usePortfolio(accountAddress);
  const { alerts } = useAlerts(accountAddress);
  const { insights, isLoading: isRiskLoading, refresh } = useRiskInsights(accountAddress);
  const { projection, isLoading: isProjectionLoading } = usePortfolioProjection(accountAddress);
  const { delegations } = useDelegations(accountAddress);
  const { status: emergencyStatus } = useEmergencyStatus(accountAddress);

  const delegationSummary = useMemo(() => {
    if (delegations.length === 0) {
      return null;
    }

    const primary = delegations[0];
    const dailyLimitUsd = Number.parseFloat(primary.dailyLimit);
    const spent24hUsd = Number.parseFloat(primary.spent24h);
    const limit = Number.isFinite(dailyLimitUsd) ? dailyLimitUsd : 0;
    const spent = Number.isFinite(spent24hUsd) ? spent24hUsd : 0;
    const remaining = Math.max(limit - spent, 0);
    const utilization = limit > 0 ? Math.min(spent / limit, 1) : 0;

    return {
      account: accountAddress,
      dailyLimitUsd: limit,
      spent24hUsd: spent,
      remainingUsd: remaining,
      utilization,
      whitelist: primary.allowedProtocols ?? [],
      maxRiskScore: primary.maxRiskScore,
      updatedAt: primary.updatedAt,
      paused: emergencyStatus?.state === 'paused'
    };
  }, [delegations, emergencyStatus?.state, accountAddress]);

  const handleStreamError = useCallback((error: unknown) => {
    console.error('[monitoring] SSE stream error', error);
  }, []);

  useMonitoringEvents(accountAddress, {
    enabled: !isPreviewMode,
    onError: handleStreamError
  });

  if (isLoading || !portfolio) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center text-slate-400">Synchronising HyperIndex telemetry…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <ModeBanner isPreview={isPreviewMode} account={accountAddress} usingDemo={usingDemoAccount} />
        {isPreviewMode ? (
          previewOverview != null ? (
            <PreviewOverviewPanel overview={previewOverview} />
          ) : (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-100">
              {isPreviewLoading ? 'Loading preview market intelligence…' : 'No preview data available right now.'}
            </div>
          )
        ) : null}
        <ExecutiveDashboard
          totalValueUSD={portfolio.totalValueUSD}
          netAPY={portfolio.netAPY}
          positions={portfolio.positions}
          alerts={(alerts as AlertEvent[]) ?? []}
          metrics={projection?.points ?? buildFallbackProjection(portfolio.totalValueUSD, portfolio.netAPY)}
          projectionLoading={isProjectionLoading}
          riskInsights={insights}
          riskLoading={isRiskLoading}
          onRefreshRisk={() => {
            void refresh();
          }}
          delegationSummary={delegationSummary}
          emergencyStatus={emergencyStatus}
        />
        <MonitoringOperationsPanel />
      </div>
    </AppShell>
  );
}

const ModeBanner = ({
  isPreview,
  account,
  usingDemo
}: {
  isPreview: boolean;
  account: string;
  usingDemo: boolean;
}) => {
  if (isPreview) {
    return (
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-100">
        Preview mode enabled — the agent shares institutional market intelligence while executions remain disabled for
        corporate account {account}.
      </div>
    );
  }

  if (usingDemo) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-xs text-emerald-100">
        Operating in demo mode — displaying synthetic telemetry for {DEMO_CORPORATE_ACCOUNT}. Launch the onboarding
        wizard to connect your Monad treasury.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary-400/30 bg-primary-400/10 p-4 text-xs text-primary-100">
      Real trading mode — live monitoring and trustless execution on Monad testnet for account {account}.
    </div>
  );
};
