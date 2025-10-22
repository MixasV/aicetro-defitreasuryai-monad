'use client';

import Link from 'next/link';
import { usePendingRebalanceSummary } from '@/hooks/usePendingRebalance';
import { Clock, TrendingUp } from 'lucide-react';

interface DelegationData {
  dailyLimitUsd: number;
  spent24hUsd: number;
  remainingUsd: number;
  utilization: number;
  maxRiskScore: number;
  paused: boolean;
}

interface FeesData {
  total: number;
  ai: number;
  manual: number;
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 2 
});

export function DelegationGuardrailsCard({ 
  delegation, 
  fees,
  accountAddress
}: { 
  delegation: DelegationData; 
  fees: FeesData;
  accountAddress?: string;
}) {
  const utilizationPercent = Math.round(delegation.utilization * 100);
  const statusLabel = delegation.paused ? 'PAUSED' : 'ACTIVE';
  const statusTone = delegation.paused 
    ? 'text-rose-300 border-rose-400/40 bg-rose-500/10' 
    : 'text-emerald-200 border-emerald-400/40 bg-emerald-500/10';
  
  // Fetch pending rebalancing summary
  const { data: pendingSummary } = usePendingRebalanceSummary(accountAddress);

  return (
    <article className="glass-card space-y-4 p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">Delegation Guardrails</h3>
        <span className={`rounded-full border px-3 py-1 text-[11px] uppercase ${statusTone}`}>
          {statusLabel}
        </span>
      </header>
      
      <div className="space-y-2 text-xs text-slate-300">
        <div className="flex justify-between">
          <span>Daily Limit:</span>
          <span className="font-medium">{formatter.format(delegation.dailyLimitUsd)}</span>
        </div>
        <div className="flex justify-between">
          <span>Spent (24h):</span>
          <span className="font-medium">{formatter.format(delegation.spent24hUsd)}</span>
        </div>
        <div className="flex justify-between">
          <span>Remaining:</span>
          <span className="font-medium">{formatter.format(delegation.remainingUsd)}</span>
        </div>
        <div className="flex justify-between">
          <span>Max Risk Score:</span>
          <span className="font-medium">{delegation.maxRiskScore}</span>
        </div>
      </div>

      {/* Pending Rebalancing Indicator */}
      {pendingSummary && pendingSummary.totalCount > 0 && (
        <Link 
          href="/wizard"
          className="block border-t border-white/10 pt-3"
        >
          <div className="glass-card-highlight rounded-lg p-3 transition hover:bg-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40">
                  <Clock className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-200">
                    {pendingSummary.totalCount} Pending Rebalance{pendingSummary.totalCount > 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatter.format(pendingSummary.totalAmountUsd)} queued
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    +{formatter.format(pendingSummary.estimatedGasSavings + pendingSummary.estimatedApyGain)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">potential savings</p>
              </div>
            </div>
            
            {pendingSummary.oldestPendingDays > 0 && (
              <p className="mt-2 text-[10px] text-amber-400/70">
                Oldest pending: {pendingSummary.oldestPendingDays} day{pendingSummary.oldestPendingDays > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Link>
      )}

      <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Total Fees Paid:</span>
          <span className="font-medium text-white">{formatter.format(fees.total)}</span>
        </div>
        <div className="flex justify-between pl-4">
          <span className="text-slate-500">AI Agent:</span>
          <span className="text-emerald-400/70">{formatter.format(fees.ai)}</span>
        </div>
        <div className="flex justify-between pl-4">
          <span className="text-slate-500">Manual:</span>
          <span className="text-slate-400">{formatter.format(fees.manual)}</span>
        </div>
      </div>
    </article>
  );
}
