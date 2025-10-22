'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { PoolTable } from '../../components/pools/PoolTable';
import { Pagination } from '../../components/pools/Pagination';
import { PoolDetailModal } from '../../components/pools/PoolDetailModal';
import { usePageTitle } from '../../hooks/usePageTitle';
import { apiClient } from '../../lib/api';
import { Search, Filter } from 'lucide-react';
import type { Pool } from '../../components/pools/PoolTable';
import { useEffectiveAddress } from '../../hooks/useEffectiveAddress';

export const dynamic = 'force-dynamic';

export default function PoolsPage() {
  usePageTitle('Pools');
  
  const { effectiveAddress: address } = useEffectiveAddress();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const itemsPerPage = 50;
  
  // Filters
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('smart'); // 'smart' = Monad first
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modals
  const [detailPool, setDetailPool] = useState<Pool | null>(null);
  
  // Delegation state
  const [hasActiveDelegation, setHasActiveDelegation] = useState(false);
  const [whitelistedPoolIds, setWhitelistedPoolIds] = useState<string[]>([]);
  
  // Check for active delegation and fetch whitelist
  useEffect(() => {
    async function checkDelegation() {
      if (!address) {
        setHasActiveDelegation(false);
        setWhitelistedPoolIds([]);
        return;
      }
      
      try {
        const response = await apiClient.getActiveDelegation(address);
        setHasActiveDelegation(!!response.delegation);
        
        // Fetch whitelist
        if (response.delegation) {
          const whitelistData = await apiClient.getDelegationWhitelist(address);
          setWhitelistedPoolIds(whitelistData.pools?.map((p: any) => p.id) || []);
        }
      } catch (error) {
        setHasActiveDelegation(false);
        setWhitelistedPoolIds([]);
      }
    }
    
    checkDelegation();
  }, [address]);
  
  // Fetch pools
  useEffect(() => {
    async function fetchPools() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          order: sortOrder,
        };
        
        if (selectedChain !== 'all') {
          params.chain = selectedChain;
        }
        
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        
        const response = await apiClient.getPools(params);
        
        setPools(response.pools || []);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
        setHasNext(response.pagination?.hasNext || false);
        setHasPrev(response.pagination?.hasPrev || false);
      } catch (err) {
        console.error('[PoolsPage] Error fetching pools:', err);
        setError('Failed to load pools');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPools();
  }, [currentPage, selectedChain, selectedCategory, sortBy, sortOrder]);
  
  // Search handler (debounced)
  useEffect(() => {
    if (!searchQuery) return;
    
    const timer = setTimeout(async () => {
      try {
        const response = await apiClient.searchPools(searchQuery);
        setPools(response.pools || []);
        setTotalItems(response.total || 0);
      } catch (err) {
        console.error('[PoolsPage] Search error:', err);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  
  const handleAddToWhitelist = async (poolId: string) => {
    if (!address) {
      alert('Please connect wallet first');
      return;
    }
    
    const isInWhitelist = whitelistedPoolIds.includes(poolId);
    
    if (isInWhitelist) {
      // Remove from whitelist
      if (!confirm('Remove this pool from whitelist? AI will no longer be able to invest in it.')) {
        return;
      }
      
      try {
        await apiClient.removePoolFromDelegationWhitelist(address, poolId);
        setWhitelistedPoolIds(prev => prev.filter(id => id !== poolId));
        alert('Pool removed from whitelist!');
      } catch (error: any) {
        console.error('Failed to remove from whitelist:', error);
        alert(error.response?.data?.error || 'Failed to remove from whitelist');
      }
    } else {
      // Add to whitelist
      try {
        await apiClient.addPoolToDelegationWhitelist(address, poolId);
        setWhitelistedPoolIds(prev => [...prev, poolId]);
        alert('Pool added to whitelist!');
      } catch (error: any) {
        console.error('Failed to add to whitelist:', error);
        alert(error.response?.data?.error || 'Failed to add to whitelist');
      }
    }
  };
  
  const handleLoadMore = async () => {
    if (!hasNext || loading) return;
    
    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      
      const params: any = {
        page: nextPage,
        limit: itemsPerPage,
        sortBy,
        order: sortOrder,
      };
      
      if (selectedChain !== 'all') {
        params.chain = selectedChain;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await apiClient.getPools(params);
      
      // APPEND new pools to existing ones
      setPools((prev) => [...prev, ...(response.pools || [])]);
      setCurrentPage(nextPage);
      setHasNext(response.pagination?.hasNext || false);
      setHasPrev(response.pagination?.hasPrev || false);
      
    } catch (err: any) {
      console.error('Failed to load more pools:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-white">Discover DeFi Pools</h1>
          <p className="mt-2 text-slate-400">
            600+ active pools across 6 chains (Ethereum, Base, Arbitrum, Optimism, Polygon, Monad Testnet). High-volume pools only.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search pools by name, protocol, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Chain filter */}
          <select
            value={selectedChain}
            onChange={(e) => {
              setSelectedChain(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Chains</option>
            <option value="Monad">🟣 Monad</option>
            <option value="Ethereum">⚫ Ethereum</option>
            <option value="Base">🔵 Base</option>
            <option value="Arbitrum">🔷 Arbitrum</option>
            <option value="Optimism">🔴 Optimism</option>
            <option value="Polygon">🟪 Polygon</option>
          </select>
          
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="stablecoin">💵 Stablecoin</option>
            <option value="eth-derivative">⚡ ETH Derivative</option>
            <option value="volatile">📈 Volatile</option>
            <option value="lp">🔄 LP Pair</option>
          </select>
        </div>
        
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-4">
            <div className="text-sm text-slate-400">Total Pools</div>
            <div className="mt-1 text-2xl font-bold text-white">{totalItems.toLocaleString()}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4">
            <div className="text-sm text-slate-400">Monad Testnet</div>
            <div className="mt-1 text-2xl font-bold text-purple-300">
              {pools.filter(p => p.chain === 'Monad').length}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-4">
            <div className="text-sm text-slate-400">Current Page</div>
            <div className="mt-1 text-2xl font-bold text-emerald-300">
              {currentPage} / {totalPages}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-400">Loading pools...</div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}
        
        {/* Pool Table */}
        {!loading && !error && (
          <>
            <PoolTable
              pools={pools}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onDetailClick={setDetailPool}
              onAddToWhitelist={handleAddToWhitelist}
              currentPage={currentPage}
              hasActiveDelegation={hasActiveDelegation}
              whitelistedPoolIds={whitelistedPoolIds}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              hasNext={hasNext}
              hasPrev={hasPrev}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onLoadMore={handleLoadMore}
            />
          </>
        )}
      </div>
      
      {/* Detail Modal */}
      {detailPool && (
        <PoolDetailModal
          pool={detailPool}
          onClose={() => setDetailPool(null)}
        />
      )}
    </AppShell>
  );
}
