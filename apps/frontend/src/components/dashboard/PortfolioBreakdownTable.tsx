'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Shield, Info } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { usePoolMonitoring } from '@/hooks/usePoolMonitoring';

interface PortfolioPosition {
  protocol: string;
  asset: string;
  valueUSD: number;
  currentAPY: number;
  riskScore: number;
  poolAddress?: string;
  source?: 'ai' | 'manual';
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 0 
});

const riskPalette: Record<number, string> = {
  1: 'text-emerald-400',
  2: 'text-emerald-300',
  3: 'text-amber-300',
  4: 'text-orange-400',
  5: 'text-rose-400',
  6: 'text-rose-500'
};

export function PortfolioBreakdownTable({ 
  positions,
  onWithdrawAll,
  onStop,
  onResume,
  isPaused
}: { 
  positions: PortfolioPosition[];
  onWithdrawAll: () => void;
  onStop: () => void;
  onResume: () => void;
  isPaused: boolean;
}) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { monitoredPools, enableMonitoring, disableMonitoring } = usePoolMonitoring();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const isMonitored = (poolAddress: string) => {
    return monitoredPools.some(p => p.poolAddress.toLowerCase() === poolAddress.toLowerCase() && p.enabled);
  };

  const handleOpenMenu = (key: string) => {
    if (openMenu === key) {
      setOpenMenu(null);
      setMenuPosition(null);
      return;
    }
    
    const button = buttonRefs.current[key];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        right: window.innerWidth - rect.right
      });
    }
    setOpenMenu(key);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenu) {
        setOpenMenu(null);
        setMenuPosition(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenu]);

  const handleToggleMonitoring = async (position: PortfolioPosition, enable: boolean) => {
    if (!address || !position.poolAddress) {
      alert('Invalid pool configuration');
      return;
    }

    try {
      if (enable) {
        const message = `Enable AI Safe Control for ${position.protocol} at ${Date.now()}`;
        const signature = await signMessageAsync({ message });
        
        await enableMonitoring.mutateAsync({
          poolAddress: position.poolAddress,
          protocol: position.protocol,
          signature,
          message
        });
        
        alert(`AI Safe Control enabled for ${position.protocol}`);
      } else {
        await disableMonitoring.mutateAsync(position.poolAddress);
        alert(`AI Safe Control disabled for ${position.protocol}`);
      }
      
      setOpenMenu(null);
    } catch (error: any) {
      console.error('[PoolMonitoring] Error:', error);
      alert(`Failed: ${error.message}`);
    }
  };

  return (
    <div className="glass-card overflow-hidden">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-slate-400">
          Portfolio Breakdown
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onWithdrawAll}
            title="Emergency withdraw all funds from AI-managed pools"
            className="px-3 py-1.5 text-xs rounded-lg border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 transition"
          >
            Withdraw All
          </button>
          
          {isPaused ? (
            <button
              onClick={onResume}
              title="Resume AI agent operations - allow new investments"
              className="px-3 py-1.5 text-xs rounded-lg border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={onStop}
              title="Pause AI agent operations - existing positions stay active"
              className="px-3 py-1.5 text-xs rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 transition"
            >
              Stop
            </button>
          )}
        </div>
      </header>
      
      <table className="w-full table-fixed text-sm">
        <thead className="text-left text-slate-400 bg-white/5">
          <tr>
            <th className="px-6 py-3 font-medium">Protocol</th>
            <th className="px-6 py-3 font-medium">Asset</th>
            <th className="px-6 py-3 font-medium">Value</th>
            <th className="px-6 py-3 font-medium">APY</th>
            <th className="px-6 py-3 font-medium">Risk</th>
            <th className="px-6 py-3 font-medium">Source</th>
            <th className="px-6 py-3 font-medium">
              <div className="inline-flex items-center gap-1.5">
                AI Control
                <span 
                  className="inline-flex"
                  title="Enable AI security monitoring for this pool. AI can track protocol risks and execute emergency withdrawals to protect your funds if critical threats are detected."
                >
                  <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition cursor-help" />
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, idx) => {
            const monitored = position.poolAddress ? isMonitored(position.poolAddress) : false;
            const menuOpen = openMenu === `${position.protocol}-${idx}`;
            
            return (
              <tr key={`${position.protocol}-${idx}`} className="border-t border-white/5 text-slate-100 hover:bg-white/5 transition">
                <td className="px-6 py-3">{position.protocol}</td>
                <td className="px-6 py-3">{position.asset}</td>
                <td className="px-6 py-3">{formatter.format(position.valueUSD)}</td>
                <td className="px-6 py-3">{position.currentAPY.toFixed(2)}%</td>
                <td className={`px-6 py-3 font-semibold ${riskPalette[position.riskScore] || 'text-slate-400'}`}>
                  {position.riskScore}
                </td>
                <td className="px-6 py-3">
                  {position.source === 'ai' ? (
                    <span className="text-emerald-400 text-xs">AI</span>
                  ) : (
                    <span className="text-slate-400 text-xs">Manual</span>
                  )}
                </td>
                <td className="px-6 py-3 relative">
                  {position.poolAddress ? (
                    <div>
                      <button
                        ref={(el) => { buttonRefs.current[`${position.protocol}-${idx}`] = el; }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMenu(`${position.protocol}-${idx}`);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                          monitored 
                            ? 'border border-emerald-400/40 bg-emerald-500/10 text-emerald-200' 
                            : 'border border-slate-600 bg-slate-800 text-slate-400'
                        } hover:bg-white/10`}
                      >
                        <Shield className="w-3 h-3" />
                        {monitored ? 'Monitoring' : 'Manual'}
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      {menuOpen && menuPosition && (
                        <div 
                          className="fixed z-[9999] w-56 rounded-lg border border-white/10 bg-slate-900 shadow-2xl"
                          style={{ 
                            top: `${menuPosition.top}px`,
                            right: `${menuPosition.right}px`
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-3 space-y-2.5">
                            <p className="text-[10px] font-semibold text-white uppercase tracking-wider">AI Security Control</p>
                            
                            <label className="flex items-start gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                checked={monitored}
                                onChange={() => handleToggleMonitoring(position, true)}
                                className="mt-0.5 flex-shrink-0"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-white font-medium group-hover:text-emerald-400 transition">Monitoring Enabled</p>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">AI monitors risks and can execute emergency withdrawals</p>
                              </div>
                            </label>

                            <label className="flex items-start gap-2 cursor-pointer group">
                              <input
                                type="radio"
                                checked={!monitored}
                                onChange={() => handleToggleMonitoring(position, false)}
                                className="mt-0.5 flex-shrink-0"
                              />
                              <div className="flex-1">
                                <p className="text-xs text-white font-medium group-hover:text-amber-400 transition">Manual Only</p>
                                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">No AI monitoring or automatic actions</p>
                              </div>
                            </label>

                            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-500">
                              Permissions: Risk Monitoring + Emergency Exit
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
