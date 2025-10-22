'use client';

import { Settings, Calendar, Shield, Network } from 'lucide-react';

interface DelegationSettingsCardProps {
  settings: {
    dailyLimit: number;
    dailyUsed: number;
    maxRisk: number;
    validUntil: string;
    networks: Array<{ name: string; icon: string; enabled: boolean }>;
    protocols: string[];
  };
  onEdit: () => void;
}

export function DelegationSettingsCard({ settings, onEdit }: DelegationSettingsCardProps) {
  const dailyRemaining = settings.dailyLimit - settings.dailyUsed;
  const utilizationPercent = (settings.dailyUsed / settings.dailyLimit) * 100;

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delegation Settings</h2>
            <p className="text-sm text-slate-400 mt-1">AI agent constraints</p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4 mb-6">
        {/* Daily Limit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Daily Limit</span>
            <span className="text-sm font-medium text-white">
              ${settings.dailyUsed.toLocaleString()} / ${settings.dailyLimit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilizationPercent > 80 ? 'bg-red-500' :
                utilizationPercent > 50 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500">Remaining: ${dailyRemaining.toLocaleString()}</span>
            <span className="text-xs text-slate-500">{utilizationPercent.toFixed(0)}% used</span>
          </div>
        </div>

        {/* Max Risk */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-400">Max Risk</span>
          </div>
          <span className="text-sm font-medium text-white">
            {settings.maxRisk}/5 {'⭐'.repeat(settings.maxRisk)}
          </span>
        </div>

        {/* Valid Until */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Valid Until</span>
          </div>
          <span className="text-sm font-medium text-white">
            {new Date(settings.validUntil).toLocaleDateString()}
          </span>
        </div>

        {/* Networks */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Network className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Networks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.networks
              .filter(n => n.enabled)
              .map(network => (
                <span
                  key={network.name}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs"
                >
                  {network.icon} {network.name}
                </span>
              ))}
            {settings.networks.filter(n => n.enabled).length === 0 && (
              <span className="text-xs text-slate-500">No networks selected</span>
            )}
          </div>
        </div>

        {/* Protocols */}
        <div>
          <div className="text-sm text-slate-400 mb-2">
            Protocols ({settings.protocols.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.protocols.slice(0, 3).map(protocol => (
              <span
                key={protocol}
                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
              >
                {protocol}
              </span>
            ))}
            {settings.protocols.length > 3 && (
              <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs">
                +{settings.protocols.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 rounded-lg transition"
        title="Edit delegation settings"
      >
        ✏️ Edit Settings
      </button>
    </div>
  );
}
