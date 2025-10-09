import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';
import type { AIRecommendationEvaluation, AllocationRecommendation } from '@defitreasuryai/types';

interface Props {
  recommendations: {
    summary: string;
    model?: string;
    provider?: string;
    analysis?: string;
    evaluation?: AIRecommendationEvaluation;
    governanceSummary?: string;
    allocations?: AllocationRecommendation[];
    suggestedActions?: string[];
    generatedAt: string;
  } | null;
  isGenerating: boolean;
  isAnalyzing: boolean;
  portfolioTotal: number;
}

export const EnhancedAIRecommendations = ({
  recommendations,
  isGenerating,
  isAnalyzing,
  portfolioTotal
}: Props) => {
  const [showReasoning, setShowReasoning] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-800/50 bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-5 transition-all duration-300 hover:border-purple-700/70"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className={`h-5 w-5 text-purple-400 ${isAnalyzing || isGenerating ? 'animate-pulse' : ''}`} />
            {(isAnalyzing || isGenerating) && (
              <motion.div
                className="absolute -inset-1 rounded-full bg-purple-400/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <h4 className="text-sm font-semibold text-white">AI Recommendations</h4>
        </div>
        {recommendations?.evaluation && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center rounded-full bg-purple-900/50 px-3 py-1 text-xs text-purple-300"
          >
            <Activity className="mr-1 h-3 w-3" />
            {Math.round((recommendations.evaluation.confidence ?? 0) * 100)}% confident
          </motion.span>
        )}
      </div>

      {recommendations ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Summary Card */}
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
            <p className="text-sm text-slate-100">{recommendations.summary}</p>
            {recommendations.model && (
              <p className="mt-2 text-xs text-slate-400">
                Model: {recommendations.model}
                {recommendations.provider && ` • Provider: ${recommendations.provider}`}
              </p>
            )}
            {recommendations.analysis && (
              <p className="mt-2 text-sm text-slate-300">{recommendations.analysis}</p>
            )}
          </div>

          {/* Expected Outcomes */}
          {recommendations.allocations && recommendations.allocations.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-800/30 bg-emerald-900/10 p-3">
                <div className="text-xs font-medium text-emerald-300">Expected Annual Return</div>
                <div className="mt-1 text-2xl font-bold text-emerald-400">
                  $
                  {Math.round(
                    recommendations.allocations.reduce(
                      (sum, a) => sum + ((a.expectedAPY * a.allocationPercent) / 100 / 100) * portfolioTotal,
                      0
                    )
                  ).toLocaleString('en-US')}
                </div>
                <div className="text-xs text-emerald-200/60">
                  From {recommendations.allocations.length} protocol
                  {recommendations.allocations.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
                <div className="text-xs font-medium text-blue-300">Average Risk Score</div>
                <div className="mt-1 text-2xl font-bold text-blue-400">
                  {(
                    recommendations.allocations.reduce((sum, a) => sum + a.riskScore, 0) /
                    recommendations.allocations.length
                  ).toFixed(1)}
                  /10
                </div>
                <div className="text-xs text-blue-200/60">Weighted portfolio risk</div>
              </div>
            </div>
          )}

          {/* Assessment Panel */}
          {recommendations.evaluation && (
            <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-blue-300">Assessment</span>
                <button
                  type="button"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-slate-400 transition-colors hover:text-white"
                  aria-label="Toggle assessment details"
                >
                  {showReasoning ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Confidence</span>
                  <span className="font-semibold text-blue-300">
                    {Math.round((recommendations.evaluation.confidence ?? 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Risk Score</span>
                  <span className="font-semibold text-blue-300">
                    {recommendations.evaluation.riskScore?.toFixed(2) ?? 'N/A'}
                  </span>
                </div>
              </div>

              <AnimatePresence>
                {showReasoning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 border-t border-blue-800/30 pt-3"
                  >
                    {recommendations.evaluation.notes && (
                      <p className="text-xs text-slate-400">{recommendations.evaluation.notes}</p>
                    )}
                    {recommendations.evaluation.warnings && recommendations.evaluation.warnings.length > 0 && (
                      <div className="space-y-2">
                        {recommendations.evaluation.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-400" />
                            <span className="text-xs text-amber-300">{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {recommendations.governanceSummary && (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-3">
              <p className="text-xs text-slate-400">{recommendations.governanceSummary}</p>
            </div>
          )}

          {/* Allocation Cards */}
          {recommendations.allocations && recommendations.allocations.length > 0 && (
            <div className="space-y-3">
              {recommendations.allocations.map((item: AllocationRecommendation, idx: number) => (
                <motion.div
                  key={item.protocol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group rounded-lg border border-slate-700 bg-slate-800/40 p-4 transition-all duration-200 hover:border-emerald-600/50 hover:bg-slate-800/60"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h5 className="font-medium text-white">{item.protocol}</h5>
                    <span className="flex items-center rounded-full border border-emerald-400/50 bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-300">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {item.expectedAPY}% APY
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">{item.rationale}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-black/20 p-2">
                      <div className="text-xs text-slate-400">Allocation</div>
                      <div className="font-semibold text-white">{item.allocationPercent}%</div>
                    </div>
                    <div className="rounded bg-blue-900/20 p-2">
                      <div className="text-xs text-blue-300">Risk Score</div>
                      <div className="font-semibold text-blue-400">{item.riskScore}/10</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Action Items */}
          {recommendations.suggestedActions && recommendations.suggestedActions.length > 0 && (
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
              <h5 className="mb-3 flex items-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                <CheckCircle className="mr-2 h-3 w-3" />
                Action Items
              </h5>
              <ul className="space-y-2">
                {recommendations.suggestedActions.map((action, idx) => (
                  <motion.li
                    key={action}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start space-x-2 rounded border border-slate-700/50 bg-black/20 px-3 py-2 text-xs text-slate-300"
                  >
                    <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-400" />
                    <span>{action}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="py-8 text-center">
          <Brain className="mx-auto mb-3 h-12 w-12 text-slate-600" />
          <p className="mb-1 text-sm font-medium text-slate-300">Ready to analyze your treasury</p>
          <p className="text-xs text-slate-400">
            Generate recommendations to receive personalized allocation strategies
          </p>
        </div>
      )}
    </motion.div>
  );
};
