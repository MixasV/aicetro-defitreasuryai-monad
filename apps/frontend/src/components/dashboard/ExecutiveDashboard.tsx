import { AlertEvent, EmergencyStatus, PortfolioMetricPoint, PortfolioPosition, RiskInsights } from '@defitreasuryai/types';
import { useMemo } from 'react';
import { EnhancedPerformanceChart } from './EnhancedPerformanceChart';

interface Props {
  totalValueUSD: number;
  netAPY: number;
  positions: PortfolioPosition[];
  alerts: AlertEvent[];
  metrics: PortfolioMetricPoint[];
  projectionLoading?: boolean;
  riskInsights?: RiskInsights | null;
  riskLoading?: boolean;
  onRefreshRisk?: () => void;
  delegationSummary?: DelegationSummary | null;
  emergencyStatus?: EmergencyStatus | null;
}

interface DelegationSummary {
  account: string;
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingUsd: number;
  utilization: number;
  whitelist: string[];
  maxRiskScore: number;
  updatedAt?: string;
  paused: boolean;
}

const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const ExecutiveDashboard = ({
  totalValueUSD,
  netAPY,
  positions,
  alerts,
  metrics,
  projectionLoading,
  riskInsights,
  riskLoading,
  onRefreshRisk,
  delegationSummary,
  emergencyStatus
}: Props) => {
  const projectedYield = useMemo(() => (totalValueUSD * netAPY) / 100, [totalValueUSD, netAPY]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-3">
        <StatCard title="Assets Under Management" value={formatter.format(totalValueUSD)} subtitle="MockCorp USDC" />
        <StatCard
          title="Net APY"
          value={`${netAPY.toFixed(2)}%`}
          subtitle="Weighted by treasury risk score"
        />
        <StatCard
          title="Projected Annual Yield"
          value={formatter.format(projectedYield)}
          subtitle="Demo target: $4K annual yield"
        />
      </section>

      {delegationSummary ? (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <DelegationGuardrailCard summary={delegationSummary} />
          <WhitelistCard
            whitelist={delegationSummary.whitelist}
            maxRiskScore={delegationSummary.maxRiskScore}
            paused={delegationSummary.paused}
            emergencyStatus={emergencyStatus}
            updatedAt={delegationSummary.updatedAt}
          />
        </section>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2">
        <PositionsTable positions={positions} />
        <AlertsPanel alerts={alerts} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <EnhancedPerformanceChart metrics={metrics} isLoading={projectionLoading} />
        <RiskInsightsPanel insights={riskInsights} isLoading={Boolean(riskLoading)} onRefresh={onRefreshRisk} />
      </section>
    </div>
  );
};

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <article className="glass-card space-y-2 p-6">
    <h3 className="text-sm uppercase text-slate-400">{title}</h3>
    <p className="text-3xl font-semibold text-white">{value}</p>
    <p className="text-xs text-slate-400">{subtitle}</p>
  </article>
);

const riskPalette: Record<number, string> = {
  1: 'text-emerald-400',
  2: 'text-emerald-300',
  3: 'text-amber-300',
  4: 'text-orange-400',
  5: 'text-rose-400'
};

const DelegationGuardrailCard = ({ summary }: { summary: DelegationSummary }) => {
  const utilizationPercent = Math.round(summary.utilization * 100);
  const statusLabel = summary.paused ? 'paused' : 'active';
  const statusTone = summary.paused ? 'text-rose-300 border-rose-400/40 bg-rose-500/10' : 'text-emerald-200 border-emerald-400/40 bg-emerald-500/10';

  return (
    <article className="glass-card space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Delegation Guardrails</h3>
        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase ${statusTone}`}>{statusLabel}</span>
      </header>
      <div className="space-y-2 text-xs text-slate-300">
        <p>Limit: {formatter.format(summary.dailyLimitUsd)}</p>
        <p>Spent last 24h: {formatter.format(summary.spent24hUsd)}</p>
        <p>Remaining: {formatter.format(summary.remainingUsd)}</p>
        <p>Max risk score: {summary.maxRiskScore}</p>
        {summary.updatedAt ? <p>Updated: {new Date(summary.updatedAt).toLocaleString()}</p> : null}
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Limit utilisation</span>
          <span>{utilizationPercent}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${summary.paused ? 'bg-rose-400' : 'bg-emerald-400'}`}
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
      </div>
    </article>
  );
};

const WhitelistCard = ({
  whitelist,
  maxRiskScore,
  paused,
  emergencyStatus,
  updatedAt
}: {
  whitelist: string[];
  maxRiskScore: number;
  paused: boolean;
  emergencyStatus?: EmergencyStatus | null;
  updatedAt?: string;
}) => {
  const reason = emergencyStatus?.metadata?.reason;
  const action = emergencyStatus?.metadata?.action;

  return (
    <article className="glass-card space-y-4 p-6">
      <header className="space-y-1">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Delegation Controls</h3>
        <p className="text-xs text-slate-400">
          Emergency state: {paused ? 'PAUSED' : 'ACTIVE'}
        </p>
      </header>
      {action ? <p className="text-[11px] text-slate-400">Last action: {action}</p> : null}
      {reason ? <p className="text-[11px] text-amber-300">Reason: {reason}</p> : null}
      {updatedAt ? <p className="text-[11px] text-slate-500">Updated: {new Date(updatedAt).toLocaleTimeString()}</p> : null}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Whitelist ({whitelist.length})</p>
        {whitelist.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {whitelist.map((protocol) => (
              <span
                key={protocol}
                className="rounded-full border border-primary-400/40 bg-primary-500/10 px-3 py-1 text-[11px] text-primary-100"
              >
                {protocol}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-400">Whitelist empty — delegated actions are blocked.</p>
        )}
        <p className="mt-3 text-[11px] text-slate-400">Maximum risk score: {maxRiskScore}</p>
      </div>
    </article>
  );
};

const PositionsTable = ({ positions }: { positions: PortfolioPosition[] }) => (
  <div className="glass-card overflow-hidden">
    <header className="border-b border-white/10 px-6 py-4 text-sm uppercase tracking-widest text-slate-400">
      Portfolio Breakdown
    </header>
    <table className="w-full table-fixed text-sm">
      <thead className="text-left text-slate-400">
        <tr>
          <th className="px-6 py-3 font-medium">Protocol</th>
          <th className="px-6 py-3 font-medium">Asset</th>
          <th className="px-6 py-3 font-medium">Value</th>
          <th className="px-6 py-3 font-medium">APY</th>
          <th className="px-6 py-3 font-medium">Risk</th>
        </tr>
      </thead>
      <tbody>
        {positions.map((position) => (
          <tr key={`${position.protocol}-${position.asset}`} className="border-t border-white/5 text-slate-100">
            <td className="px-6 py-3">{position.protocol}</td>
            <td className="px-6 py-3">{position.asset}</td>
            <td className="px-6 py-3">{formatter.format(position.valueUSD)}</td>
            <td className="px-6 py-3">{position.currentAPY.toFixed(2)}%</td>
            <td className={`px-6 py-3 font-semibold ${riskPalette[position.riskScore]}`}>{position.riskScore}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AlertsPanel = ({ alerts }: { alerts: AlertEvent[] }) => (
  <div className="glass-card space-y-4 p-6">
    <header className="flex items-center justify-between">
      <h3 className="text-sm uppercase tracking-wide text-slate-400">Risk Alerts</h3>
      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{alerts.length} active</span>
    </header>
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
            <span className="text-xs uppercase text-slate-400">{alert.severity}</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{alert.description}</p>
          <span className="mt-2 block text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</span>
        </article>
      ))}
    </div>
  </div>
);

const PerformanceChart = ({ metrics, isLoading }: { metrics: PortfolioMetricPoint[]; isLoading?: boolean }) => (
  <div className="glass-card p-6">
    <h3 className="text-sm uppercase tracking-wide text-slate-400">Performance Projection</h3>
    {isLoading ? (
      <p className="mt-4 text-sm text-slate-400">Loading projection…</p>
    ) : metrics.length > 0 ? (
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {metrics.map((point) => (
          <div key={point.timestamp} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{new Date(point.timestamp).toLocaleDateString()}</p>
            <p className="text-lg font-semibold text-white">{formatter.format(point.netAssetValue)}</p>
            <p className="text-sm text-slate-300">Projected Yield: {formatter.format(point.projectedYield)}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="mt-4 text-sm text-slate-400">No projection data available.</p>
    )}
  </div>
);

const bandColors: Record<'low' | 'moderate' | 'high' | 'critical', string> = {
  low: 'bg-emerald-400',
  moderate: 'bg-amber-300',
  high: 'bg-orange-400',
  critical: 'bg-rose-500'
};

const RiskInsightsPanel = ({
  insights,
  isLoading,
  onRefresh
}: {
  insights?: RiskInsights | null;
  isLoading: boolean;
  onRefresh?: () => void;
}) => {
  const utilizationPercent = Math.min(
    Math.round(((insights?.delegation.utilization ?? 0) * 100) || 0),
    999
  );
  const hasViolations = Boolean(insights?.guardrails.violations.length);
  const updatedAt = insights ? new Date(insights.updatedAt).toLocaleTimeString() : null;

  return (
    <div className="glass-card space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Risk Insights</h3>
        <button
          type="button"
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:border-white/30 hover:text-white"
          onClick={() => {
            if (onRefresh) onRefresh();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {updatedAt ? <p className="text-xs text-slate-500">Updated: {updatedAt}</p> : null}

      {isLoading && !insights ? (
        <p className="text-sm text-slate-400">Analysing risk posture…</p>
      ) : insights ? (
        <div className="space-y-5">
          <div>
            <p className={`text-sm font-semibold ${hasViolations ? 'text-rose-400' : 'text-emerald-400'}`}>
              {hasViolations ? 'Policy breaches detected' : 'Risk within tolerance'}
            </p>
            <p className="text-xs text-slate-400">
              Max risk: {insights.guardrails.maxAllowedRiskScore} | Observed: {insights.guardrails.highestPositionRisk}
            </p>
            {hasViolations ? (
              <ul className="mt-2 space-y-1 text-xs text-rose-300">
                {insights.guardrails.violations.map((violation) => (
                  <li key={violation}>{violation}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Limit utilisation</span>
              <span>{utilizationPercent}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Remaining: {formatter.format(insights.delegation.remainingDailyLimitUsd)} of{' '}
              {formatter.format(insights.delegation.dailyLimitUsd)}
            </p>
          </div>

          <div className="space-y-3">
            {insights.exposure.map((band) => (
              <div key={band.level} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{band.label}</span>
                  <span>{band.percentage.toFixed(2)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${bandColors[band.level]}`}
                    style={{ width: `${Math.min(band.percentage, 100)}%` }}
                  />
                </div>
                {band.topPositions.length > 0 ? (
                  <p className="text-xs text-slate-400">
                    Top: {band.topPositions.map((item) => `${item.protocol} (${formatter.format(item.valueUSD)})`).join(', ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Risk analysis demo</p>
          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>50% Low risk (Aave USDC)</span>
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="flex justify-between">
              <span>25% High risk (Yearn USDT)</span>
              <span className="text-amber-400">⚠</span>
            </div>
            <div className="flex justify-between">
              <span>25% High risk (Nabla USDC)</span>
              <span className="text-amber-400">⚠</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Connect wallet to see real-time risk analysis</p>
        </div>
      )}
    </div>
  );
};
