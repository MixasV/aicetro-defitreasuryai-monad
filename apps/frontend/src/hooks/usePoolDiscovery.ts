import useSWR from 'swr';
import { apiClient } from '../lib/api';

export interface Pool {
  id: string;
  name: string;
  protocol: string;
  chain: 'monad-testnet' | 'ethereum' | 'base' | 'arbitrum' | 'optimism';
  asset: string;
  apy: number;
  tvl: number;
  risk: 1 | 2 | 3 | 4 | 5;
  available: boolean;
  address: string;
  category: 'stablecoin' | 'eth-derivative' | 'volatile' | 'lp';
  description: string;
}

export interface PoolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  available: boolean;
  avgApy: number;
  totalTvl: number;
}

export interface PoolFilters {
  chain?: string;
  category?: string;
  risk?: { min: number; max: number };
  search?: string;
}

export const useAllPools = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'pools',
    () => {
      console.log('[useAllPools] Fetching pools...');
      return apiClient.getPools();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
      onSuccess: (data) => {
        console.log('[useAllPools] Pools loaded:', data);
      },
      onError: (err) => {
        console.error('[useAllPools] Error loading pools:', err);
      }
    }
  );

  console.log('[useAllPools] State:', { 
    hasData: !!data, 
    poolsCount: data?.pools?.length, 
    total: data?.total,
    isLoading, 
    error 
  });

  return {
    pools: data?.pools ?? [],
    total: data?.total ?? 0,
    available: data?.available ?? 0,
    preview: data?.preview ?? 0,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};

export const usePoolCategories = () => {
  const { data, error, isLoading } = useSWR(
    'pool-categories',
    () => apiClient.getPoolCategories(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  );

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError: Boolean(error)
  };
};

export const usePoolsByChain = (chain: string) => {
  const { data, error, isLoading } = useSWR(
    chain ? ['pools-chain', chain] : null,
    () => apiClient.getPoolsByChain(chain),
    {
      revalidateOnFocus: false
    }
  );

  return {
    pools: data?.pools ?? [],
    total: data?.total ?? 0,
    available: data?.available ?? 0,
    isLoading,
    isError: Boolean(error)
  };
};

export const usePoolsByCategory = (category: string) => {
  const { data, error, isLoading } = useSWR(
    category ? ['pools-category', category] : null,
    () => apiClient.getPoolsByCategory(category),
    {
      revalidateOnFocus: false
    }
  );

  return {
    pools: data?.pools ?? [],
    total: data?.total ?? 0,
    available: data?.available ?? 0,
    isLoading,
    isError: Boolean(error)
  };
};

export const usePoolsByRisk = (minRisk: number, maxRisk: number) => {
  const { data, error, isLoading } = useSWR(
    ['pools-risk', minRisk, maxRisk],
    () => apiClient.getPoolsByRisk(minRisk, maxRisk),
    {
      revalidateOnFocus: false
    }
  );

  return {
    pools: data?.pools ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: Boolean(error)
  };
};

export const usePoolSearch = (query: string) => {
  const { data, error, isLoading } = useSWR(
    query && query.length > 0 ? ['pools-search', query] : null,
    () => apiClient.searchPools(query),
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000
    }
  );

  return {
    pools: data?.pools ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: Boolean(error)
  };
};

// Combined hook with filtering
export const usePoolDiscovery = (filters?: PoolFilters) => {
  const { pools: allPools, isLoading: isLoadingAll } = useAllPools();
  const { categories, isLoading: isLoadingCategories } = usePoolCategories();

  console.log('[usePoolDiscovery] All pools:', allPools.length, 'Filters:', filters);

  // Apply client-side filters
  let filteredPools = allPools;

  if (filters?.chain) {
    filteredPools = filteredPools.filter((p: Pool) => p.chain === filters.chain);
  }

  if (filters?.category) {
    filteredPools = filteredPools.filter((p: Pool) => p.category === filters.category);
  }

  if (filters?.risk) {
    filteredPools = filteredPools.filter(
      (p: Pool) => p.risk >= filters.risk!.min && p.risk <= filters.risk!.max
    );
  }

  if (filters?.search && filters.search.length > 0) {
    const query = filters.search.toLowerCase();
    filteredPools = filteredPools.filter(
      (p: Pool) =>
        p.name.toLowerCase().includes(query) ||
        p.protocol.toLowerCase().includes(query) ||
        p.asset.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  console.log('[usePoolDiscovery] Filtered pools:', filteredPools.length);

  return {
    pools: filteredPools,
    allPools,
    categories,
    isLoading: isLoadingAll || isLoadingCategories,
    total: filteredPools.length,
    available: filteredPools.filter((p: Pool) => p.available).length
  };
};
