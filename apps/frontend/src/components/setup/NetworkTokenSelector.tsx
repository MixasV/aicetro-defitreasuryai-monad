'use client';

import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';

interface Token {
  symbol: string;
  balance: number;
  balanceUSD: number;
  enabled: boolean;
}

interface Network {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  locked: boolean; // true for MVP - only Monad unlocked
  tokens: Token[];
  totalUSD: number;
}

interface NetworkTokenSelectorProps {
  userAddress?: string;
  onSelectionChange: (networks: Network[]) => void;
}

export function NetworkTokenSelector({ userAddress, onSelectionChange }: NetworkTokenSelectorProps) {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userAddress) {
      fetchBalances();
    }
  }, [userAddress]);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      // 1. Get Monad testnet balance
      const monadTokens: Token[] = [];
      const provider = (window as any).ethereum;
      
      if (provider) {
        try {
          const balance = await provider.request({
            method: 'eth_getBalance',
            params: [userAddress, 'latest']
          });
          const balanceInMon = parseInt(balance, 16) / 1e18;
          const monUSD = balanceInMon; // 1 MON ≈ $1 for demo
          
          if (balanceInMon > 0) {
            monadTokens.push({
              symbol: 'MON',
              balance: balanceInMon,
              balanceUSD: monUSD,
              enabled: true, // Default enabled
            });
          }
        } catch (error) {
          console.error('[NetworkTokenSelector] Monad balance error:', error);
        }
      }
      
      // TODO: Get USDC, USDT on Monad (currently not available in testnet)
      // For demo, add sample tokens
      monadTokens.push({
        symbol: 'USDC',
        balance: 0,
        balanceUSD: 0,
        enabled: true,
      });

      // 2. Get mainnet balances via Alchemy
      const otherNetworks: Network[] = [
        {
          id: 'ethereum',
          name: 'Ethereum',
          icon: '⚫',
          enabled: false,
          locked: true, // MVP: locked
          tokens: [],
          totalUSD: 0,
        },
        {
          id: 'arbitrum',
          name: 'Arbitrum',
          icon: '🔷',
          enabled: false,
          locked: true, // MVP: locked
          tokens: [],
          totalUSD: 0,
        },
        {
          id: 'base',
          name: 'Base',
          icon: '🔵',
          enabled: false,
          locked: true, // MVP: locked
          tokens: [],
          totalUSD: 0,
        },
        {
          id: 'optimism',
          name: 'Optimism',
          icon: '🔴',
          enabled: false,
          locked: true, // MVP: locked
          tokens: [],
          totalUSD: 0,
        },
        {
          id: 'polygon',
          name: 'Polygon',
          icon: '🟪',
          enabled: false,
          locked: true, // MVP: locked
          tokens: [],
          totalUSD: 0,
        },
      ];

      try {
        const response = await fetch(`/api/balance/check/${userAddress}`);  // Fixed: added /check
        if (response.ok) {
          const data = await response.json();
          
          // Parse balances by network
          if (data.networks) {
            Object.entries(data.networks).forEach(([networkKey, networkData]: [string, any]) => {
              const network = otherNetworks.find(n => 
                networkKey.includes(n.id) || n.id.includes(networkKey.split('-')[0])
              );
              
              if (network && networkData.tokens) {
                network.totalUSD = networkData.totalUSD || 0;
                network.tokens = networkData.tokens.map((token: any) => ({
                  symbol: token.symbol,
                  balance: parseFloat(token.balance || '0'),
                  balanceUSD: token.valueUSD || 0,
                  enabled: false, // Locked by default
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('[NetworkTokenSelector] Failed to fetch mainnet balances:', error);
      }

      // 3. Build final networks list
      const monadNetwork: Network = {
        id: 'monad',
        name: 'Monad Testnet',
        icon: '🟣',
        enabled: monadTokens.length > 0,
        locked: false, // MVP: only Monad unlocked
        tokens: monadTokens,
        totalUSD: monadTokens.reduce((sum, t) => sum + t.balanceUSD, 0),
      };

      // Filter: only show networks with balances
      const visibleNetworks = [
        monadNetwork,
        ...otherNetworks.filter(n => n.totalUSD > 0)
      ];

      setNetworks(visibleNetworks);
      onSelectionChange(visibleNetworks);
    } catch (error) {
      console.error('[NetworkTokenSelector] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNetwork = (networkId: string) => {
    const updated = networks.map(network => {
      if (network.id === networkId && !network.locked) {
        const newEnabled = !network.enabled;
        return {
          ...network,
          enabled: newEnabled,
          tokens: network.tokens.map(t => ({ ...t, enabled: newEnabled })),
        };
      }
      return network;
    });
    
    setNetworks(updated);
    onSelectionChange(updated);
  };

  const toggleToken = (networkId: string, tokenSymbol: string) => {
    const updated = networks.map(network => {
      if (network.id === networkId && !network.locked) {
        const updatedTokens = network.tokens.map(token => 
          token.symbol === tokenSymbol ? { ...token, enabled: !token.enabled } : token
        );
        
        // If no tokens enabled, disable network
        const anyEnabled = updatedTokens.some(t => t.enabled);
        
        return {
          ...network,
          tokens: updatedTokens,
          enabled: anyEnabled,
        };
      }
      return network;
    });
    
    setNetworks(updated);
    onSelectionChange(updated);
  };

  const totalManagedUSD = networks
    .filter(n => n.enabled)
    .reduce((sum, n) => {
      return sum + n.tokens.filter(t => t.enabled).reduce((s, t) => s + t.balanceUSD, 0);
    }, 0);

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="text-center text-slate-400 py-8">
          Loading balances...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            🌐 Networks & Tokens
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Select which assets AI can manage (only Monad Testnet available in MVP)
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">AI-Managed Assets</div>
          <div className="text-2xl font-bold text-primary">
            ${totalManagedUSD.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Networks List */}
      <div className="space-y-3">
        {networks.map((network) => (
          <div
            key={network.id}
            className={`border rounded-lg p-4 transition ${
              network.locked 
                ? 'border-slate-700 bg-slate-800/30' 
                : network.enabled
                ? 'border-primary-500/50 bg-primary-500/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            {/* Network Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleNetwork(network.id)}
                  disabled={network.locked}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                    network.locked
                      ? 'border-slate-600 bg-slate-700 cursor-not-allowed'
                      : network.enabled
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-white/30 hover:border-primary-400'
                  }`}
                >
                  {network.enabled && !network.locked && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                  {network.locked && <Lock className="h-3 w-3 text-slate-500" />}
                </button>
                
                <span className="text-2xl">{network.icon}</span>
                
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {network.name}
                    {network.locked && (
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    ${network.totalUSD.toFixed(2)} • {network.tokens.length} tokens
                  </div>
                </div>
              </div>
            </div>

            {/* Tokens */}
            {network.tokens.length > 0 && !network.locked && (
              <div className="ml-9 space-y-2 border-l-2 border-white/10 pl-4">
                {network.tokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleToken(network.id, token.symbol)}
                        disabled={!network.enabled}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                          !network.enabled
                            ? 'border-slate-600 bg-slate-700 cursor-not-allowed'
                            : token.enabled
                            ? 'border-primary-400 bg-primary-400'
                            : 'border-white/30 hover:border-primary-300'
                        }`}
                      >
                        {token.enabled && network.enabled && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-white">{token.symbol}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      {token.balance > 0 ? `${token.balance.toFixed(4)} (${token.balanceUSD.toFixed(2)})` : 'No balance'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Locked networks - show placeholder */}
            {network.locked && network.tokens.length === 0 && (
              <div className="ml-9 text-sm text-slate-500">
                Token list will be available when this network is unlocked
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Warning */}
      {totalManagedUSD === 0 && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
          <p className="text-amber-400 text-sm">
            ⚠️ Please select at least one token for AI management
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-slate-500">
        <p>
          🔐 Only Monad Testnet is currently available for AI management. 
          Other networks will be enabled in future updates.
        </p>
      </div>
    </div>
  );
}
