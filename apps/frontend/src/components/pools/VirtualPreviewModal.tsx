'use client';

import { useState } from 'react';
import { X, TrendingUp, AlertCircle, Zap, DollarSign } from 'lucide-react';
import type { Pool } from '../../hooks/usePoolDiscovery';

interface VirtualPreviewModalProps {
  pool: Pool;
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualPreviewModal = ({ pool, isOpen, onClose }: VirtualPreviewModalProps) => {
  const [depositAmount, setDepositAmount] = useState<string>('10000');

  if (!isOpen) return null;

  const amount = parseFloat(depositAmount) || 0;
  const projectedAnnualReturn = (amount * pool.apy) / 100;
  const projectedMonthlyReturn = projectedAnnualReturn / 12;
  const projectedDailyReturn = projectedAnnualReturn / 365;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
        {/* Header */}
        <div className="relative border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-2xl">
              💭
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{pool.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                Virtual Preview - See what you could earn on {getChainName(pool.chain)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
            <div className="text-sm">
              <p className="font-medium text-amber-200">Preview Mode</p>
              <p className="mt-1 text-amber-300/80">
                This pool is not yet available on Monad Testnet. This is a simulation showing 
                potential returns if it were available.
              </p>
            </div>
          </div>

          {/* Pool Info */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Protocol</p>
              <p className="mt-1 font-semibold text-white">{pool.protocol}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Asset</p>
              <p className="mt-1 font-semibold text-white">{pool.asset}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">APY</p>
              <p className="mt-1 font-semibold text-emerald-400">{pool.apy}%</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Risk</p>
              <p className="mt-1 font-semibold text-white">
                {pool.risk}/5 {getRiskEmoji(pool.risk)}
              </p>
            </div>
          </div>

          {/* Deposit Calculator */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Simulate deposit amount (USD)
              </label>
              <div className="relative mt-2">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none"
                  placeholder="Enter amount"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            {/* Projections */}
            {amount > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <TrendingUp className="h-4 w-4" />
                  Projected Returns
                </h3>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 p-4">
                    <p className="text-xs text-emerald-300">Daily</p>
                    <p className="mt-1 text-xl font-bold text-emerald-400">
                      ${projectedDailyReturn.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-300/60">
                      ~{((projectedDailyReturn / amount) * 100).toFixed(4)}%
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4">
                    <p className="text-xs text-blue-300">Monthly</p>
                    <p className="mt-1 text-xl font-bold text-blue-400">
                      ${projectedMonthlyReturn.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-blue-300/60">
                      ~{((projectedMonthlyReturn / amount) * 100).toFixed(2)}%
                    </p>
                  </div>
                  
                  <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4">
                    <p className="text-xs text-purple-300">Annual</p>
                    <p className="mt-1 text-xl font-bold text-purple-400">
                      ${projectedAnnualReturn.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-purple-300/60">
                      {pool.apy}% APY
                    </p>
                  </div>
                </div>

                {/* Total Value */}
                <div className="rounded-lg border border-primary-500/30 bg-primary-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary-300">Total Value After 1 Year</p>
                      <p className="mt-1 text-2xl font-bold text-primary-400">
                        ${(amount + projectedAnnualReturn).toFixed(2)}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-primary-400" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">{pool.description}</p>
          </div>

          {/* Future Availability */}
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
            <p className="text-sm text-blue-200">
              <span className="font-medium">Coming soon to Monad!</span> This pool will be available 
              once {pool.protocol} deploys on Monad Testnet.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 bg-white/5 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-medium text-white transition hover:from-purple-600 hover:to-blue-600"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

function getChainName(chain: string): string {
  const names: Record<string, string> = {
    'monad-testnet': 'Monad Testnet',
    'ethereum': 'Ethereum Mainnet',
    'base': 'Base',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism'
  };
  return names[chain] || chain;
}

function getRiskEmoji(risk: number): string {
  if (risk <= 2) return '🛡️';
  if (risk === 3) return '⚖️';
  return '🚀';
}
