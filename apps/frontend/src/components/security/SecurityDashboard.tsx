'use client';

import type { SecurityCheckItem } from '@defitreasuryai/types';
import { useSecurityDashboard } from '../../hooks/useSecurityDashboard';

export const SecurityDashboard = ({ account }: { account: string }) => {
  const { summary, isLoading, isError, refresh } = useSecurityDashboard(account);

  if (isError) {
    return (
      <section className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
        Failed to load security dashboard. <button onClick={() => refresh()} className="underline">Retry</button>
      </section>
    );
  }

  if (isLoading || summary == null) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Loading trustless guarantees…
      </section>
    );
  }

  const delegation = summary.delegation;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Security posture • {summary.mode.toUpperCase()}</p>
          <h2 className="text-lg font-semibold text-slate-100">Trustless security dashboard</h2>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-white/30"
        >
          <RefreshIcon /> Refresh
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          <p className="text-[11px] uppercase tracking-wide text-emerald-200">Delegation</p>
          {delegation != null ? (
            <div className="mt-2 space-y-1">
              <p>Delegate: <span className="font-mono">{delegation.delegate}</span></p>
              <p>Daily limit: ${delegation.dailyLimitUsd.toFixed(2)} • Remaining: ${delegation.remainingDailyLimitUsd.toFixed(2)}</p>
              <p>Whitelist: {delegation.whitelist.length} protocols • Max risk {delegation.maxRiskScore}/5</p>
            </div>
          ) : (
            <p className="mt-2 text-emerald-100/70">No active delegation configured.</p>
          )}
        </article>
        <article className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-50">
          <p className="text-[11px] uppercase tracking-wide text-amber-200">Emergency status</p>
          <div className="mt-2 space-y-1">
            <p>State: <span className="font-semibold">{summary.emergency.state === 'paused' ? 'Paused' : 'Active'}</span></p>
            <p>Updated: {new Date(summary.emergency.updatedAt).toLocaleString()}</p>
            {summary.emergency.lastAction ? (
              <p className="text-xs text-amber-200/80">
                Last action: {summary.emergency.lastAction.operation} • {summary.emergency.lastAction.message}
              </p>
            ) : null}
          </div>
        </article>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-200">Trustless guarantees</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-300">
          {summary.trustlessGuarantees.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Security checks</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {summary.checks.map((check) => (
            <SecurityCheckCard key={check.id} check={check} />
          ))}
        </div>
      </div>
    </section>
  );
};

const SecurityCheckCard = ({ check }: { check: SecurityCheckItem }) => {
  const statusMap: Record<SecurityCheckItem['status'], { label: string; className: string }> = {
    pass: { label: 'Pass', className: 'text-emerald-200 border-emerald-300/40 bg-emerald-300/10' },
    warn: { label: 'Warning', className: 'text-amber-200 border-amber-300/40 bg-amber-300/10' },
    fail: { label: 'Fail', className: 'text-rose-200 border-rose-300/40 bg-rose-300/10' }
  };

  const status = statusMap[check.status];

  return (
    <article className={`rounded-xl border ${status.className} p-4 text-xs`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-white/90">{check.title}</p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">
          {status.label}
        </span>
      </div>
      {check.details ? <p className="mt-2 text-white/70">{check.details}</p> : null}
      {check.remediation ? <p className="mt-2 text-[10px] text-white/60">Next steps: {check.remediation}</p> : null}
    </article>
  );
};

const RefreshIcon = () => (
  <svg
    className="h-3.5 w-3.5 text-slate-200"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M16.25 3.75v4h-4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 16.25v-4h4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 6.5a6 6 0 0 1 9.75 2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M13.5 13.5a6 6 0 0 1-9.75-2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
