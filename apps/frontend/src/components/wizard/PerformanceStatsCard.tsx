'use client';

import { BarChart3, TrendingUp } from 'lucide-react';

interface PerformanceStatsCardProps {
  stats: {
    totalProfit: number;
    totalProfitPercent: number;
    bestPosition: { pool: string; profit: number };
    winRate: number;
    totalTrades: number;
    avgTradeCost: number;
  };
}

export function PerformanceStatsCard({ stats }: PerformanceStatsCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Performance</h2>
          <p className="text-sm text-slate-400 mt-1">AI agent results</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Total Profit</div>
          <div className={`text-lg font-bold ${stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            ({stats.totalProfitPercent >= 0 ? '+' : ''}{stats.totalProfitPercent.toFixed(1)}%)
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Win Rate</div>
          <div className="text-lg font-bold text-blue-400">
            {stats.winRate.toFixed(0)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Math.round(stats.totalTrades * stats.winRate / 100)}/{stats.totalTrades} successful
          </div>
        </div>

        <div className="col-span-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-emerald-300 mb-1">Best Position</div>
              <div className="text-sm font-medium text-white">{stats.bestPosition.pool}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-emerald-400">
                +${stats.bestPosition.profit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Avg Trade Cost</span>
            <span className="text-white font-medium">${stats.avgTradeCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
