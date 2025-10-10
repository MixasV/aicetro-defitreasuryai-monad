'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { usePoolDiscovery, type Pool } from '../../hooks/usePoolDiscovery';
import { useFavoritePools } from '../../hooks/useFavoritePools';
import { VirtualPreviewModal } from '../../components/pools/VirtualPreviewModal';
import { PoolDetailModal } from '../../components/pools/PoolDetailModal';
import { apiClient } from '../../lib/api';
import { Search, Filter, TrendingUp, Shield, Zap, ArrowUpDown, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

type SortOption = 'none' | 'apy-desc' | 'apy-asc' | 'tvl-desc' | 'tvl-asc' | 'risk-desc' | 'risk-asc';

export default function PoolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<{ min: number; max: number }>({ min: 1, max: 5 });
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('none');
  const [previewPool, setPreviewPool] = useState<Pool | null>(null);
  const [detailPool, setDetailPool] = useState<Pool | null>(null);
  
  const { isFavorite, toggleFavorite, count: favoriteCount } = useFavoritePools();

  const filters = useMemo(() => {
    const f: any = {};
    if (selectedCategory !== 'all') {
      if (['monad-testnet', 'ethereum', 'base', 'arbitrum', 'optimism'].includes(selectedCategory)) {
        f.chain = selectedCategory;
      } else if (['stablecoin', 'eth-derivative', 'volatile', 'lp'].includes(selectedCategory)) {
        f.category = selectedCategory;
      }
    }
    if (searchQuery) {
      f.search = searchQuery;
    }
    f.risk = riskFilter;
    return f;
  }, [selectedCategory, searchQuery, riskFilter]);

  const { pools, categories, isLoading, total, available } = usePoolDiscovery(filters);

  const displayPools = useMemo(() => {
    let filtered = pools;
    
    if (showOnlyAvailable) {
      filtered = filtered.filter((p: Pool) => p.available);
    }
    
    if (showOnlyFavorites) {
      filtered = filtered.filter((p: Pool) => isFavorite(p.id));
    }
    
    // Sort pools
    if (sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'apy-desc': return b.apy - a.apy;
          case 'apy-asc': return a.apy - b.apy;
          case 'tvl-desc': return b.tvl - a.tvl;
          case 'tvl-asc': return a.tvl - b.tvl;
          case 'risk-desc': return b.risk - a.risk;
          case 'risk-asc': return a.risk - b.risk;
          default: return 0;
        }
      });
    }
    
    return filtered;
  }, [pools, showOnlyAvailable, showOnlyFavorites, sortBy, isFavorite]);

  const handleAddToWhitelist = async (poolId: string) => {
    try {
      await apiClient.addPoolToWhitelist(poolId);
      alert('Pool added to whitelist!');
    } catch (error) {
      console.error('Failed to add to whitelist:', error);
      alert('Failed to add to whitelist');
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white">Discover DeFi Pools</h1>
          <p className="mt-2 text-slate-400">
            50+ pools across multiple chains. {available} available on Monad Testnet now.
          </p>
        </header>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <CategoryPill
            id="all"
            label="All Pools"
            count={pools.length}
            selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {categories.map((cat: any) => (
            <CategoryPill
              key={cat.id}
              id={cat.id}
              label={cat.name}
              icon={cat.icon}
              count={cat.count}
              available={cat.available}
              selected={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
            />
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search pools, protocols, assets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                showOnlyAvailable
                  ? 'border-primary-500 bg-primary-500/20 text-primary-100'
                  : 'border-white/10 text-slate-300 hover:border-white/30'
              }`}
            >
              {showOnlyAvailable ? '✓ ' : ''}Available
            </button>

            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                showOnlyFavorites
                  ? 'border-amber-500 bg-amber-500/20 text-amber-100'
                  : 'border-white/10 text-slate-300 hover:border-white/30'
              }`}
            >
              <Star className={`inline h-4 w-4 ${showOnlyFavorites ? 'fill-current' : ''}`} />
              {favoriteCount > 0 && <span className="ml-1">({favoriteCount})</span>}
            </button>

            <select
              value={`${riskFilter.min}-${riskFilter.max}`}
              onChange={e => {
                const [min, max] = e.target.value.split('-').map(Number);
                setRiskFilter({ min, max });
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="1-5">All Risk</option>
              <option value="1-2">Low Risk</option>
              <option value="3-3">Medium</option>
              <option value="4-5">High Risk</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="none">Sort by...</option>
              <option value="apy-desc">APY: High to Low</option>
              <option value="apy-asc">APY: Low to High</option>
              <option value="tvl-desc">TVL: High to Low</option>
              <option value="tvl-asc">TVL: Low to High</option>
              <option value="risk-desc">Risk: High to Low</option>
              <option value="risk-asc">Risk: Low to High</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Pools"
            value={displayPools.length.toString()}
            icon={<Filter className="h-5 w-5" />}
          />
          <StatCard
            label="Available Now"
            value={displayPools.filter((p: Pool) => p.available).length.toString()}
            icon={<Zap className="h-5 w-5 text-emerald-400" />}
            highlight
          />
          <StatCard
            label="Avg APY"
            value={`${calculateAvgApy(displayPools).toFixed(1)}%`}
            icon={<TrendingUp className="h-5 w-5 text-primary-400" />}
          />
        </div>

        {/* Pool Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card h-64 animate-pulse" />
            ))}
          </div>
        ) : displayPools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayPools.map((pool: Pool) => (
              <PoolCard 
                key={pool.id} 
                pool={pool}
                isFavorite={isFavorite(pool.id)}
                onToggleFavorite={toggleFavorite}
                onShowPreview={!pool.available ? setPreviewPool : undefined}
                onShowDetails={setDetailPool}
                onAddToWhitelist={pool.available ? handleAddToWhitelist : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-slate-400">No pools found matching your filters</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setRiskFilter({ min: 1, max: 5 });
                setShowOnlyAvailable(false);
                setShowOnlyFavorites(false);
                setSortBy('none');
              }}
              className="mt-4 text-sm text-primary-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {previewPool && (
        <VirtualPreviewModal
          pool={previewPool}
          isOpen={true}
          onClose={() => setPreviewPool(null)}
        />
      )}

      {detailPool && (
        <PoolDetailModal
          pool={detailPool}
          isOpen={true}
          onClose={() => setDetailPool(null)}
          isFavorite={isFavorite(detailPool.id)}
          onToggleFavorite={toggleFavorite}
          onAddToWhitelist={detailPool.available ? handleAddToWhitelist : undefined}
        />
      )}
    </AppShell>
  );
}

// Components
const CategoryPill = ({
  id,
  label,
  icon,
  count,
  available,
  selected,
  onClick
}: {
  id: string;
  label: string;
  icon?: string;
  count: number;
  available?: boolean;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
      selected
        ? 'border-primary-500 bg-primary-500/20 text-primary-100'
        : 'border-white/10 text-slate-300 hover:border-white/30 hover:text-white'
    }`}
  >
    {icon && <span className="mr-1">{icon}</span>}
    {label}
    <span className="ml-2 text-xs opacity-60">({count})</span>
    {available && <span className="ml-2 text-emerald-400">✓</span>}
  </button>
);

const StatCard = ({
  label,
  value,
  icon,
  highlight
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className={`glass-card p-4 ${highlight ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
          {value}
        </p>
      </div>
      <div className="text-slate-400">{icon}</div>
    </div>
  </div>
);

const PoolCard = ({ 
  pool,
  isFavorite,
  onToggleFavorite,
  onShowPreview,
  onShowDetails,
  onAddToWhitelist
}: { 
  pool: Pool;
  isFavorite?: boolean;
  onToggleFavorite?: (poolId: string) => void;
  onShowPreview?: (pool: Pool) => void;
  onShowDetails?: (pool: Pool) => void;
  onAddToWhitelist?: (poolId: string) => void;
}) => {
  const riskColor = getRiskColor(pool.risk);
  const chainIcon = getChainIcon(pool.chain);

  return (
    <div
      className={`glass-card relative overflow-hidden p-6 transition cursor-pointer ${
        pool.available ? 'hover:border-primary-500' : 'hover:border-amber-500/50'
      }`}
      onClick={() => onShowDetails?.(pool)}
    >
      {/* Chain Badge & Favorite */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(pool.id);
            }}
            className={`rounded-lg p-1.5 transition ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
        <div className="text-2xl">{chainIcon}</div>
      </div>

      {/* Preview Badge */}
      {!pool.available && (
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-200">
            💭 Preview
          </span>
        </div>
      )}

      {/* Pool Info */}
      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{pool.name}</h3>
          <p className="text-sm text-slate-400">{pool.protocol}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400">APY</p>
            <p className="font-semibold text-emerald-400">{pool.apy.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">TVL</p>
            <p className="font-semibold text-white">{formatTVL(pool.tvl)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Risk</p>
            <p className={`font-semibold ${riskColor}`}>
              {pool.risk}/5
              {' '}
              {pool.risk <= 2 ? '🛡️' : pool.risk === 3 ? '⚖️' : '🚀'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Asset</p>
            <p className="font-semibold text-white">{pool.asset}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2">{pool.description}</p>

        {/* Actions */}
        <div className="flex gap-2">
          {pool.available && onAddToWhitelist ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToWhitelist(pool.id);
              }}
              className="flex-1 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400"
            >
              Add to Whitelist
            </button>
          ) : onShowPreview ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowPreview(pool);
              }}
              className="flex-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/30"
            >
              Preview Returns
            </button>
          ) : null}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails?.(pool);
            }}
            className="rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Helpers
function getRiskColor(risk: number): string {
  if (risk <= 2) return 'text-emerald-400';
  if (risk === 3) return 'text-amber-400';
  return 'text-rose-400';
}

function getChainIcon(chain: string): string {
  const icons: Record<string, string> = {
    'monad-testnet': '🌊',
    'ethereum': '⟠',
    'base': '🔵',
    'arbitrum': '🔷',
    'optimism': '🔴'
  };
  return icons[chain] || '⛓️';
}

function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(0)}K`;
  return `$${tvl}`;
}

function calculateAvgApy(pools: Pool[]): number {
  if (pools.length === 0) return 0;
  const sum = pools.reduce((acc, p) => acc + p.apy, 0);
  return sum / pools.length;
}
