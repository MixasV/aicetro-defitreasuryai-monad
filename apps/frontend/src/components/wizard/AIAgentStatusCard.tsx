'use client';

import { useState } from 'react';
import { Bot, TrendingUp, Pause, Play, AlertTriangle } from 'lucide-react';

interface AIAgentStatusCardProps {
  status: {
    active: boolean;
    paused: boolean;
    emergencyStop: boolean;
  };
  stats: {
    portfolioValue: number;
    netAPY: number;
    profitToday: number;
    profitTodayPercent: number;
  };
  onPause: () => void;
  onResume: () => void;
  onEmergency: () => void;
  onSettings: () => void;
}

export function AIAgentStatusCard({
  status,
  stats,
  onPause,
  onResume,
  onEmergency,
  onSettings
}: AIAgentStatusCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => void) => {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-500">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Agent Status</h2>
            <div className="flex items-center gap-2 mt-1">
              {status.emergencyStop ? (
                <span className="text-sm text-red-400">🚨 Emergency Stop</span>
              ) : status.paused ? (
                <span className="text-sm text-amber-400">⏸ Paused</span>
              ) : (
                <span className="text-sm text-emerald-400">🟢 Running</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-400 mb-1">Portfolio Value</div>
          <div className="text-2xl font-bold text-white">
            ${stats.portfolioValue.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Net APY</div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats.netAPY.toFixed(1)}%
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-slate-400 mb-1">Profit Today</div>
          <div className={`text-xl font-bold ${stats.profitToday >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {stats.profitToday >= 0 ? '+' : ''}${stats.profitToday.toFixed(2)}
            <span className="text-sm ml-2">
              ({stats.profitTodayPercent >= 0 ? '+' : ''}{stats.profitTodayPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {status.paused ? (
          <button
            onClick={() => handleAction(onResume)}
            disabled={loading || status.emergencyStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Resume AI agent - allow new investments"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>
        ) : (
          <button
            onClick={() => handleAction(onPause)}
            disabled={loading || status.emergencyStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Pause AI agent - stop new investments, monitoring continues"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>
        )}
        
        <button
          onClick={onSettings}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition disabled:opacity-50"
          title="Edit AI agent settings (limits, risk, protocols)"
        >
          ⚙️ Settings
        </button>
        
        <button
          onClick={() => handleAction(onEmergency)}
          disabled={loading || status.emergencyStop}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Emergency stop - withdraw all funds and pause AI"
        >
          <AlertTriangle className="h-4 w-4" />
          Emergency
        </button>
      </div>

      {/* Info */}
      {status.paused && !status.emergencyStop && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-xs text-amber-200">
            ℹ️ AI is paused. Monitoring continues for emergency exits only. New investments are blocked.
          </p>
        </div>
      )}
      
      {status.emergencyStop && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-200">
            🚨 Emergency stop active. All funds withdrawn. AI paused.
          </p>
        </div>
      )}
    </div>
  );
}
