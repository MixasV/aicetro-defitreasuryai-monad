'use client';

interface AssetsData {
  total: number;
  inPools: number;
  inPoolsDirect: number;
  inPoolsAI: number;
  inWallet: number;
  profitMonth?: number;
  profitAllTime?: number;
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

const profitFormatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0,
  signDisplay: 'always'
});

export function AssetsUnderManagement({ data }: { data: AssetsData }) {
  return (
    <article className="glass-card space-y-4 p-6">
      <h3 className="text-sm uppercase text-slate-400">Assets Under Management</h3>
      
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-semibold text-white">
              {formatter.format(data.total)}
            </p>
            <p className="text-xs text-slate-400 mt-1">All Networks</p>
          </div>
          
          {/* Profit metrics - aligned right */}
          {(data.profitMonth !== undefined || data.profitAllTime !== undefined) && (
            <div className="flex flex-col gap-1 text-right text-sm">
              {data.profitMonth !== undefined && (
                <p 
                  className={`font-medium ${data.profitMonth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  title="Profit for the last month"
                >
                  {profitFormatter.format(data.profitMonth)}
                </p>
              )}
              {data.profitAllTime !== undefined && (
                <p 
                  className={`font-medium ${data.profitAllTime >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                  title="Profit for all time"
                >
                  {profitFormatter.format(data.profitAllTime)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3">{/* Breakdown section */}

        <div className="space-y-2 text-sm border-t border-white/10 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">In Pools (Direct)</span>
            <span className="text-white font-medium">{formatter.format(data.inPoolsDirect)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">In Pools (AI Managed)</span>
            <span className="text-emerald-400 font-medium">{formatter.format(data.inPoolsAI)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">In Wallet</span>
            <span className="text-slate-300 font-medium">{formatter.format(data.inWallet)}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-2 border-t border-white/5">
          Networks: Monad • Ethereum • Polygon
        </div>
      </div>
    </article>
  );
}
