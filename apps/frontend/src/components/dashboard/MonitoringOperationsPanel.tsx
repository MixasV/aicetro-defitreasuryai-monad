import type { MonitoringPollerRunSummary } from '@defitreasuryai/types';
import { useMemo } from 'react';
import { useMonitoringPoller } from '../../hooks/useMonitoringPoller';
import { useMonitoringStream } from '../../hooks/useMonitoringStream';
import { useMonitoringPollerHistory } from '../../hooks/useMonitoringPollerHistory';
import { useMonitoringPollerMetrics } from '../../hooks/useMonitoringPollerMetrics';

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const formatDuration = (value?: number | null) => {
  if (value == null) return '—';
  return `${(value / 1000).toFixed(1)} s`;
};

const renderSummary = (summary: MonitoringPollerRunSummary) => (
  <div className="rounded border border-white/10 bg-black/20 p-3 text-xs text-slate-200">
    <p className="text-slate-100">{formatDateTime(summary.finishedAt)}</p>
    <p className="mt-1 text-slate-300">
      Source: {summary.source === 'automatic' ? 'automatic' : 'manual'} • Accounts: {summary.processedAccounts}
    </p>
    <p className="text-slate-300">
      Successes: {summary.successCount} • Errors: {summary.errorCount} • Duration: {formatDuration(summary.durationMs)}
    </p>
    {summary.results.length > 0 ? (
      <ul className="mt-2 space-y-1 text-slate-400">
        {summary.results.slice(0, 4).map((result) => (
          <li key={`${result.account}-${result.error ?? 'ok'}`} className="rounded bg-black/10 px-2 py-1">
            <span className="font-medium text-slate-200">{result.account}</span> —{' '}
            {result.error ? (
              <span className="text-rose-300">{result.error}</span>
            ) : (
              <span className="text-emerald-300">
                Snapshot: {result.snapshotFetched ? '✓' : '•'} • Alerts: {result.alertsFetched ? '✓' : '•'} • Risk:{' '}
                {result.riskCalculated ? '✓' : '•'}
              </span>
            )}
          </li>
        ))}
        {summary.results.length > 4 ? <li className="text-slate-500">and {summary.results.length - 4} more account(s)…</li> : null}
      </ul>
    ) : null}
  </div>
);

export const MonitoringOperationsPanel = () => {
  const poller = useMonitoringPoller();
  const stream = useMonitoringStream();
  const pollerHistory = useMonitoringPollerHistory(5);
  const pollerMetrics = useMonitoringPollerMetrics();

  const latestSummary = useMemo<MonitoringPollerRunSummary | null>(() => {
    if (poller.lastRunResponse?.summary != null) return poller.lastRunResponse.summary;
    if (pollerHistory.history.length > 0) return pollerHistory.history[0];
    return poller.status?.lastSummary ?? null;
  }, [poller.lastRunResponse?.summary, poller.status?.lastSummary, pollerHistory.history]);

  const historyEntries = useMemo(() => {
    if (latestSummary == null) {
      return pollerHistory.history;
    }

    return pollerHistory.history.filter((entry) => entry.finishedAt !== latestSummary.finishedAt);
  }, [pollerHistory.history, latestSummary]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="glass-card space-y-4 p-6">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Monitoring Poller</h3>
          <span className="text-xs text-slate-400">
            {poller.status?.enabled ? 'enabled' : 'disabled'} • interval {formatDuration(poller.status?.intervalMs)}
          </span>
        </header>

        {poller.isLoading && !poller.status ? (
          <p className="text-sm text-slate-400">Loading monitoring status…</p>
        ) : poller.status ? (
          <div className="space-y-3 text-sm text-slate-200">
            <p>
              Run state: {poller.status.running ? 'running' : 'idle'} • Last run:{' '}
              {formatDateTime(poller.status.lastRunAt)}
            </p>
            {poller.status.lastError ? (
              <p className="text-xs text-amber-300">Error: {poller.status.lastError}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No poller status available.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void poller.start().then(() => {
                void pollerHistory.refresh();
                void pollerMetrics.refresh();
              });
            }}
            disabled={poller.isStarting || poller.status?.enabled === true}
            className="rounded-md border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 disabled:opacity-40"
          >
            {poller.isStarting ? 'Starting…' : 'Start'}
          </button>
          <button
            type="button"
            onClick={() => {
              void poller.stop().then(() => {
                void pollerHistory.refresh();
                void pollerMetrics.refresh();
              });
            }}
            disabled={poller.isStopping || poller.status?.enabled === false}
            className="rounded-md border border-amber-400/40 px-3 py-1 text-xs text-amber-200 disabled:opacity-40"
          >
            {poller.isStopping ? 'Stopping…' : 'Stop'}
          </button>
          <button
            type="button"
            onClick={() => {
              void poller.runOnce().then(() => {
                void pollerHistory.refresh();
                void pollerMetrics.refresh();
              });
            }}
            disabled={poller.isRunningOnce}
            className="rounded-md border border-primary-400/40 px-3 py-1 text-xs text-primary-100 disabled:opacity-40"
          >
            {poller.isRunningOnce ? 'Running…' : 'Run cycle'}
          </button>
        </div>

        {poller.actionError ? <p className="text-xs text-rose-300">{poller.actionError.message}</p> : null}
        {poller.lastRunResponse?.message ? (
          <p className="text-xs text-amber-300">{poller.lastRunResponse.message}</p>
        ) : null}

        {pollerMetrics.metrics ? (
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-200 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Runs</p>
              <p className="text-lg font-semibold text-white">{pollerMetrics.metrics.totalRuns}</p>
            </div>
            <div className="rounded-lg border border-emerald-600/50 bg-emerald-900/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-emerald-200">Success rate</p>
              <p className="text-lg font-semibold text-emerald-100">
                {(pollerMetrics.metrics.successRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg border border-cyan-600/40 bg-cyan-900/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-cyan-200">Duration</p>
              <p className="text-lg font-semibold text-cyan-100">
                {pollerMetrics.metrics.averageDurationMs}
                <span className="ml-1 text-xs text-cyan-200">ms</span>
              </p>
            </div>
            <div className="rounded-lg border border-indigo-600/40 bg-indigo-900/20 p-3">
              <p className="text-[11px] uppercase tracking-wide text-indigo-200">Accounts / cycle</p>
              <p className="text-lg font-semibold text-indigo-100">
                {pollerMetrics.metrics.averageAccountsPerRun.toFixed(1)}
              </p>
            </div>
          </div>
        ) : pollerMetrics.isLoading ? (
          <p className="text-xs text-slate-400">Collecting metrics…</p>
        ) : null}

        {latestSummary ? (
          <div className="space-y-2 text-xs text-slate-300">
            <h4 className="text-sm font-semibold text-white">Latest cycle</h4>
            {renderSummary(latestSummary)}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No monitoring cycles executed yet.</p>
        )}

        <div className="space-y-2 text-xs text-slate-300">
          <h4 className="text-sm font-semibold text-white">Run history</h4>
          {pollerHistory.isLoading && historyEntries.length === 0 ? (
            <p className="text-xs text-slate-400">Loading history…</p>
          ) : historyEntries.length > 0 ? (
            <div className="space-y-2">
              {historyEntries.map((summary, index) => (
                <div key={`${summary.finishedAt}-${index}`}>{renderSummary(summary)}</div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No monitoring history yet.</p>
          )}
        </div>
      </article>

      <article className="glass-card space-y-4 p-6">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Envio Stream</h3>
          <span className="text-xs text-slate-400">
            {stream.status?.running ? 'running' : 'stopped'} • subscriptions: {stream.status?.observedAccounts ?? 0}
          </span>
        </header>

        {stream.isLoading && !stream.status ? (
          <p className="text-sm text-slate-400">Loading stream status…</p>
        ) : stream.status ? (
          <div className="space-y-2 text-sm text-slate-200">
            <p>
              Connection: {stream.status.connected ? 'online' : 'offline'} • Last event: {formatDateTime(stream.status.lastEventAt)}
            </p>
            {stream.status.lastError ? (
              <p className="text-xs text-amber-300">Error: {stream.status.lastError}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No stream status available.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void stream.start();
            }}
            disabled={stream.isStarting || stream.status?.running === true}
            className="rounded-md border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 disabled:opacity-40"
          >
            {stream.isStarting ? 'Connecting…' : 'Connect'}
          </button>
          <button
            type="button"
            onClick={() => {
              void stream.stop();
            }}
            disabled={stream.isStopping || stream.status?.running === false}
            className="rounded-md border border-amber-400/40 px-3 py-1 text-xs text-amber-200 disabled:opacity-40"
          >
            {stream.isStopping ? 'Disconnecting…' : 'Disconnect'}
          </button>
        </div>

        {stream.actionError ? <p className="text-xs text-rose-300">{stream.actionError.message}</p> : null}
      </article>
    </section>
  );
};
