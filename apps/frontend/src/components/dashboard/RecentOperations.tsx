'use client';

import { Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Operation {
  id: string;
  action: string;
  protocol: string;
  amount?: string;
  status: 'success' | 'pending' | 'warning';
  timestamp: string;
}

export function RecentOperations({ operations }: { operations: Operation[] }) {
  const statusIcons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    pending: <Clock className="w-4 h-4 text-amber-400 animate-pulse" />,
    warning: <AlertCircle className="w-4 h-4 text-orange-400" />
  };

  return (
    <article className="glass-card p-6">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-sm uppercase tracking-widest text-slate-400">
          Recent Operations
        </h3>
        <TrendingUp className="w-4 h-4 text-slate-500" />
      </header>

      {operations.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No recent operations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {operations.map((op) => (
            <div
              key={op.id}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3 flex-1">
                {statusIcons[op.status]}
                <div className="flex-1">
                  <p className="text-sm text-white">{op.action}</p>
                  {op.protocol && (
                    <p className="text-xs text-slate-400 mt-0.5">{op.protocol}</p>
                  )}
                </div>
                {op.amount && (
                  <span className="text-sm text-slate-300 font-medium">{op.amount}</span>
                )}
              </div>
              <span className="text-xs text-slate-500 ml-4">{op.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
