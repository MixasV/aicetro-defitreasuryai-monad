'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Plus, AlertTriangle } from 'lucide-react';
import { useAccount, useSignMessage } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WhitelistProtocol {
  name: string;
  tvl: number;
}

interface QuarantinedPool {
  id: string;
  protocol: string;
  reason: string;
  withdrawnUsd: number;
  createdAt: string;
}

const formatter = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD', 
  maximumFractionDigits: 1,
  notation: 'compact'
});

export function DelegationControlsCard({ 
  whitelist,
  quarantined
}: { 
  whitelist: WhitelistProtocol[];
  quarantined: QuarantinedPool[];
}) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { signMessageAsync } = useSignMessage();
  const [removing, setRemoving] = useState<string | null>(null);

  const removeMutation = useMutation({
    mutationFn: async (protocol: string) => {
      if (!address) throw new Error('No wallet connected');
      
      const message = `Remove ${protocol} from whitelist at ${Date.now()}`;
      const signature = await signMessageAsync({ message });
      
      const response = await fetch('/api/whitelist/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountAddress: address,
          protocol,
          signature,
          message
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove protocol');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delegation-check'] });
      setRemoving(null);
    },
    onError: (error) => {
      console.error('[Whitelist] Remove error:', error);
      alert(`Failed to remove protocol: ${error.message}`);
      setRemoving(null);
    }
  });

  const handleRemove = async (protocol: string) => {
    if (!confirm(`Remove ${protocol} from whitelist? This requires a wallet signature.`)) {
      return;
    }
    
    setRemoving(protocol);
    removeMutation.mutate(protocol);
  };

  const reviewMutation = useMutation({
    mutationFn: async (quarantineId: string) => {
      const response = await fetch(`/api/dashboard/quarantine/${quarantineId}/review`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to review pool');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantined-pools'] });
    }
  });

  return (
    <article className="glass-card space-y-4 p-6">
      <header className="space-y-1">
        <h3 className="text-sm uppercase tracking-wide text-slate-400">
          Delegation Controls
        </h3>
        <p className="text-xs text-slate-500">
          Manage whitelisted protocols
        </p>
      </header>

      {/* Whitelisted Protocols */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300">
            Whitelisted Protocols ({whitelist.length})
          </p>
          <Link
            href="/pools"
            title="Browse and add DeFi protocols to your AI agent's whitelist"
            className="text-primary-400 hover:text-primary-300 transition"
          >
            <Plus className="w-4 h-4" />
          </Link>
        </div>
        
        {whitelist.length > 0 ? (
          <div className="space-y-2">
            {whitelist.map((protocol) => (
              <div
                key={protocol.name}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-medium">{protocol.name}</span>
                    <span className="text-xs text-slate-400">
                      TVL: {formatter.format(protocol.tvl)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemove(protocol.name)}
                  disabled={removing === protocol.name}
                  className="text-slate-400 hover:text-rose-400 transition disabled:opacity-50"
                  title="Remove from whitelist"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            No protocols whitelisted. Click [+] icon above to add protocols.
          </p>
        )}
      </div>

      {/* Quarantined Pools */}
      {quarantined.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Quarantined Pools ({quarantined.length})
          </p>
          
          <div className="space-y-2">
            {quarantined.map((pool) => (
              <div
                key={pool.id}
                className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-amber-200 font-medium">{pool.protocol}</p>
                    <p className="text-xs text-amber-200/70 mt-1">{pool.reason}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    <span>Withdrawn: {formatter.format(pool.withdrawnUsd)}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(pool.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <button
                    onClick={() => reviewMutation.mutate(pool.id)}
                    title="Approve pool after 24h quarantine period - allows AI to invest"
                    className="text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
