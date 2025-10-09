import { useEffect, useState } from 'react';
import type { EmergencyActionResponse, EmergencyLogEntry, EmergencyStatus } from '@defitreasuryai/types';
import { useHealthStatus } from '../../hooks/useHealthStatus';
import { useEmergencyLog } from '../../hooks/useEmergencyLog';
import { useEmergencyStatus } from '../../hooks/useEmergencyStatus';
import { useEmergencyEvents } from '../../hooks/useEmergencyEvents';
import { useEmergencyControlSnapshot } from '../../hooks/useEmergencyControlSnapshot';
import { apiClient } from '../../lib/api';

const STATUS_LABELS: Record<'ok' | 'degraded' | 'critical', string> = {
  ok: 'Operational',
  degraded: 'Degraded',
  critical: 'Critical'
};

const STATUS_COLORS: Record<'ok' | 'degraded' | 'critical', string> = {
  ok: 'text-emerald-400',
  degraded: 'text-amber-300',
  critical: 'text-rose-400'
};

const COMPONENT_LABELS: Record<string, string> = {
  database: 'PostgreSQL',
  envio: 'Envio HyperIndex',
  openrouter: 'OpenRouter API',
  scheduler: 'AI Scheduler',
  emergency_controls: 'Emergency Controls'
};

const EMERGENCY_STATUS_LABELS: Record<'success' | 'error', string> = {
  success: 'Success',
  error: 'Error'
};

const EMERGENCY_STATUS_COLORS: Record<'success' | 'error', string> = {
  success: 'text-emerald-400',
  error: 'text-rose-400'
};

const EMERGENCY_ACTION_LABELS: Record<'stop' | 'resume' | 'auto', string> = {
  stop: 'Emergency stop',
  resume: 'Resume',
  auto: 'System update'
};

const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

const buildActionFromLogEntry = (
  status: EmergencyStatus | null,
  entry?: EmergencyLogEntry | null
): EmergencyActionResponse | null => {
  if (entry == null) {
    return null;
  }

  const resolvedStatus: EmergencyStatus = status ?? {
    account: entry.account,
    state: 'active',
    updatedAt: entry.createdAt
  };

  const rawAction = entry.metadata?.action;
  const actionValue = typeof rawAction === 'string' ? rawAction : undefined;
  const operation: EmergencyActionResponse['operation'] =
    actionValue === 'stop' || actionValue === 'resume' || actionValue === 'auto' ? actionValue : 'auto';

  const rawMode = entry.metadata?.mode;
  const modeValue = typeof rawMode === 'string' ? rawMode : undefined;
  const baseMode: EmergencyActionResponse['mode'] =
    modeValue === 'executed' || modeValue === 'simulated' || modeValue === 'skipped' ? modeValue : 'executed';

  const computedMode: EmergencyActionResponse['mode'] =
    entry.status === 'error' ? 'skipped' : baseMode;

  return {
    operation,
    status: resolvedStatus,
    mode: computedMode,
    simulated: entry.metadata?.simulated === true,
    txHash: typeof entry.metadata?.txHash === 'string' ? entry.metadata.txHash : undefined,
    reason: typeof entry.metadata?.reason === 'string' ? entry.metadata.reason : undefined,
    message: entry.message,
    completedAt: entry.createdAt,
    logEntry: entry
  };
};

interface Props {
  accountAddress: string;
}

export const EmergencyPanel = ({ accountAddress }: Props) => {
  const [isStopping, setIsStopping] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [lastAction, setLastAction] = useState<EmergencyActionResponse | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const { status: healthStatus, isLoading: isHealthLoading, refresh } = useHealthStatus();
  const {
    entries: emergencyLog,
    isLoading: isLogLoading,
    refresh: refreshEmergencyLog,
    appendEntry,
    replaceEntries
  } = useEmergencyLog(accountAddress);
  const {
    status: emergencyStatus,
    isLoading: isStatusLoading,
    refresh: refreshEmergencyStatus,
    setStatus
  } = useEmergencyStatus(accountAddress);
  const { snapshot, refresh: refreshSnapshot } = useEmergencyControlSnapshot(accountAddress);

  useEmergencyEvents(accountAddress, {
    onStatus: (status) => {
      void setStatus(status);
    },
    onLog: (entry) => {
      void appendEntry(entry);
      const action = buildActionFromLogEntry(emergencyStatus ?? snapshot?.status ?? null, entry);
      if (action != null) {
        setLastAction(action);
        setLastErrorMessage(null);
      }
    },
    onLogBatch: (entries) => {
      void replaceEntries(entries);
      const [latest] = entries;
      if (latest != null) {
        const action = buildActionFromLogEntry(emergencyStatus ?? snapshot?.status ?? null, latest);
        if (action != null) {
          setLastAction(action);
          setLastErrorMessage(null);
        }
      }
    },
    onError: () => {
      void refreshSnapshot();
    }
  });

  useEffect(() => {
    if (snapshot?.status != null) {
      void setStatus(snapshot.status);
    }

    if (snapshot?.lastAction != null) {
      setLastAction((current) => {
        const currentId = current?.logEntry?.id;
        const incomingId = snapshot.lastAction?.logEntry?.id;
        if (currentId != null && incomingId === currentId) {
          return current;
        }
        return snapshot.lastAction ?? current;
      });
      setLastErrorMessage(null);
    } else if (snapshot != null && snapshot.lastAction == null) {
      setLastAction(null);
    }
  }, [snapshot, setStatus]);

  const lastUpdatedLabel = healthStatus?.timestamp
    ? new Date(healthStatus.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : null;

  const handleEmergencyStop = async () => {
    setIsStopping(true);
    try {
      const response = await apiClient.triggerEmergencyStop(accountAddress);
      setLastAction(response);
      setLastErrorMessage(null);
      void setStatus(response.status);
      if (response.logEntry != null) {
        await appendEntry(response.logEntry);
      }
      await Promise.all([refreshEmergencyStatus(), refreshEmergencyLog(), refreshSnapshot()]);
    } catch (error) {
      console.error(error);
      setLastAction(null);
      setLastErrorMessage('Emergency stop failed.');
      await Promise.all([refreshEmergencyStatus(), refreshEmergencyLog(), refreshSnapshot()]);
    }
    setIsStopping(false);
  };

  const handleEmergencyResume = async () => {
    setIsResuming(true);
    try {
      const response = await apiClient.resumeEmergency(accountAddress);
      setLastAction(response);
      setLastErrorMessage(null);
      void setStatus(response.status);
      if (response.logEntry != null) {
        await appendEntry(response.logEntry);
      }
      await Promise.all([refreshEmergencyStatus(), refreshEmergencyLog(), refreshSnapshot()]);
    } catch (error) {
      console.error(error);
      setLastAction(null);
      setLastErrorMessage('Emergency resume failed.');
      await Promise.all([refreshEmergencyStatus(), refreshEmergencyLog(), refreshSnapshot()]);
    }
    setIsResuming(false);
  };

  const overallStatus = healthStatus?.status ?? null;
  const overallStatusLabel = overallStatus != null ? STATUS_LABELS[overallStatus] : isHealthLoading ? 'Checking…' : 'No data';
  const overallStatusColor = overallStatus != null ? STATUS_COLORS[overallStatus] : 'text-slate-200';
  const emergencyState = emergencyStatus?.state ?? 'active';
  const emergencyLabel = emergencyState === 'paused' ? 'Paused' : 'Active';
  const emergencyDescription = emergencyState === 'paused' ? 'AI executions are halted.' : 'AI executions are active.';
  const metadata = emergencyStatus?.metadata;
  const lastActionMetadata = lastAction?.logEntry?.metadata;
  const lastActionTime = lastAction?.completedAt ?? null;
  const lastActionMode = lastAction?.mode ?? null;
  const lastActionSimulated = lastAction?.simulated ?? (lastActionMetadata?.simulated === true);
  const lastActionReason = lastAction?.reason ?? (typeof lastActionMetadata?.reason === 'string' ? String(lastActionMetadata.reason) : undefined);
  const lastActionTxHash = lastAction?.txHash ?? (typeof lastActionMetadata?.txHash === 'string' ? String(lastActionMetadata.txHash) : undefined);
  const isOperationInProgress = isStopping || isResuming;

  return (
    <div className="glass-card space-y-6 p-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Emergency Controls</h2>
        <p className="text-sm text-slate-300">
          The CFO can halt AI activity instantly and trigger a manual unwind at any time.
        </p>
      </header>

      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">Platform infrastructure</p>
          <span className={`text-xs font-semibold uppercase tracking-wide ${overallStatusColor}`}>{overallStatusLabel}</span>
        </div>

        <ul className="mt-3 space-y-2">
          {isHealthLoading && healthStatus == null ? (
            <li className="text-xs text-indigo-200/70">Checking service health…</li>
          ) : healthStatus?.indicators.length ? (
            healthStatus.indicators.map((indicator) => (
              <li key={indicator.component} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200/90">
                    {COMPONENT_LABELS[indicator.component] ?? indicator.component}
                  </p>
                  {indicator.message != null ? (
                    <p className="text-xs text-indigo-100/70">{indicator.message}</p>
                  ) : null}
                </div>
                <span className={`text-xs font-semibold ${STATUS_COLORS[indicator.status]}`}>{STATUS_LABELS[indicator.status]}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-indigo-200/70">No service health data available</li>
          )}
        </ul>

        <div className="mt-3 flex items-center justify-between text-xs text-indigo-200/60">
          <p>{lastUpdatedLabel != null ? `Updated: ${lastUpdatedLabel}` : 'No refresh timestamp'}</p>
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="rounded-md border border-indigo-400/40 px-3 py-1 text-indigo-100 transition hover:border-indigo-200/80 hover:text-white"
          >
            Refresh
          </button>
        </div>
        {healthStatus?.metadata != null ? (
          <p className="mt-2 text-[11px] text-indigo-200/70">
            Alert webhook: {healthStatus.metadata.alertWebhookConfigured ? 'active' : 'not configured'} • Risk ≥{' '}
            {healthStatus.metadata.alertRiskThreshold.toFixed(2)} • Utilization ≥{' '}
            {(healthStatus.metadata.alertUtilizationThreshold * 100).toFixed(0)}%
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Status: {isStatusLoading ? 'Resolving…' : emergencyLabel}</p>
          {metadata?.txHash != null ? (
            <span className="text-[11px] text-rose-200/70">tx: {metadata.txHash.slice(0, 10)}…</span>
          ) : null}
        </div>
        <p className="mt-1 text-rose-200/80">{emergencyDescription}</p>
        {metadata?.reason != null ? (
          <p className="mt-2 text-xs text-rose-200/70">Reason: {metadata.reason}</p>
        ) : null}
        {metadata?.action != null ? (
          <p className="mt-1 text-xs text-rose-200/70">
            Last action: {EMERGENCY_ACTION_LABELS[metadata.action] ?? metadata.action}
          </p>
        ) : null}
        {metadata?.simulated === true ? (
          <p className="mt-2 text-xs text-amber-300/80">Executed in demo mode.</p>
        ) : null}
        {lastAction != null ? (
          <div className="mt-3 rounded-lg border border-rose-200/20 bg-rose-200/5 p-3 text-xs text-rose-100">
            <p className="font-semibold uppercase tracking-wide text-rose-200/80">
              {lastAction.operation === 'stop' ? 'Most recent stop' : 'Most recent resume'}
            </p>
            <p className="mt-1 text-[13px] text-rose-50/90">{lastAction.message}</p>
            {lastActionMode != null ? (
              <p className="mt-2 text-rose-200/70">Mode: {lastActionMode === 'executed' ? 'Executed' : lastActionMode === 'simulated' ? 'Simulated' : 'Skipped'}</p>
            ) : null}
            {lastActionReason != null ? (
              <p className="text-rose-200/60">Reason: {lastActionReason}</p>
            ) : null}
            {lastActionTxHash != null ? (
              <p className="text-rose-200/60">tx: {lastActionTxHash.slice(0, 12)}…</p>
            ) : null}
            {lastActionTime != null ? (
              <p className="text-rose-200/60">Completed: {new Date(lastActionTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
              </p>
            ) : null}
            {lastActionSimulated ? (
              <p className="mt-1 text-amber-200/70">Executed in demo mode.</p>
            ) : null}
          </div>
        ) : lastErrorMessage != null ? (
          <p className="mt-3 text-xs text-rose-200/80">{lastErrorMessage}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleEmergencyStop}
          disabled={isStopping || emergencyState === 'paused'}
          className="rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition disabled:bg-rose-900"
        >
          {isStopping ? 'Stopping…' : emergencyState === 'paused' ? 'AI paused' : 'Activate stop'}
        </button>
        <button
          type="button"
          onClick={handleEmergencyResume}
          disabled={isResuming || emergencyState === 'active'}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition disabled:bg-emerald-900"
        >
          {isResuming ? 'Resuming…' : emergencyState === 'active' ? 'AI active' : 'Resume operations'}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Activity log</h3>
          <button
            type="button"
            onClick={() => {
              if (isOperationInProgress) return;
              void Promise.all([refreshEmergencyLog(), refreshEmergencyStatus()]);
            }}
            className="rounded-md border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:border-white/30 hover:text-white"
          >
            Refresh
          </button>
        </header>

        {isLogLoading && emergencyLog.length === 0 ? (
          <p className="text-xs text-slate-400">Fetching latest events…</p>
        ) : emergencyLog.length === 0 ? (
          <p className="text-xs text-slate-400">No emergency stop events recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {emergencyLog.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${EMERGENCY_STATUS_COLORS[entry.status]}`}>
                    {EMERGENCY_STATUS_LABELS[entry.status]}
                  </span>
                  <span className="text-slate-400">{formatTimestamp(entry.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-200">{entry.message}</p>
                {entry.metadata?.reason ? (
                  <p className="mt-1 text-xs text-slate-400">Reason: {String(entry.metadata.reason)}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
