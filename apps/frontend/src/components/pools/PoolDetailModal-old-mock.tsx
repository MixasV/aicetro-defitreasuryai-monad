'use client';

import { X, TrendingUp, Shield, DollarSign, Users, BarChart3, Star } from 'lucide-react';
import type { Pool } from '../../hooks/usePoolDiscovery';

interface PoolDetailModalProps {
  pool: Pool;
  isOpen: boolean;
  onClose: () => void;
  onAddToWhitelist?: (poolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (poolId: string) => void;
}

export const PoolDetailModal = ({ 
  pool, 
  isOpen, 
  onClose, 
  onAddToWhitelist,
  isFavorite,
  onToggleFavorite 
}: PoolDetailModalProps) => {
  if (!isOpen) return null;

  const historicalData = generateHistoricalData(pool.apy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 text-3xl">
              {getChainIcon(pool.chain)}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{pool.name}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {pool.protocol} • {pool.asset} • {getChainName(pool.chain)}
                  </p>
                </div>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(pool.id)}
                    className={`rounded-lg p-2 transition ${
                      isFavorite
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Star className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
              
              {!pool.available && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
                  💭 Preview - Not yet available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-300">APY</p>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{pool.apy}%</p>
              <p className="mt-1 text-xs text-emerald-300/60">Annual Percentage Yield</p>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-blue-300">TVL</p>
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-blue-400">{formatTVL(pool.tvl)}</p>
              <p className="mt-1 text-xs text-blue-300/60">Total Value Locked</p>
            </div>

            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-purple-300">Risk Level</p>
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-400">
                {pool.risk}/5 {getRiskEmoji(pool.risk)}
              </p>
              <p className="mt-1 text-xs text-purple-300/60">{getRiskLabel(pool.risk)}</p>
            </div>

            <div className="rounded-lg border border-slate-500/30 bg-slate-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">Category</p>
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-300 capitalize">
                {pool.category.replace('-', ' ')}
              </p>
              <p className="mt-1 text-xs text-slate-400">{pool.asset}</p>
            </div>
          </div>

          {/* APY Chart */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-primary-400" />
              Historical APY (30 days)
            </h3>
            <div className="relative h-48">
              <svg className="h-full w-full" viewBox="0 0 600 200">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 50}
                    x2="600"
                    y2={i * 50}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}
                
                {/* APY Line */}
                <polyline
                  points={historicalData
                    .map((d, i) => `${(i / (historicalData.length - 1)) * 600},${200 - (d / Math.max(...historicalData)) * 180}`)
                    .join(' ')}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Gradient fill */}
                <polyline
                  points={`0,200 ${historicalData
                    .map((d, i) => `${(i / (historicalData.length - 1)) * 600},${200 - (d / Math.max(...historicalData)) * 180}`)
                    .join(' ')} 600,200`}
                  fill="url(#areaGradient)"
                  opacity="0.2"
                />
                
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Labels */}
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>30d ago</span>
                <span>Current: {pool.apy}% APY</span>
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 font-semibold text-white">About this Pool</h3>
              <p className="text-sm leading-relaxed text-slate-300">{pool.description}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Protocol</span>
                  <span className="font-medium text-white">{pool.protocol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Asset Type</span>
                  <span className="font-medium text-white capitalize">{pool.category.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Chain</span>
                  <span className="font-medium text-white">{getChainName(pool.chain)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 font-semibold text-white">Risk Assessment</h3>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Smart Contract Risk</span>
                    <span className="text-white">{pool.risk <= 2 ? 'Low' : pool.risk === 3 ? 'Medium' : 'High'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className={`h-full ${getRiskColor(pool.risk)}`}
                      style={{ width: `${(pool.risk / 5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Liquidity Risk</span>
                    <span className="text-white">{pool.tvl > 10_000_000 ? 'Low' : pool.tvl > 1_000_000 ? 'Medium' : 'High'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${pool.tvl > 10_000_000 ? 20 : pool.tvl > 1_000_000 ? 50 : 80}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">Volatility Risk</span>
                    <span className="text-white">{pool.category === 'stablecoin' ? 'Low' : pool.category === 'lp' ? 'High' : 'Medium'}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className={`h-full ${pool.category === 'stablecoin' ? 'bg-emerald-500' : pool.category === 'lp' ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${pool.category === 'stablecoin' ? 20 : pool.category === 'lp' ? 80 : 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/95 backdrop-blur p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/5"
            >
              Close
            </button>
            {pool.available && onAddToWhitelist && (
              <button
                onClick={() => onAddToWhitelist(pool.id)}
                className="flex-1 rounded-lg bg-gradient-to-r from-primary-500 to-blue-500 px-6 py-3 font-medium text-white transition hover:from-primary-600 hover:to-blue-600"
              >
                Add to Whitelist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getChainIcon(chain: string): string {
  const icons: Record<string, string> = {
    'monad-testnet': '🌊',
    'ethereum': '⟠',
    'base': '🔵',
    'arbitrum': '🔷',
    'optimism': '🔴'
  };
  return icons[chain] || '⛓️';
}

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

function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
  return `$${tvl}`;
}

function getRiskEmoji(risk: number): string {
  if (risk <= 2) return '🛡️';
  if (risk === 3) return '⚖️';
  return '🚀';
}

function getRiskLabel(risk: number): string {
  if (risk <= 2) return 'Conservative';
  if (risk === 3) return 'Moderate';
  return 'Aggressive';
}

function getRiskColor(risk: number): string {
  if (risk <= 2) return 'bg-emerald-500';
  if (risk === 3) return 'bg-amber-500';
  return 'bg-rose-500';
}

function generateHistoricalData(currentAPY: number): number[] {
  const data: number[] = [];
  const points = 30;
  const volatility = currentAPY * 0.1; // 10% volatility
  
  for (let i = 0; i < points; i++) {
    const trend = (i / points) * volatility;
    const noise = (Math.random() - 0.5) * volatility;
    data.push(Math.max(0, currentAPY - volatility + trend + noise));
  }
  
  data[points - 1] = currentAPY; // Ensure last point is current APY
  return data;
}
