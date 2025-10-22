'use client';

interface YieldData {
  overall: number;
  manual: number;
  ai: number;
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

export function ProjectedYieldCard({ data }: { data: YieldData }) {
  return (
    <article className="glass-card space-y-4 p-6">
      <h3 className="text-sm uppercase text-slate-400">Projected Annual Yield</h3>
      
      <div className="space-y-3">
        <div>
          <p className="text-3xl font-semibold text-white">
            {formatter.format(data.overall)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Target: $10K annual yield</p>
        </div>

        <div className="space-y-2 text-sm border-t border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Manual Positions</span>
            <span className="text-white font-medium">{formatter.format(data.manual)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">AI Managed</span>
            <span className="text-emerald-400 font-medium">{formatter.format(data.ai)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
