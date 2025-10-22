'use client';

import { usePendingRebalanceSummary } from '@/hooks/usePendingRebalance';
import Link from 'next/link';

interface AIAgentStatsData {
  portfolioValue: number;        // Total AI-managed funds in USD
  roi: number;                   // ROI in USD (all time)
  activePositions: number;       // Number of positions in pools
  limitUtilization: number;      // 0-1 scale
  monthlyFees: number;           // $ spent on transactions this month
  monthlyFeeLimit: number;       // $ monthly fee limit
  totalTransactions: number;     // Total bot transactions count
  avgTransactionCost: number;    // Average transaction cost in $
  savedByOptimization: number;   // $ saved by gas optimization
  avgGasGwei: number;            // Average gas price in gwei
  lastExecutionAt?: string;      // Last execution timestamp
  lastExecutionMode?: string;    // Last execution mode (auto/manual)
}

interface DelegationInfo {
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingUsd: number;
  utilization: number;
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

export function AIAgentStatsCard({ 
  data, 
  delegation,
  accountAddress 
}: { 
  data: AIAgentStatsData;
  delegation: DelegationInfo;
  accountAddress?: string;
}) {
  const { data: pendingSummary } = usePendingRebalanceSummary(accountAddress || '');

  // Calculate gradient highlighting for pending rebalances
  const totalBenefit = (pendingSummary?.estimatedGasSavings || 0) + (pendingSummary?.estimatedApyGain || 0);
  
  let highlightClass = '';
  let textClass = 'text-slate-100';
  
  if (totalBenefit >= 1000) {
    highlightClass = 'border-amber-400/80 bg-amber-500/30 shadow-lg shadow-amber-500/20';
    textClass = 'text-amber-100 font-semibold';
  } else if (totalBenefit >= 100) {
    highlightClass = 'border-amber-400/60 bg-amber-500/20 shadow-md shadow-amber-500/10';
    textClass = 'text-amber-200 font-medium';
  } else if (totalBenefit >= 10) {
    highlightClass = 'border-amber-400/40 bg-amber-500/10';
    textClass = 'text-amber-300';
  } else if (totalBenefit > 0) {
    highlightClass = 'border-amber-400/20 bg-amber-500/5';
    textClass = 'text-amber-300/60';
  }

  const utilizationPercent = (delegation.utilization * 100).toFixed(1);

  // Calculate time since last execution
  const getTimeSince = (timestamp?: string) => {
    if (!timestamp) return null;
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const lastRunText = getTimeSince(data.lastExecutionAt);
  const isNewAgent = data.totalTransactions === 0;

  return (
    <article className="glass-card p-6 space-y-4">
      <header className="flex items-center justify-between mb-2">
        <h3 className="text-sm uppercase text-slate-400">AI Agent Statistics</h3>
        <div className="flex items-center gap-2">
          {lastRunText && (
            <span className="text-xs text-slate-500" title={data.lastExecutionAt}>
              Last run: {lastRunText}
            </span>
          )}
          <span className="rounded-full border px-3 py-1 text-[11px] uppercase text-emerald-200 border-emerald-400/40 bg-emerald-500/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Active
          </span>
        </div>
      </header>
      
      {/* Getting Started Block for New Users */}
      {isNewAgent && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-200 mb-1">AI Agent Started!</h4>
              <p className="text-sm text-blue-300/80">
                Your AI agent is analyzing the market. First trades will appear within 30 minutes.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <span>✓</span>
              <span>Delegation created (${formatter.format(delegation.dailyLimitUsd)} daily limit)</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <span>✓</span>
              <span>Auto-execution enabled</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <span className="animate-pulse">⟳</span>
              <span>Analyzing pools...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/10">
        <div>
          <p className="text-xs text-slate-400 mb-1">AI Portfolio Value</p>
          <p className="text-xl font-semibold text-white">
            {formatter.format(data.portfolioValue)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-slate-400 mb-1">ROI</p>
          {isNewAgent ? (
            <p className="text-base text-slate-400 italic">
              Waiting for first trade...
            </p>
          ) : (
            <p className={`text-xl font-semibold ${data.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatter.format(data.roi)}
            </p>
          )}
        </div>
        
        <div>
          <p className="text-xs text-slate-400 mb-1">Active Positions</p>
          <p className="text-xl font-semibold text-white">
            {data.activePositions}
          </p>
        </div>
      </div>
      
      {/* Pending Rebalances */}
      {pendingSummary && pendingSummary.totalCount > 0 && (
        <Link 
          href="/wizard"
          className={`block rounded-lg border px-4 py-3 transition hover:scale-[1.02] ${highlightClass || 'border-slate-700 bg-slate-800/50'}`}
          title={pendingSummary ? `
${pendingSummary.totalCount} pending rebalances • ${formatter.format(pendingSummary.totalAmountUsd)} queued

Potential savings if executed now:
• Gas savings: ${formatter.format(pendingSummary.estimatedGasSavings)}
• APY gain: ${formatter.format(pendingSummary.estimatedApyGain)}
• Total benefit: ${formatter.format(totalBenefit)}

${pendingSummary.oldestPendingDays > 0 ? `Oldest pending: ${pendingSummary.oldestPendingDays} day(s)` : ''}

Click to review and push immediately
          `.trim() : 'No pending rebalances'}
        >
          <div className={`flex items-center justify-between ${textClass}`}>
            <span className="text-sm">Pending rebalances</span>
            <span className="text-lg font-semibold">{pendingSummary.totalCount}</span>
          </div>
        </Link>
      )}
      
      {/* Limit Utilization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Limit Utilization</span>
          <span className="text-white font-medium">{utilizationPercent}%</span>
        </div>
        
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
            style={{ width: `${Math.min(delegation.utilization * 100, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>Spent: {formatter.format(delegation.spent24hUsd)}</span>
          <span>Remaining: {formatter.format(delegation.remainingUsd)}</span>
        </div>
      </div>
      
      {/* Monthly Fee Limits */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Monthly Fee Limits</span>
          <span className="text-white font-medium">
            {((data.monthlyFees / data.monthlyFeeLimit) * 100).toFixed(1)}%
          </span>
        </div>
        
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${Math.min((data.monthlyFees / data.monthlyFeeLimit) * 100, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-slate-500">
          <span>Spent: {formatter.format(data.monthlyFees)}</span>
          <span>Limit: {formatter.format(data.monthlyFeeLimit)}</span>
        </div>
        
        {/* Transaction Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500">Total Transactions</p>
            <p className="text-slate-200 font-medium">
              {isNewAgent ? '–' : data.totalTransactions}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-slate-500">Avg Cost</p>
            <p className="text-slate-200 font-medium">
              {isNewAgent ? '–' : formatter.format(data.avgTransactionCost)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-slate-500">Saved by Optimization</p>
            <p className="text-emerald-400 font-medium">
              {isNewAgent ? '–' : formatter.format(data.savedByOptimization)}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-slate-500">Avg Gas</p>
            <p className="text-slate-200 font-medium">{data.avgGasGwei} gwei</p>
          </div>
        </div>
      </div>
    </article>
  );
}
