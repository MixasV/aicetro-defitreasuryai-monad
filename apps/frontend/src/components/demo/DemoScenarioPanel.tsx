import { useState } from 'react';
import type { AIExecutionRecord, AlertEvent, DemoScenarioSummary } from '@defitreasuryai/types';
import { useDemoSummary } from '../../hooks/useDemoSummary';
import { DEMO_CORPORATE_ACCOUNT } from '../../config/demo';

interface Props {
  accountAddress?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
});

const STEP_COLORS: Record<DemoScenarioSummary['steps'][number]['status'], string> = {
  completed: 'text-emerald-400',
  pending: 'text-slate-400',
  error: 'text-rose-400'
};

const ALERT_COLORS: Record<AlertEvent['severity'], string> = {
  info: 'text-slate-300',
  warning: 'text-amber-300',
  critical: 'text-rose-400'
};

export const DemoScenarioPanel = ({ accountAddress = DEMO_CORPORATE_ACCOUNT }: Props) => {
  const [isRunning, setIsRunning] = useState(false);
  const { summary, isLoading, runDemo, refresh } = useDemoSummary(accountAddress);

  const handleRunDemo = async () => {
    setIsRunning(true);
    try {
      await runDemo();
    } catch (error) {
      console.error('Demo scenario failed', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Demo fallback data (simplified for preview)
  const demoFallback: Partial<DemoScenarioSummary> = {
    generatedAt: new Date().toISOString(),
    steps: [
      { id: '1', title: 'Configure delegation', status: 'completed', description: 'Set up AI delegation rules', timestamp: new Date(Date.now() - 5000).toISOString() },
      { id: '2', title: 'AI analyzes opportunities', status: 'completed', description: 'Scan DeFi protocols for optimal yields', timestamp: new Date(Date.now() - 4000).toISOString() },
      { id: '3', title: 'Execute rebalance', status: 'completed', description: 'Rebalance portfolio based on AI decision', timestamp: new Date(Date.now() - 3000).toISOString() },
      { id: '4', title: 'Monitor portfolio', status: 'completed', description: 'Track performance and risk metrics', timestamp: new Date(Date.now() - 2000).toISOString() }
    ],
    alerts: [
      {
        id: 'demo-alert-1',
        title: 'Demo Mode Active',
        severity: 'info',
        description: 'This is a preview of autonomous treasury operations. Configure your smart account to run real scenarios.',
        createdAt: new Date(Date.now() - 2000).toISOString()
      }
    ]
  };

  const displaySummary = (summary || demoFallback) as DemoScenarioSummary;
  const showDemoWarning = !summary;

  const renderSummaryHeader = (data: DemoScenarioSummary, isDemo: boolean) => (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Demo Scenario {isDemo && <span className="text-sm text-amber-400">(Preview Mode)</span>}</h2>
        <p className="text-sm text-slate-300">End-to-end autonomous treasury cycle for MockCorp.</p>
        <p className="text-xs text-slate-500">Last updated: {timeFormatter.format(new Date(data.generatedAt))}</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRunDemo}
          disabled={isRunning || isDemo}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          title={isDemo ? 'Configure your smart account to run demo' : ''}
        >
          {isRunning ? 'Running…' : 'Run demo'}
        </button>
        <button
          type="button"
          onClick={() => {
            void refresh();
          }}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  const renderDelegation = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-slate-400">Corporate smart account</p>
          <p className="font-semibold text-white">{data.account.address}</p>
        </div>
        <span className="text-xs text-slate-400">Threshold: {data.account.threshold} of {data.account.owners.length}</span>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-slate-500">Owners</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-200">
            {data.account.owners.map((owner) => (
              <li key={owner}>{owner}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 text-sm text-slate-200">
          <p className="text-xs uppercase text-slate-500">Delegation limits</p>
          <p>Daily limit: {currencyFormatter.format(data.delegation.dailyLimitUsd)}</p>
          <p>Remaining: {currencyFormatter.format(data.delegation.remainingDailyLimitUsd)}</p>
          <p>Risk ceiling: {data.delegation.maxRiskScore}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase text-slate-500">Whitelisted protocols</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-200">
          {data.delegation.whitelist.map((protocol) => (
            <span key={protocol} className="rounded-full border border-white/10 px-3 py-1">
              {protocol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMetrics = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-semibold text-white">AI KPI</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label="Total executions" value={data.aiSummary.totalExecutions.toString()} />
        <Metric label="Executed volume" value={currencyFormatter.format(data.aiSummary.executedVolumeUsd)} />
        <Metric label="Average size" value={currencyFormatter.format(data.aiSummary.averageExecutedUsd)} />
        <Metric label="Success rate" value={`${(data.aiSummary.successRate * 100).toFixed(0)}%`} />
      </div>
      {data.aiSummary.lastExecution ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
          <p className="text-slate-300">Last run:</p>
          <p>{currencyFormatter.format(data.aiSummary.lastExecution.totalExecutedUsd)} executed</p>
          <p>Remaining limit: {currencyFormatter.format(data.aiSummary.lastExecution.remainingDailyLimitUsd)}</p>
          <p>{dateFormatter.format(new Date(data.aiSummary.lastExecution.generatedAt))}</p>
          <p className="mt-1 text-slate-400">{data.aiSummary.lastExecution.summary}</p>
        </div>
      ) : null}
    </div>
  );

  const renderPortfolio = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">MockCorp portfolio</h3>
          <p className="text-xs text-slate-400">Total value: {currencyFormatter.format(data.portfolio.totalValueUSD)}</p>
        </div>
        <span className="text-xs text-slate-400">Net APY {data.portfolio.netAPY.toFixed(2)}%</span>
      </header>
      {data.portfolio.positions.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No active portfolio positions.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full table-fixed text-left text-xs text-slate-200">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Protocol</th>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">APY</th>
                <th className="px-4 py-3 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.portfolio.positions.map((position) => (
                <tr key={`${position.protocol}-${position.asset}`} className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-100">{position.protocol}</td>
                  <td className="px-4 py-3 text-slate-100">{position.asset}</td>
                  <td className="px-4 py-3 text-slate-100">{currencyFormatter.format(position.valueUSD)}</td>
                  <td className="px-4 py-3 text-slate-100">{position.currentAPY.toFixed(2)}%</td>
                  <td className="px-4 py-3 font-semibold text-slate-200">{position.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAlertsPanel = (alerts: AlertEvent[]) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Risk Alerts</h3>
        <span className="text-xs text-slate-400">{alerts.length} active</span>
      </header>
      {alerts.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No Envio HyperIndex alerts.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${ALERT_COLORS[alert.severity]}`}>{alert.title}</span>
                <span className="text-slate-400">{timeFormatter.format(new Date(alert.createdAt))}</span>
              </div>
              <p className="mt-2 text-slate-300">{alert.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderProjection = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Yield projection</h3>
        <span className="text-xs text-slate-400">Generated {timeFormatter.format(new Date(data.projection.generatedAt))}</span>
      </header>
      {data.projection.points.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">Not enough data to project yield.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {data.projection.points.map((point) => (
            <div key={point.timestamp} className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
              <p className="text-slate-400">{new Date(point.timestamp).toLocaleDateString('en-US')}</p>
              <p className="mt-2 text-sm text-white">NAV: {currencyFormatter.format(point.netAssetValue)}</p>
              <p className="text-slate-300">Yield: {currencyFormatter.format(point.projectedYield)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderExecutionHistory = (history: AIExecutionRecord[]) => {
    if (history.length === 0) {
      return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
          No AI execution data available.
        </div>
      );
    }

    const [latest, ...rest] = history;

    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
        <header className="flex items-center justify-between text-xs text-slate-400">
          <h3 className="text-sm font-semibold text-white">Latest AI execution</h3>
          <span>{timeFormatter.format(new Date(latest.generatedAt))}</span>
        </header>
        <p className="mt-2 text-slate-100">{latest.summary}</p>
        <p className="text-xs text-slate-400">
          Executed {currencyFormatter.format(latest.totalExecutedUsd)} • Remaining limit {currencyFormatter.format(latest.remainingDailyLimitUsd)}
        </p>
        {latest.actions.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {latest.actions.map((action) => (
              <li
                key={`${action.protocol}-${action.status}-${action.amountUsd}`}
                className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white">{action.protocol}</span>
                  <span className={action.status === 'executed' ? 'text-emerald-300' : 'text-amber-300'}>
                    {action.status === 'executed' ? 'Executed' : 'Skipped'}
                  </span>
                </div>
                <p className="text-slate-300">
                  {action.allocationPercent}% • {currencyFormatter.format(action.amountUsd)} • APY {action.expectedAPY}% • Risk {action.riskScore}
                </p>
                {action.reason ? <p className="text-slate-400">Rationale: {action.reason}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-400">AI did not propose actions for this run.</p>
        )}

        {rest.length > 0 ? (
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <p className="text-slate-300">Run history</p>
            <ul className="space-y-1">
              {rest.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between">
                  <span>{new Date(entry.generatedAt).toLocaleString('en-US')}</span>
                  <span>{currencyFormatter.format(entry.totalExecutedUsd)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  const renderSteps = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-slate-950 p-5">
      <h3 className="text-sm font-semibold text-white">Action timeline</h3>
      <ol className="mt-4 space-y-3">
        {data.steps.map((step) => (
          <li key={step.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${STEP_COLORS[step.status]}`}>{step.title}</span>
              <span className="text-slate-500">
                {step.timestamp ? timeFormatter.format(new Date(step.timestamp)) : '—'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-200">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  );

  const renderEmergencyLog = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Emergency log</h3>
        <span className="text-xs text-slate-400">Showing last {data.emergencyLog.length || 0} events</span>
      </header>
      {data.emergencyLog.length === 0 ? (
        <p className="mt-3 text-xs text-slate-400">Log is empty — emergency stop has not been triggered.</p>
      ) : (
        <ul className="mt-3 space-y-3 text-sm text-slate-200">
          {data.emergencyLog.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className={entry.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                  {entry.status === 'success' ? 'Success' : 'Error'}
                </span>
                <span className="text-slate-400">{timeFormatter.format(new Date(entry.createdAt))}</span>
              </div>
              <p className="mt-2">{entry.message}</p>
              {entry.metadata?.reason ? (
                <p className="mt-1 text-xs text-slate-400">Reason: {String(entry.metadata.reason)}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderRiskInsights = (data: DemoScenarioSummary) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Risk Insights</h3>
        <span className="text-xs text-slate-400">Exposure {currencyFormatter.format(data.risk.totalValueUsd)}</span>
      </header>
      <ul className="mt-4 space-y-2 text-sm text-slate-200">
        {data.risk.exposure.map((band) => (
          <li key={band.level} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{band.label}</span>
              <span>{band.percentage.toFixed(2)}%</span>
            </div>
            <p className="mt-2 text-slate-200">{currencyFormatter.format(band.valueUSD)}</p>
            {band.topPositions.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-400">
                {band.topPositions.map((position) => (
                  <li key={position.protocol}>
                    {position.protocol}: {currencyFormatter.format(position.valueUSD)} • Risk {position.riskScore}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
        <p>Allowed risk: {data.risk.guardrails.maxAllowedRiskScore}</p>
        <p>Observed maximum: {data.risk.guardrails.highestPositionRisk}</p>
        {data.risk.guardrails.violations.length > 0 ? (
          <p className="mt-1 text-rose-300">{data.risk.guardrails.violations[0]}</p>
        ) : (
          <p className="mt-1 text-emerald-300">Guardrails respected.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {showDemoWarning && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          <strong>Preview Mode:</strong> This is a demo scenario. Configure your smart account to run real treasury operations.
        </div>
      )}
      {renderSummaryHeader(displaySummary, showDemoWarning)}
      {!showDemoWarning && (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            {renderDelegation(displaySummary)}
            {renderMetrics(displaySummary)}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            {renderPortfolio(displaySummary)}
            {renderAlertsPanel(displaySummary.alerts)}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            {renderProjection(displaySummary)}
            {renderExecutionHistory(displaySummary.aiHistory)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {renderSteps(displaySummary)}
            {renderEmergencyLog(displaySummary)}
          </div>
          {renderRiskInsights(displaySummary)}
        </>
      )}
      {showDemoWarning && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {renderSteps(displaySummary)}
            {renderAlertsPanel(displaySummary.alerts || [])}
          </div>
        </>
      )}
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
);
