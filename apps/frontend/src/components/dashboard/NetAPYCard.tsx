'use client';

interface APYData {
  overall: number;
  manual: number;
  ai: number;
  growthMonth?: number;      // APY % growth last month
  growthAllTime?: number;    // APY % growth all time
}

export function NetAPYCard({ data }: { data: APYData }) {
  return (
    <article className="glass-card space-y-4 p-6">
      <h3 className="text-sm uppercase text-slate-400">Net APY</h3>
      
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-semibold text-white">
              {data.overall.toFixed(2)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Weighted by risk score</p>
          </div>
          
          {/* APY Growth metrics - aligned right */}
          {(data.growthMonth !== undefined || data.growthAllTime !== undefined) && (
            <div className="flex flex-col gap-1 text-right text-sm">
              {data.growthMonth !== undefined && (
                <p 
                  className={`font-medium ${data.growthMonth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  title="APY growth for the last month"
                >
                  {data.growthMonth >= 0 ? '+' : ''}{data.growthMonth.toFixed(1)}%
                </p>
              )}
              {data.growthAllTime !== undefined && (
                <p 
                  className={`font-medium ${data.growthAllTime >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  title="APY growth for all time"
                >
                  {data.growthAllTime >= 0 ? '+' : ''}{data.growthAllTime.toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">{/* Breakdown section */}

        <div className="space-y-2 text-sm border-t border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Manual Positions</span>
            <span className="text-white font-medium">{data.manual.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">AI Managed</span>
            <span className="text-emerald-400 font-medium">{data.ai.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}
