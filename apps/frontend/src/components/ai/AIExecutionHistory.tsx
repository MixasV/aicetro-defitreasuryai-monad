'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  CheckCircle,
  ExternalLink,
  Filter,
  TrendingUp,
  TrendingDown,
  User,
  Zap
} from 'lucide-react';
import { useAIExecutionHistory } from '../../hooks/useAIExecutionHistory';
import type { AIExecutionRecord } from '@defitreasuryai/types';

interface Props {
  account: string;
}

export const AIExecutionHistory = ({ account }: Props) => {
  const { history, isLoading } = useAIExecutionHistory(account);
  const [filterMode, setFilterMode] = useState<'all' | 'manual' | 'auto' | 'hybrid'>('all');

  const filteredHistory = useMemo(() => {
    if (!history || filterMode === 'all') return history || [];
    return history.filter((exec) => exec.executionMode === filterMode);
  }, [history, filterMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-purple-500/30 border-t-purple-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-100">Execution History</h3>
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
            {filteredHistory.length}
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'manual', 'auto', 'hybrid'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                filterMode === mode
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Execution List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-slate-700 bg-black/20 p-8 text-center"
            >
              <Activity className="mx-auto h-12 w-12 text-slate-600" />
              <p className="mt-3 text-sm text-slate-400">No executions found</p>
            </motion.div>
          ) : (
            filteredHistory.map((execution, index) => (
              <ExecutionCard key={execution.id} execution={execution} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ExecutionCardProps {
  execution: AIExecutionRecord;
  index: number;
}

const ExecutionCard = ({ execution, index }: ExecutionCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'auto':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'manual':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'hybrid':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'auto':
        return <Zap className="h-3 w-3" />;
      case 'manual':
        return <User className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-lg border border-slate-700 bg-black/20 p-4 hover:border-slate-600 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Mode Badge */}
          <div className={`rounded-lg border px-2 py-1 ${getModeColor(execution.executionMode)}`}>
            <div className="flex items-center gap-1.5">
              {getModeIcon(execution.executionMode)}
              <span className="text-xs font-medium uppercase">{execution.executionMode}</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">{execution.summary}</p>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(execution.createdAt).toLocaleString()}
              </span>
              {execution.userApproved && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  User Approved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="text-lg font-bold text-slate-100">
            ${execution.totalExecutedUsd.toLocaleString()}
          </p>
          {execution.profitLossUsd != null && (
            <p
              className={`text-sm font-medium ${
                execution.profitLossUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {execution.profitLossUsd >= 0 ? (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +${execution.profitLossUsd.toLocaleString()}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  ${Math.abs(execution.profitLossUsd).toLocaleString()}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* AI Reasoning */}
      {execution.reasoning && (
        <div className="mt-3 rounded-lg bg-slate-800/50 p-3">
          <p className="text-xs font-medium text-slate-300">AI Reasoning:</p>
          <p className="mt-1 text-sm text-slate-400">{execution.reasoning}</p>
        </div>
      )}

      {/* Transaction Hashes */}
      {execution.txHashes && execution.txHashes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {execution.txHashes.map((hash) => (
            <a
              key={hash}
              href={`https://testnet.monadscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-blue-500/10 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <span className="font-mono">
                {hash.slice(0, 6)}...{hash.slice(-4)}
              </span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};
