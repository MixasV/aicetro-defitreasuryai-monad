'use client';

import { Target, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WhitelistManagementCardProps {
  whitelist: Array<{ name: string; apy: number }>;
}

export function WhitelistManagementCard({ whitelist }: WhitelistManagementCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Whitelist</h2>
            <p className="text-sm text-slate-400 mt-1">{whitelist.length} pools approved</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/pools')}
          className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition"
          title="Browse and add more pools"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Pool List */}
      {whitelist.length > 0 ? (
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {whitelist.slice(0, 5).map((pool, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white">{pool.name}</span>
              <span className="text-sm text-emerald-400 font-medium">{pool.apy.toFixed(1)}%</span>
            </div>
          ))}
          {whitelist.length > 5 && (
            <div className="text-center text-xs text-slate-500 py-2">
              +{whitelist.length - 5} more pools
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm mb-3">No pools in whitelist</p>
          <p className="text-xs text-slate-500">Click [+] to add pools</p>
        </div>
      )}

      {/* View All Button */}
      <button
        onClick={() => router.push('/pools')}
        className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm"
      >
        View All Pools
      </button>
    </div>
  );
}
