import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Zap, 
  RefreshCw, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import { useAIExecution } from '../../hooks/useAIExecution';
import { useAIPreview } from '../../hooks/useAIPreview';
import { useDelegationToolkit } from '../../hooks/useDelegation';
import { useDelegations } from '../../hooks/useDelegations';
import { useAIExecutionHistory } from '../../hooks/useAIExecutionHistory';
import { useAISimulations } from '../../hooks/useAISimulations';
import { useAIScheduler } from '../../hooks/useAIScheduler';
import { useAIExecutionSummary } from '../../hooks/useAIExecutionSummary';
import { useAIExecutionAnalytics } from '../../hooks/useAIExecutionAnalytics';
import { useOpenRouterMetrics } from '../../hooks/useOpenRouterMetrics';
import type {
  AIExecutionAction,
  AIExecutionRequest,
  AIExecutionRecord,
  AIExecutionProtocolStat,
  AIRecommendationRequest,
  AllocationRecommendation,
  OpenRouterCallMetric,
  PortfolioSnapshot,
  AIRecommendationEvaluation,
  AISimulationLogEntry
} from '@defitreasuryai/types';
import { DEMO_AI_DELEGATE, DEMO_PROTOCOLS } from '../../config/demo';
import { EnhancedAIRecommendations } from './EnhancedAIRecommendations';

interface Props {
  portfolio: PortfolioSnapshot;
  accountAddress: string;
  usingDemo?: boolean;
}

const METRIC_STATUS_LABELS: Record<OpenRouterCallMetric['status'], string> = {
  success: 'Success',
  error: 'Error',
  skipped: 'Skipped'
};

const METRIC_STATUS_COLORS: Record<OpenRouterCallMetric['status'], string> = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  skipped: 'text-amber-300'
};

export const AIControlsPanel = ({ portfolio, accountAddress, usingDemo }: Props) => {
  // UI State
  const [showRecommendationReasoning, setShowRecommendationReasoning] = useState(false);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);
  const [showExecutionDetails, setShowExecutionDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Data Hooks
  const { generate, recommendations, isLoading: isGenerating } = useAIRecommendations();
  const { execute, result, isLoading: isExecuting } = useAIExecution();
  const { runPreview, preview, isLoading: isPreviewing } = useAIPreview();
  const { createDelegation } = useDelegationToolkit();
  const { history, isLoading: isHistoryLoading, refresh } = useAIExecutionHistory(accountAddress);
  const { simulations, isLoading: isSimulationsLoading, refresh: refreshSimulations } = useAISimulations(accountAddress, 10);
  const {
    summary,
    isLoading: isSummaryLoading,
    refresh: refreshSummary
  } = useAIExecutionSummary(accountAddress);
  const {
    analytics,
    isLoading: isAnalyticsLoading,
    refresh: refreshAnalytics
  } = useAIExecutionAnalytics(accountAddress);
  const {
    telemetry,
    isLoading: isTelemetryLoading,
    isError: isTelemetryError,
    isRefreshing: isTelemetryRefreshing,
    refresh: refreshTelemetry
  } = useOpenRouterMetrics(15);
  const {
    status: schedulerStatus,
    isLoading: isSchedulerLoading,
    start: startScheduler,
    stop: stopScheduler,
    runOnce: runSchedulerOnce,
    isStarting,
    isStopping,
    isRunningOnce,
    lastRunResponse,
    actionError
  } = useAIScheduler();
  const { delegations, isLoading: isDelegationsLoading } = useDelegations(accountAddress);
  const delegateAddress = delegations[0]?.delegate ?? DEMO_AI_DELEGATE;

  const delegationConstraints = useMemo(() => {
    const primary = delegations[0];
    const parseValue = (value: string | number | undefined, fallback: number): number => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
      return fallback;
    };

    const baseDailyLimit = parseValue(primary?.dailyLimit, portfolio.totalValueUSD);
    const baseSpent = parseValue(primary?.spent24h, Math.min(baseDailyLimit, portfolio.totalValueUSD * 0.1));
    const whitelist = primary?.allowedProtocols?.length ? primary.allowedProtocols : [...DEMO_PROTOCOLS];

    return {
      dailyLimitUsd: Number(baseDailyLimit.toFixed(2)),
      remainingDailyLimitUsd: Number(Math.max(0, baseDailyLimit - baseSpent).toFixed(2)),
      maxRiskScore: primary?.maxRiskScore ?? 3,
      whitelist,
      notes: primary ? `Updated ${new Date(primary.updatedAt).toLocaleString('en-US')}` : undefined
    };
  }, [delegations, portfolio.totalValueUSD]);

  const protocolList = delegationConstraints.whitelist.length > 0 ? delegationConstraints.whitelist : [...DEMO_PROTOCOLS];

  const renderEvaluation = (evaluation?: AIRecommendationEvaluation, caption?: string) => {
    if (!evaluation) return null;
    const warnings = evaluation.warnings ?? [];

    return (
      <div className="rounded-lg border border-primary-400/30 bg-black/30 p-3 text-xs text-slate-200">
        {caption ? <p className="text-[10px] uppercase tracking-wide text-slate-400">{caption}</p> : null}
        <p className="text-slate-100">
          Confidence {Math.round(evaluation.confidence * 100)}% • Risk {evaluation.riskScore.toFixed(2)}
        </p>
        {evaluation.notes ? <p className="mt-1 text-slate-300">{evaluation.notes}</p> : null}
        {warnings.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-amber-300">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  };

  const handleDelegationSetup = async () => {
    await createDelegation(accountAddress, delegateAddress, [...protocolList]);
  };

  const handleGenerate = async () => {
    setIsAnalyzing(true);
    const payload: AIRecommendationRequest = {
      portfolio,
      riskTolerance: 'balanced',
      protocols: [...protocolList],
      constraints: delegationConstraints,
      context: {
        account: accountAddress,
        delegate: delegateAddress,
        chainId: 10143,
        scenario: 'dashboard-generate'
      },
      evaluationGoals: ['respect-delegation-limits', 'optimize-yield']
    };

    await generate(payload);
    setIsAnalyzing(false);
    setShowRecommendationReasoning(false);
  };

  const handlePreview = async () => {
    const payload: AIExecutionRequest = {
      account: accountAddress,
      delegate: delegateAddress,
      riskTolerance: 'balanced',
      protocols: [...protocolList]
    };

    await runPreview(payload);
    await refreshSimulations();
  };

  const handleExecute = async () => {
    const payload: AIExecutionRequest = {
      account: accountAddress,
      delegate: delegateAddress,
      riskTolerance: 'balanced',
      protocols: [...protocolList]
    };

    await execute(payload);
    await Promise.all([refresh(), refreshSummary(), refreshAnalytics(), refreshSimulations()]);
  };

  const handleSchedulerStart = async () => {
    try {
      await startScheduler();
    } catch (error) {
      console.error('Failed to start scheduler', error);
    }
  };

  const handleSchedulerStop = async () => {
    try {
      await stopScheduler();
    } catch (error) {
      console.error('Failed to stop scheduler', error);
    }
  };

  const handleSchedulerRun = async () => {
    try {
      await runSchedulerOnce();
      await Promise.all([refreshSummary(), refresh(), refreshAnalytics()]);
    } catch (error) {
      console.error('Failed to run scheduler once', error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {usingDemo ? (
        <div className="md:col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          Demo mode: executing operations for the showcase account {accountAddress}. Configure your own smart account to
          operate with real limits.
        </div>
      ) : null}
      <section className="glass-card space-y-4 p-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-white">AI Strategy Controls</h2>
          <p className="text-sm text-slate-300">
            Configure the treasury policy and request AI recommendations tailored to the current portfolio.
          </p>
        </header>
        <div className="grid gap-3 text-xs text-slate-200 sm:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Daily limit</p>
              <p className="text-base font-semibold text-white">{delegationConstraints.dailyLimitUsd.toFixed(2)} USD</p>
              <p className="text-slate-400">
                Remaining: {delegationConstraints.remainingDailyLimitUsd.toFixed(2)} USD
              </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Risk guardrail</p>
              <p className="text-base font-semibold text-white">Risk ≤ {delegationConstraints.maxRiskScore}</p>
              <p className="text-slate-400">{delegationConstraints.notes ?? 'Delegation in sync'}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-slate-400">Whitelisted protocols</p>
              {isDelegationsLoading ? <span className="text-xs text-slate-500">Refreshing…</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {protocolList.map((protocol) => (
              <span key={protocol} className="rounded-full border border-white/10 px-3 py-1 text-xs">
                {protocol}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelegationSetup}
          className="rounded-lg border border-primary-400/40 px-4 py-2 text-xs text-primary-100"
        >
          Bootstrap AI delegation
        </button>
        <motion.button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg transition-shadow hover:shadow-xl disabled:opacity-40"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate AI Recommendations
            </>
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={handlePreview}
          disabled={isPreviewing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center rounded-lg border border-primary-400/40 px-6 py-3 text-sm font-medium text-primary-100 transition-all hover:bg-primary-400/10 disabled:opacity-40"
        >
          {isPreviewing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulating…
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              AI Preview
            </>
          )}
        </motion.button>
        <motion.button
          type="button"
          onClick={handleExecute}
          disabled={isExecuting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-medium text-white shadow-lg transition-shadow hover:bg-emerald-600 hover:shadow-xl disabled:opacity-40"
        >
          {isExecuting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing…
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Execute AI Strategy
            </>
          )}
        </motion.button>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">AI Scheduler</h4>
            {isSchedulerLoading ? <span className="text-xs text-slate-400">Loading…</span> : null}
          </div>
          {schedulerStatus ? (
            <div className="space-y-1 text-xs text-slate-300">
              <p>
                Status: <span className="text-white">{schedulerStatus.enabled ? 'enabled' : 'disabled'}</span>
              </p>
              <p>
                Running: <span className="text-white">{schedulerStatus.running ? 'yes' : 'no'}</span>
              </p>
              <p>Interval: {(schedulerStatus.intervalMs / 1000).toFixed(0)} s</p>
              <p>
                Last run:{' '}
                {schedulerStatus.lastRunAt ? new Date(schedulerStatus.lastRunAt).toLocaleString() : '—'}
              </p>
              {schedulerStatus.lastSummary ? (
                <p>
                  Outcome: {schedulerStatus.lastSummary.successCount} successes / {schedulerStatus.lastSummary.errorCount} errors
                </p>
              ) : null}
              {schedulerStatus.lastError ? <p className="text-amber-300">{schedulerStatus.lastError}</p> : null}
              {lastRunResponse?.message ? <p className="text-amber-300">{lastRunResponse.message}</p> : null}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No scheduler telemetry available.</p>
          )}
          {actionError ? <p className="mt-2 text-xs text-rose-300">{actionError.message}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSchedulerStart}
              disabled={isStarting || schedulerStatus?.enabled === true}
              className="rounded-md border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200 disabled:opacity-40"
            >
              {isStarting ? 'Starting…' : 'Enable'}
            </button>
            <button
              type="button"
              onClick={handleSchedulerStop}
              disabled={isStopping || schedulerStatus?.enabled === false}
              className="rounded-md border border-amber-400/40 px-3 py-1 text-xs text-amber-200 disabled:opacity-40"
            >
              {isStopping ? 'Stopping…' : 'Disable'}
            </button>
            <button
              type="button"
              onClick={handleSchedulerRun}
              disabled={isRunningOnce}
              className="rounded-md border border-primary-400/40 px-3 py-1 text-xs text-primary-100 disabled:opacity-40"
            >
              {isRunningOnce ? 'Running…' : 'Trigger once'}
            </button>
          </div>
          {lastRunResponse?.summary ? (
            <div className="mt-3 space-y-1 text-xs text-slate-300">
              <p className="text-slate-200">Manual run: {new Date(lastRunResponse.summary.finishedAt).toLocaleString()}</p>
              <p>
                Successes: {lastRunResponse.summary.successCount} • Errors: {lastRunResponse.summary.errorCount}
              </p>
              <p>
                Duration: {(lastRunResponse.summary.durationMs / 1000).toFixed(2)} s
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="glass-card space-y-4 p-6">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Outcomes</h3>
          <span className="text-xs text-slate-400">DeepSeek V3.1</span>
        </header>
        <div className="space-y-6 text-sm text-slate-200">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <h4 className="font-semibold text-white">AI metrics</h4>
              {isSummaryLoading ? <span className="text-xs text-slate-400">Loading…</span> : null}
            </div>
            {summary ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Total executions</p>
                    <p className="text-lg font-semibold text-white">{summary.totalExecutions}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Executed volume</p>
                    <p className="text-lg font-semibold text-white">{summary.executedVolumeUsd.toFixed(2)}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Average execution</p>
                    <p className="text-lg font-semibold text-white">{summary.averageExecutedUsd.toFixed(2)} USD</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Success rate</p>
                    <p className="text-lg font-semibold text-white">{(summary.successRate * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                  <p>
                    Past 24h: {summary.last24h.count} run(s) • {summary.last24h.volumeUsd.toFixed(2)} USD
                  </p>
                  <button
                    type="button"
                    onClick={() => refreshSummary()}
                    className="rounded border border-white/10 px-3 py-1 text-xs text-slate-200"
                  >
                    Refresh
                  </button>
                </div>
                {summary.lastExecution ? (
                  <div className="rounded-md border border-white/10 bg-black/20 p-3 text-xs text-slate-200">
                    <p className="text-slate-100">Last execution: {new Date(summary.lastExecution.generatedAt).toLocaleString()}</p>
                    <p className="text-slate-300">
                      Executed {summary.lastExecution.totalExecutedUsd.toFixed(2)} USD • Remaining limit{' '}
                      {summary.lastExecution.remainingDailyLimitUsd.toFixed(2)} USD
                    </p>
                    <p className="text-slate-400">{summary.lastExecution.summary}</p>
                  </div>
                ) : null}
                <div className="rounded-md border border-white/10 bg-black/10 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <h5 className="font-semibold text-white">Protocol analytics</h5>
                    {isAnalyticsLoading ? <span className="text-xs text-slate-400">Loading…</span> : null}
                  </div>
                  {analytics.executedProtocols > 0 ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span>Success: {(analytics.successRate * 100).toFixed(0)}%</span>
                        <span>Volume: {analytics.totalExecutedUsd.toFixed(2)} USD</span>
                        <button
                          type="button"
                          onClick={() => refreshAnalytics()}
                          className="rounded border border-white/10 px-2 py-1 text-xs text-slate-200"
                        >
                          Refresh
                        </button>
                      </div>
                      <div className="space-y-2">
                        {analytics.topProtocols.slice(0, 3).map((stat: AIExecutionProtocolStat) => (
                          <div key={stat.protocol} className="rounded bg-black/20 p-3 text-xs text-slate-200">
                            <div className="flex items-center justify-between text-white">
                              <span>{stat.protocol}</span>
                              <span>{stat.executedUsd.toFixed(2)} USD</span>
                            </div>
                            <p className="mt-1 text-slate-400">
                              Executed {stat.executedCount} • Skipped {stat.skippedCount} • APY {stat.averageAPY.toFixed(1)}% • Risk {stat.averageRisk.toFixed(1)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No protocol analytics yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No AI executions recorded yet.</p>
            )}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <h4 className="font-semibold text-white">OpenRouter Telemetry</h4>
              {isTelemetryLoading || isTelemetryRefreshing ? <span className="text-xs text-slate-400">Refreshing…</span> : null}
            </div>
            {isTelemetryError ? (
              <div className="space-y-3 text-xs text-rose-300">
                <p>Unable to load OpenRouter telemetry.</p>
                <button
                  type="button"
                  onClick={() => {
                    void refreshTelemetry();
                  }}
                  className="rounded border border-rose-400/40 px-3 py-1 text-rose-200"
                >
                  Retry
                </button>
              </div>
            ) : telemetry.summary.totalCalls === 0 ? (
              <p className="text-xs text-slate-400">OpenRouter has not been invoked yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Total calls</p>
                    <p className="text-lg font-semibold text-white">{telemetry.summary.totalCalls}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Succeeded</p>
                    <p className="text-lg font-semibold text-white">{telemetry.summary.successCount}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Errors</p>
                    <p className="text-lg font-semibold text-white">{telemetry.summary.errorCount}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Skipped</p>
                    <p className="text-lg font-semibold text-white">{telemetry.summary.skippedCount}</p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Average latency</p>
                    <p className="text-lg font-semibold text-white">
                      {typeof telemetry.summary.averageLatencyMs === 'number'
                        ? `${Math.round(telemetry.summary.averageLatencyMs)} ms`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-md bg-black/20 p-3">
                    <p className="text-xs uppercase text-slate-400">Most recent call</p>
                    <p className="text-lg font-semibold text-white">
                      {telemetry.summary.lastCallAt ? new Date(telemetry.summary.lastCallAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Last success:{' '}
                    {telemetry.summary.lastSuccessAt
                      ? new Date(telemetry.summary.lastSuccessAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '—'}
                  </span>
                  <span>
                    Last error:{' '}
                    {telemetry.summary.lastErrorAt
                      ? new Date(telemetry.summary.lastErrorAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Showing last {Math.min(telemetry.metrics.length, 5)} of {telemetry.metrics.length} entries</span>
                  <button
                    type="button"
                    onClick={() => {
                      void refreshTelemetry();
                    }}
                    className="rounded border border-white/10 px-3 py-1 text-xs text-slate-200"
                  >
                    Refresh
                  </button>
                </div>
                <ul className="space-y-2">
                  {telemetry.metrics.slice(0, 5).map((metric: OpenRouterCallMetric) => {
                    const tokenCount = metric.totalTokens ?? ((metric.inputTokens ?? 0) + (metric.outputTokens ?? 0));
                    return (
                      <li key={metric.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${METRIC_STATUS_COLORS[metric.status]}`}>
                            {METRIC_STATUS_LABELS[metric.status]}
                          </span>
                          <span className="text-slate-400">
                            {new Date(metric.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-100">{metric.model}</p>
                        {metric.provider ? <p className="text-slate-400">Provider: {metric.provider}</p> : null}
                        <p className="text-slate-300">
                          Latency: {Math.round(metric.latencyMs)} ms • Retries: {metric.retries}
                        </p>
                        <p className="text-slate-400">
                          Tokens: {tokenCount > 0 ? tokenCount : '—'} • Rate limit: {metric.rateLimitRemaining ?? '—'}
                        </p>
                        {metric.errorMessage ? <p className="mt-1 text-rose-300">{metric.errorMessage}</p> : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">AI Preview</h4>
              {preview ? (
                <span className="text-xs text-slate-500">{new Date(preview.generatedAt).toLocaleTimeString()}</span>
              ) : null}
            </div>
            {isPreviewing ? <p className="text-xs text-slate-400">AI is generating a dry-run plan…</p> : null}
            {preview ? (
              <div className="space-y-3">
                <p className="text-slate-100">{preview.summary}</p>
                {preview.model ? (
                  <p className="text-[11px] text-slate-400">
                    Model: {preview.model}
                    {preview.provider ? ` • Provider: ${preview.provider}` : ''}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  Executable: {preview.totalExecutableUsd.toFixed(2)} USD • Remaining limit:{' '}
                  {preview.remainingDailyLimitUsd.toFixed(2)} USD
                </p>
                <p className="text-xs text-slate-400">
                  Limit: {preview.delegation.dailyLimitUsd.toFixed(2)} USD • Spent (24h):{' '}
                  {preview.delegation.spent24hUsd.toFixed(2)} USD • Max risk {preview.delegation.maxRiskScore}
                </p>
                {renderEvaluation(preview.evaluation, 'AI preview assessment')}
                {preview.governanceSummary ? (
                  <p className="text-xs text-slate-300">{preview.governanceSummary}</p>
                ) : null}
                {preview.actions.length > 0 ? (
                  <div className="space-y-2">
                    {preview.actions.map((action: AIExecutionAction) => (
                      <div key={`${action.protocol}-${action.status}-${action.amountUsd}-preview`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                          <span className="text-white">{action.protocol}</span>
                          <span className={action.status === 'executed' ? 'text-emerald-300' : 'text-amber-300'}>
                            {action.status === 'executed' ? 'Available' : 'Blocked'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {action.allocationPercent}% • {action.amountUsd.toFixed(2)} USD • APY {action.expectedAPY}% • Risk {action.riskScore}
                        </p>
                        <p className="text-xs text-slate-400">
                          Simulated execution: {(action.simulationUsd ?? 0).toFixed(2)} USD
                        </p>
                        {action.reason ? <p className="text-xs text-slate-400">Rationale: {action.reason}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">AI preview did not identify executable actions.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Run AI Preview to review the plan before execution.</p>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Simulation history</h4>
              <button
                type="button"
                onClick={() => {
                  void refreshSimulations();
                }}
                className="rounded border border-white/10 px-3 py-1 text-xs text-slate-200"
              >
                Refresh
              </button>
            </div>
            {isSimulationsLoading && simulations.length === 0 ? (
              <p className="text-xs text-slate-400">Loading simulation history…</p>
            ) : simulations.length === 0 ? (
              <p className="text-xs text-slate-400">AI Preview has not been executed yet.</p>
            ) : (
              <div className="space-y-3">
                {simulations.map((entry: AISimulationLogEntry) => (
                  <div key={entry.id} className="rounded-md border border-white/10 bg-black/20 p-3 text-xs text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{entry.summary}</span>
                      <span className="text-slate-400">{new Date(entry.generatedAt).toLocaleTimeString('en-US')}</span>
                    </div>
                    <p className="mt-1 text-slate-300">
                      Executable {entry.totalExecutableUsd.toFixed(2)} USD • Remaining {entry.remainingDailyLimitUsd.toFixed(2)} USD
                    </p>
                    {entry.model ? (
                      <p className="text-[11px] text-slate-400">
                        Model: {entry.model}
                        {entry.provider ? ` • Provider: ${entry.provider}` : ''}
                      </p>
                    ) : null}
                    {renderEvaluation(entry.evaluation, 'Simulation assessment')}
                    {entry.governanceSummary ? <p className="text-[11px] text-slate-400">{entry.governanceSummary}</p> : null}
                    <details className="mt-2 rounded border border-white/10 bg-white/5 p-2">
                      <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-slate-300">
                        Actions ({entry.actions.length})
                      </summary>
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-300">
                        {entry.actions.map((action) => (
                          <li key={`${entry.id}-${action.protocol}-${action.status}-${action.amountUsd}`}>
                            <span className="text-white">{action.protocol}</span> • {action.amountUsd.toFixed(2)} USD •{' '}
                            {action.status === 'executed' ? 'available' : 'blocked'} • Risk {action.riskScore}
                            {action.reason ? ` — ${action.reason}` : ''}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Autonomous execution</h4>
              {result ? (
                <span className="text-xs text-slate-500">{new Date(result.generatedAt).toLocaleTimeString()}</span>
              ) : null}
            </div>
            {result ? (
              <div className="space-y-3">
                <p className="text-slate-100">{result.summary}</p>
                {result.model ? (
                  <p className="text-[11px] text-slate-400">
                    Model: {result.model}
                    {result.provider ? ` • Provider: ${result.provider}` : ''}
                  </p>
                ) : null}
                <p className="text-xs text-slate-400">
                  Executed: {result.totalExecutedUsd.toFixed(2)} USD • Remaining limit:{' '}
                  {result.remainingDailyLimitUsd.toFixed(2)} USD
                </p>
                {renderEvaluation(result.evaluation, 'Execution assessment')}
                {result.governanceSummary ? (
                  <p className="text-xs text-slate-300">{result.governanceSummary}</p>
                ) : null}
                {result.analysis ? (
                  <p className="text-xs text-slate-300">{result.analysis}</p>
                ) : null}
                {result.actions.length > 0 ? (
                  <div className="space-y-2">
                    {result.actions.map((action: AIExecutionAction) => (
                      <div key={`${action.protocol}-${action.status}-${action.amountUsd}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide">
                          <span className="text-white">{action.protocol}</span>
                          <span className={action.status === 'executed' ? 'text-emerald-300' : 'text-amber-300'}>
                            {action.status === 'executed' ? 'Executed' : 'Skipped'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {action.allocationPercent}% • {action.amountUsd.toFixed(2)} USD • APY {action.expectedAPY}% • Risk{' '}
                          {action.riskScore}
                        </p>
                        <p className="text-xs text-slate-400">
                          Simulation: {(action.simulationUsd ?? 0).toFixed(2)} USD
                        </p>
                        {action.reason ? (
                          <p className="text-xs text-slate-400">Rationale: {action.reason}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No executable actions were available.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Press “Execute AI strategy” to let the agent act within the configured guardrails.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Recommendations</h4>
              {recommendations ? (
                <span className="text-xs text-slate-500">{new Date(recommendations.generatedAt).toLocaleTimeString()}</span>
              ) : null}
            </div>
            {recommendations ? (
              <div className="space-y-3">
                <p className="text-slate-100">{recommendations.summary}</p>
                {recommendations.model ? (
                  <p className="text-[11px] text-slate-400">
                    Model: {recommendations.model}
                    {recommendations.provider ? ` • Provider: ${recommendations.provider}` : ''}
                  </p>
                ) : null}
                {recommendations.analysis ? (
                  <p className="text-sm text-slate-300">{recommendations.analysis}</p>
                ) : null}
                {renderEvaluation(recommendations.evaluation, 'Recommendation assessment')}
                {recommendations.governanceSummary ? (
                  <p className="text-xs text-slate-300">{recommendations.governanceSummary}</p>
                ) : null}
                <div className="space-y-2">
                  {recommendations.allocations?.map((item: AllocationRecommendation) => (
                    <div key={item.protocol} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <h4 className="font-medium text-white">{item.protocol}</h4>
                      <p className="text-xs text-slate-300">Allocation: {item.allocationPercent}%</p>
                      <p className="text-xs text-slate-300">APY: {item.expectedAPY}% • Risk {item.riskScore}</p>
                      <p className="text-xs text-slate-400">{item.rationale}</p>
                    </div>
                  ))}
                </div>
                {recommendations.suggestedActions?.length ? (
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Action items</h5>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">
                      {recommendations.suggestedActions.map((action) => (
                        <li key={action} className="rounded border border-white/5 bg-black/20 px-3 py-2">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Press “Generate AI recommendations” to obtain an updated strategy proposal.
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Execution history</h4>
              {isHistoryLoading ? <span className="text-xs text-slate-500">Loading…</span> : null}
            </div>
            {history.length > 0 ? (
              <ul className="space-y-2">
                {history.map((entry: AIExecutionRecord) => (
                  <li key={entry.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white">{new Date(entry.generatedAt).toLocaleString()}</span>
                      <span className="text-slate-400">{entry.totalExecutedUsd.toFixed(2)} USD</span>
                    </div>
                    {entry.model ? (
                      <p className="text-[11px] text-slate-400">
                        Model: {entry.model}
                        {entry.provider ? ` • Provider: ${entry.provider}` : ''}
                      </p>
                    ) : null}
                    <p className="mt-1 text-slate-300">{entry.summary}</p>
                    <p className="mt-1 text-slate-400">
                      Remaining limit: {entry.remainingDailyLimitUsd.toFixed(2)} USD • Actions: {entry.actions.length}
                    </p>
                    {entry.analysis ? <p className="text-xs text-slate-300">{entry.analysis}</p> : null}
                    {entry.warnings?.length ? (
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] text-amber-300">
                        {entry.warnings.map((warning) => (
                          <li key={`${entry.id}-${warning}`}>{warning}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No executions recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
