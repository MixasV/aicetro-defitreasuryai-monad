'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Settings,
  Activity,
  DollarSign
} from 'lucide-react';

interface Props {
  account: string;
  portfolioValue: number;
  delegation?: {
    autoExecutionEnabled?: boolean;
    portfolioPercentage?: number;
    autoExecutedUsd?: number;
    dailyLimitUsd?: number;
  };
  onSave: (settings: AutoExecutionSettings) => Promise<void>;
}

interface AutoExecutionSettings {
  enabled: boolean;
  portfolioPercentage: number;
}

export const AutomationSettingsPanel = ({ account, portfolioValue, delegation, onSave }: Props) => {
  const [enabled, setEnabled] = useState(delegation?.autoExecutionEnabled ?? false);
  const [percentage, setPercentage] = useState(delegation?.portfolioPercentage ?? 0);
  const [showHighRiskWarning, setShowHighRiskWarning] = useState(false);
  const [confirmHighRisk, setConfirmHighRisk] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate values
  const aiAllocation = portfolioValue * (percentage / 100);
  const autoExecutedUsd = delegation?.autoExecutedUsd ?? 0;
  const remainingAllowance = Math.max(0, aiAllocation - autoExecutedUsd);
  const isHighRisk = percentage > 50;

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    
    // Show warning if >50%
    if (newPercentage > 50 && !showHighRiskWarning) {
      setShowHighRiskWarning(true);
      setConfirmHighRisk(false);
    } else if (newPercentage <= 50) {
      setShowHighRiskWarning(false);
      setConfirmHighRisk(false);
    }
  };

  const handleSave = async () => {
    // Require confirmation for high risk
    if (isHighRisk && !confirmHighRisk) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        enabled,
        portfolioPercentage: percentage
      });
      
      // Reset warning state after successful save
      if (isHighRisk) {
        setShowHighRiskWarning(false);
        setConfirmHighRisk(false);
      }
    } catch (error) {
      console.error('Failed to save automation settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = enabled ? (isHighRisk ? confirmHighRisk : true) : true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <Zap className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">AI Auto-Execution Settings</h3>
          <p className="text-sm text-slate-400">Configure autonomous AI treasury management</p>
        </div>
      </div>

      {/* Enable Toggle */}
      <div className="rounded-lg border border-slate-700 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-slate-400" />
            <div>
              <p className="font-medium text-slate-100">Enable AI Auto-Execution</p>
              <p className="text-sm text-slate-400">AI will automatically execute strategies within your limits</p>
            </div>
          </div>
          
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              enabled ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <motion.div
              className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg"
              animate={{ left: enabled ? '26px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </div>

      {/* Settings (shown when enabled) */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Portfolio Percentage Slider */}
            <div className="rounded-lg border border-slate-700 bg-black/20 p-4">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-100">
                <Settings className="h-4 w-4" />
                Portfolio Percentage for AI
              </label>
              
              {/* Slider */}
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  className={`w-full ${
                    isHighRisk ? 'accent-amber-500' : 'accent-purple-500'
                  }`}
                />
                
                {/* Value Display */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">0%</span>
                  <div className={`rounded-lg px-4 py-2 font-mono text-2xl font-bold ${
                    isHighRisk ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'
                  }`}>
                    {percentage}%
                  </div>
                  <span className="text-sm text-slate-400">100%</span>
                </div>

                {/* Risk Indicators */}
                <div className="flex gap-1">
                  {[...Array(10)].map((_, i) => {
                    const threshold = (i + 1) * 10;
                    const isActive = percentage >= threshold - 10;
                    const isHigh = threshold > 50;
                    
                    return (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          isActive
                            ? isHigh
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>
            </div>

            {/* Allocation Info Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <DollarSign className="h-3 w-3" />
                  AI Allocation
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-emerald-300">
                  ${aiAllocation.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400/60">
                  {percentage}% of ${portfolioValue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <Activity className="h-3 w-3" />
                  Remaining
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-blue-300">
                  ${remainingAllowance.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400/60">
                  Already used: ${autoExecutedUsd.toLocaleString()}
                </p>
              </div>
            </div>

            {/* High Risk Warning */}
            <AnimatePresence>
              {showHighRiskWarning && isHighRisk && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-lg border-2 border-amber-500/50 bg-amber-500/10 p-4"
                >
                  <div className="flex gap-3">
                    <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-400" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-amber-300">⚠️ High Risk Alert</h4>
                        <p className="mt-1 text-sm text-amber-200/80">
                          You are allocating <strong>{percentage}%</strong> of your portfolio to AI auto-execution. 
                          This is considered <strong>high risk</strong> and not recommended.
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-amber-200/70">
                        <p><strong>Risks:</strong></p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>AI may make suboptimal decisions during high market volatility</li>
                          <li>Large portion of your portfolio will be outside direct control</li>
                          <li>Potentially higher losses if AI makes errors</li>
                        </ul>
                      </div>

                      <div className="space-y-2 text-sm text-amber-200/70">
                        <p><strong>Recommendations:</strong></p>
                        <ul className="ml-4 list-disc space-y-1">
                          <li>Start with 10-20% allocation for testing</li>
                          <li>Gradually increase after verifying results</li>
                          <li>Keep majority of funds under manual control</li>
                        </ul>
                      </div>

                      {/* Confirmation Checkbox */}
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-black/30 p-3">
                        <input
                          type="checkbox"
                          checked={confirmHighRisk}
                          onChange={(e) => setConfirmHighRisk(e.target.checked)}
                          className="mt-1 h-4 w-4 cursor-pointer rounded border-amber-500 bg-amber-500/10 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-100">
                          I understand the risks and accept full responsibility for potential losses. 
                          I confirm that I want to allocate <strong>{percentage}%</strong> of my portfolio 
                          for AI auto-execution.
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Card (for low risk) */}
            {!isHighRisk && percentage > 0 && (
              <div className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <Info className="h-5 w-5 flex-shrink-0 text-blue-400" />
                <div className="text-sm text-blue-200/80">
                  <p>
                    AI will automatically execute strategies using up to <strong>{percentage}%</strong> of your 
                    portfolio (${aiAllocation.toLocaleString()}). You retain full control with instant 
                    emergency stop capability.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className={`w-full rounded-lg py-3 font-medium transition-all ${
                canSave && !isSaving
                  ? isHighRisk
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500'
                  : 'cursor-not-allowed bg-slate-700 text-slate-400'
              }`}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {isHighRisk && !confirmHighRisk ? 'Confirm Risks to Save' : 'Save AI Settings'}
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
