'use client';

import { type Pool } from './PoolTable';
import { MiniChart } from './MiniChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PoolRowProps {
  pool: Pool;
  rank: number;
  onDetailClick?: (pool: Pool) => void;
  onAddToWhitelist?: (poolId: string) => void;
  hasActiveDelegation?: boolean;
  isInWhitelist?: boolean;
}

function formatLarge(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function ChainBadge({ chain }: { chain: string }) {
  const colors: { [key: string]: string } = {
    Monad: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Ethereum: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Base: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    Arbitrum: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Optimism: 'bg-red-500/20 text-red-300 border-red-500/30',
    Polygon: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  };

  const emoji: { [key: string]: string } = {
    Monad: '🟣',
    Ethereum: '⚫',
    Base: '🔵',
    Arbitrum: '🔷',
    Optimism: '🔴',
    Polygon: '🟪',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colors[chain] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}
    >
      <span>{emoji[chain] || '⚪'}</span>
      {chain}
    </span>
  );
}

function RiskStars({ risk }: { risk: number | null }) {
  if (!risk) return <span className="text-slate-500 text-xs">N/A</span>;

  // Invert: 5 stars = low risk (1), 1 star = high risk (5)
  const invertedRisk = 6 - risk;
  const stars = '⭐'.repeat(invertedRisk);
  const colors: { [key: number]: string } = {
    5: 'text-emerald-400',    // 5 stars = low risk (original 1)
    4: 'text-green-400',      // 4 stars = medium-low (original 2)
    3: 'text-yellow-400',     // 3 stars = medium (original 3)
    2: 'text-orange-400',     // 2 stars = medium-high (original 4)
    1: 'text-red-400',        // 1 star = high risk (original 5)
  };

  const riskLabels = ['', 'High Risk', 'Medium-High', 'Medium', 'Medium-Low', 'Low Risk'];

  return (
    <span className={`text-sm ${colors[invertedRisk] || 'text-slate-400'}`} title={`${riskLabels[invertedRisk]} (${risk}/5)`}>
      {stars}
    </span>
  );
}

function AIScoreBadge({ score }: { score: number | null }) {
  if (!score) return <span className="text-slate-500 text-xs">N/A</span>;

  let color = 'bg-slate-500/20 text-slate-300';
  let badge = '';

  if (score >= 90) {
    color = 'bg-emerald-500/20 text-emerald-300';
    badge = '🔥';
  } else if (score >= 80) {
    color = 'bg-green-500/20 text-green-300';
    badge = '⭐';
  } else if (score >= 70) {
    color = 'bg-yellow-500/20 text-yellow-300';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {badge && <span>{badge}</span>}
      {score.toFixed(0)}
    </span>
  );
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-slate-500" />;
}

export function PoolRow({
  pool,
  rank,
  onDetailClick,
  onAddToWhitelist,
  hasActiveDelegation,
  isInWhitelist = false,
}: PoolRowProps) {
  // Mock trend data (в реальности будет из API)
  const apyTrend = pool.apy > 15 ? 'up' : pool.apy > 5 ? 'neutral' : 'down';
  const tvlTrend = pool.tvl > 1000000 ? 'up' : 'neutral';

  return (
    <tr className="hover:bg-white/5 transition-colors">
      {/* Rank */}
      <td className="px-4 py-3 text-center text-sm text-slate-400">
        {rank}
      </td>

      {/* Pool */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <div className="font-medium text-white">{pool.asset || 'Unknown'}</div>
          <div className="text-xs text-slate-400">{pool.protocol}</div>
        </div>
      </td>

      {/* Chain */}
      <td className="px-4 py-3 hidden md:table-cell">
        <ChainBadge chain={pool.chain} />
      </td>

      {/* APY */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-emerald-400">{pool.apy.toFixed(2)}%</span>
          <TrendArrow trend={apyTrend} />
        </div>
      </td>

      {/* TVL */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex items-center gap-1">
          <span className="text-white">{formatLarge(pool.tvl)}</span>
          <TrendArrow trend={tvlTrend} />
        </div>
      </td>

      {/* Volume 24h */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-slate-300">{pool.volume24h ? formatLarge(pool.volume24h) : 'N/A'}</span>
      </td>

      {/* Risk */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <RiskStars risk={pool.riskScore} />
      </td>

      {/* AI Score */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <AIScoreBadge score={pool.aiScore} />
      </td>

      {/* Chart */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <MiniChart poolId={pool.id} />
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {hasActiveDelegation && pool.chain === 'Monad' && (
            <button
              onClick={() => onAddToWhitelist?.(pool.id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                isInWhitelist
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-primary-500/20 text-primary-300 hover:bg-primary-500/30'
              }`}
              title={isInWhitelist ? 'Remove from whitelist' : 'Add to whitelist'}
            >
              {isInWhitelist ? 'Remove' : 'Add to WL'}
            </button>
          )}
          <button
            onClick={() => onDetailClick?.(pool)}
            className="rounded bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition"
          >
            Detail
          </button>
        </div>
      </td>
    </tr>
  );
}
