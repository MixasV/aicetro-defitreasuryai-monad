'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, Shield, DollarSign, BarChart3, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useAccount } from 'wagmi';
import type { Pool } from './PoolTable';

interface PoolDetailModalProps {
  pool: Pool;
  onClose: () => void;
}

export const PoolDetailModal = ({ pool, onClose }: PoolDetailModalProps) => {
  const { address } = useAccount();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  
  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Fetch AI analysis (auto-load simple version if exists in pool data)
  const handleGetAIAnalysis = async (type: 'simple' | 'detailed' = 'simple') => {
    if (!address) {
      setAnalysisError('Please connect wallet to get AI analysis');
      return;
    }
    
    setLoadingAnalysis(true);
    setAnalysisError(null);
    
    try {
      const response = await fetch(`/api/pools/${pool.id}/analyze-for-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address, type })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get analysis');
      }
      
      const data = await response.json();
      setAiAnalysis(data.analysis);
      
      if (type === 'detailed') {
        setShowDetailedAnalysis(true);
      }
    } catch (error: any) {
      console.error('[PoolDetailModal] AI analysis error:', error);
      setAnalysisError(error.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      // Fetch history for all pools (try to get snapshots)
      try {
        setLoadingHistory(true);
        const history = await apiClient.getPoolHistory(pool.id, 30);
        setHistoryData(history.dailyVolume || []);
      } catch (err) {
        console.error('[PoolDetailModal] Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
      
      // Fetch recent transactions  
      try {
        setLoadingTx(true);
        const txData = await apiClient.getPoolTransactions(pool.id, 10);
        setTransactions(txData.transactions || []);
      } catch (err) {
        console.error('[PoolDetailModal] Failed to load transactions:', err);
      } finally {
        setLoadingTx(false);
      }
    }
    
    fetchData();
  }, [pool.id, pool.chain, pool.source]);

  const hasHistoricalData = historyData.length > 0;

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
              <h2 className="text-2xl font-bold text-white">{pool.asset || 'Unknown Pool'}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {pool.protocol} • {pool.chain}
              </p>
              <p className="mt-1 text-xs text-slate-500 font-mono">
                {pool.address}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* AI Recommendation (Big Card at Top - Variant B) */}
          {address && (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-blue-900/20 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">AI Recommendation</h3>
                </div>
                {aiAnalysis && !loadingAnalysis && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    aiAnalysis.shouldAdd
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {aiAnalysis.shouldAdd ? '✅ RECOMMENDED' : '⚠️ NOT RECOMMENDED'}
                  </span>
                )}
              </div>

              {!aiAnalysis && !loadingAnalysis && !analysisError && (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">Get AI analysis to see if this pool fits your portfolio</p>
                  <button
                    onClick={() => handleGetAIAnalysis('simple')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    Get AI Analysis
                  </button>
                </div>
              )}

              {loadingAnalysis && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mb-3" />
                  <p className="text-slate-400">AI is analyzing this pool for you...</p>
                  <p className="text-xs text-slate-500 mt-2">This may take up to 30 seconds</p>
                </div>
              )}

              {analysisError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{analysisError}</p>
                </div>
              )}

              {aiAnalysis && !loadingAnalysis && (
                <div className="space-y-4">
                  {/* Reason */}
                  <div>
                    <p className="text-slate-300 leading-relaxed">{aiAnalysis.reason}</p>
                    {aiAnalysis.cached && (
                      <p className="text-xs text-slate-500 mt-2">
                        💾 Cached analysis (valid for 1 hour)
                      </p>
                    )}
                  </div>

                  {/* Risk Level Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Risk Level:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      aiAnalysis.riskLevel === 'low' ? 'bg-emerald-500/20 text-emerald-300' :
                      aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {aiAnalysis.riskLevel === 'low' ? '🟢 Low Risk' :
                       aiAnalysis.riskLevel === 'medium' ? '🟡 Medium Risk' :
                       '🔴 High Risk'}
                    </span>
                  </div>

                  {/* Get Detailed Analysis Button */}
                  {!showDetailedAnalysis && !aiAnalysis.detailedAnalysis && (
                    <button
                      onClick={() => handleGetAIAnalysis('detailed')}
                      disabled={loadingAnalysis}
                      className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm border border-white/10 disabled:opacity-50"
                    >
                      Get Detailed Analysis
                    </button>
                  )}

                  {/* Detailed Analysis */}
                  {(showDetailedAnalysis || aiAnalysis.detailedAnalysis) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <h4 className="text-sm font-semibold text-white mb-3">Detailed Analysis:</h4>
                      <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {aiAnalysis.detailedAnalysis || 'Loading detailed analysis...'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-300">APY</p>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-400">{pool.apy.toFixed(2)}%</p>
              <p className="mt-1 text-xs text-emerald-300/60">Annual Yield</p>
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
                <p className="text-xs text-purple-300">Risk</p>
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-purple-400">
                {pool.riskScore ? `${pool.riskScore}/5` : 'N/A'}
              </p>
              <p className="mt-1 text-xs text-purple-300/60">
                {pool.riskScore ? getRiskLabel(pool.riskScore) : 'Unrated'}
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-amber-300">AI Score</p>
                <BarChart3 className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {pool.aiScore ? pool.aiScore.toFixed(0) : 'N/A'}
              </p>
              <p className="mt-1 text-xs text-amber-300/60">
                {pool.aiScore && pool.aiScore >= 90 ? '🔥 Excellent' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Historical Chart */}
          {historyData.length > 0 && !loadingHistory && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <TrendingUp className="h-5 w-5 text-primary-400" />
                Trading Volume (30 days)
              </h3>
              
              {loadingHistory ? (
                <div className="flex h-48 items-center justify-center text-slate-400">
                  Loading chart...
                </div>
              ) : hasHistoricalData ? (
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
                    
                    {/* Volume bars */}
                    {historyData.map((d, i) => {
                      const maxVolume = Math.max(...historyData.map(v => v.volume));
                      const height = (d.volume / (maxVolume || 1)) * 180;
                      const x = (i / historyData.length) * 600;
                      const barWidth = 600 / historyData.length - 2;
                      
                      return (
                        <rect
                          key={i}
                          x={x}
                          y={200 - height}
                          width={barWidth}
                          height={height}
                          fill="url(#gradient)"
                          opacity="0.8"
                        />
                      );
                    })}
                    
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    <span>30 days ago</span>
                    <span>{historyData.length} days of data</span>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-slate-500">
                  No historical data available
                </div>
              )}
            </div>
          )}

          {/* Recent Transactions */}
          {pool.chain === 'Monad' && transactions.length > 0 && !loadingTx && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="h-5 w-5 text-primary-400" />
                Recent Transactions
              </h3>
              
              {loadingTx ? (
                <div className="py-8 text-center text-slate-400">Loading transactions...</div>
              ) : transactions.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transactions.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-lg bg-white/5 p-3 text-sm"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            tx.transactionType === 'swap' ? 'bg-blue-500/20 text-blue-300' :
                            tx.transactionType === 'mint' ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {tx.transactionType}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">
                            {tx.user.slice(0, 6)}...{tx.user.slice(-4)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {new Date(parseInt(tx.timestamp) * 1000).toLocaleString()}
                        </div>
                      </div>
                      <a
                        href={`https://testnet.monadexplorer.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-400 hover:text-primary-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">No recent transactions</div>
              )}
            </div>
          )}

          {/* Pool Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h3 className="mb-3 font-semibold text-white">Pool Information</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Protocol</span>
                  <span className="font-medium text-white">{pool.protocol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Chain</span>
                  <span className="font-medium text-white">{pool.chain}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Category</span>
                  <span className="font-medium text-white capitalize">{pool.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Source</span>
                  <span className="font-medium text-white capitalize">{pool.source}</span>
                </div>
                {pool.volume24h && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">24h Volume</span>
                    <span className="font-medium text-white">{formatTVL(pool.volume24h)}</span>
                  </div>
                )}
              </div>
            </div>

            {pool.aiScore && pool.aiReason && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h3 className="mb-3 font-semibold text-white">AI Analysis</h3>
                <p className="text-sm leading-relaxed text-slate-300">{pool.aiReason}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div 
                      className={`h-full ${getAIScoreColor(pool.aiScore)}`}
                      style={{ width: `${pool.aiScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{pool.aiScore.toFixed(0)}/100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/95 backdrop-blur p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

function getChainIcon(chain: string): string {
  const icons: Record<string, string> = {
    'Monad': '🟣',
    'Ethereum': '⚫',
    'Base': '🔵',
    'Arbitrum': '🔷',
    'Optimism': '🔴',
    'Polygon': '🟪',
  };
  return icons[chain] || '⛓️';
}

function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
  return `$${tvl.toFixed(2)}`;
}

function getRiskLabel(risk: number): string {
  if (risk <= 2) return 'Low Risk';
  if (risk === 3) return 'Medium Risk';
  if (risk === 4) return 'High Risk';
  return 'Very High';
}

function getAIScoreColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 80) return 'bg-green-500';
  if (score >= 70) return 'bg-yellow-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}
