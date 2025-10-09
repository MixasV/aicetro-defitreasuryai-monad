import type { PreviewDataOverview } from '@defitreasuryai/types';

export const PreviewOverviewPanel = ({ overview }: { overview: PreviewDataOverview }) => {
  const { summary, topOpportunities } = overview;

  return (
    <section className="space-y-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-200">Preview • Mainnet intelligence</p>
          <h2 className="text-lg font-semibold text-amber-50">Global DeFi opportunities</h2>
        </div>
        <p className="text-xs text-amber-100/80">
          Data sources: {overview.source.defiLlama ? 'DeFiLlama' : 'fallback'}
          {overview.source.coinGecko ? ' • CoinGecko' : ''}
          {overview.source.oneInch ? ' • 1inch' : ''}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total TVL" value={`$${formatNumber(summary.totalTvlUsd)}`} accent="amber" />
        <MetricCard label="Average APY" value={`${summary.averageApy.toFixed(2)}%`} accent="violet" />
        <MetricCard label="Risk-adjusted yield" value={`${summary.riskWeightedYield.toFixed(2)}%`} accent="emerald" />
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-amber-100">Top opportunities (risk-adjusted)</h3>
        <div className="overflow-hidden rounded-xl border border-amber-500/30">
          <table className="min-w-full divide-y divide-amber-500/20 text-left text-xs text-amber-100">
            <thead className="bg-amber-500/10 text-[11px] uppercase tracking-wide text-amber-200">
              <tr>
                <th className="px-4 py-2">Protocol</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Chain</th>
                <th className="px-4 py-2 text-right">APY</th>
                <th className="px-4 py-2 text-right">TVL</th>
                <th className="px-4 py-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {topOpportunities.slice(0, 10).map((protocol) => (
                <tr key={protocol.id} className="hover:bg-amber-500/5">
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium text-amber-50">{protocol.name}</span>
                      {protocol.url ? (
                        <a
                          href={protocol.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-amber-200/70 hover:text-amber-100"
                        >
                          {protocol.url.replace(/^https?:\/\//, '')}
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2 capitalize">{protocol.category}</td>
                  <td className="px-4 py-2 capitalize">{protocol.chain}</td>
                  <td className="px-4 py-2 text-right font-medium">{protocol.apy.toFixed(2)}%</td>
                  <td className="px-4 py-2 text-right">${formatNumber(protocol.tvlUsd)}</td>
                  <td className="px-4 py-2 text-right">{protocol.riskScore}/5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent: 'amber' | 'violet' | 'emerald';
}) => {
  const accentMap: Record<'amber' | 'violet' | 'emerald', string> = {
    amber: 'border-amber-400/40 bg-amber-400/10 text-amber-50',
    violet: 'border-violet-400/40 bg-violet-400/10 text-violet-50',
    emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-50'
  };

  return (
    <article className={`rounded-xl border ${accentMap[accent]} p-4`}>
      <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </article>
  );
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return '0';
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};
