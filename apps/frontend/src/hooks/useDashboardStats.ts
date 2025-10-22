import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalAssets: {
    total: number;
    inPools: number;
    inPoolsDirect: number;
    inPoolsAI: number;
    inWallet: number;
    profitMonth?: number;
    profitAllTime?: number;
  };
  netAPY: {
    overall: number;
    manual: number;
    ai: number;
    growthMonth?: number;
    growthAllTime?: number;
  };
  projectedYield: {
    overall: number;
    manual: number;
    ai: number;
  };
  fees: {
    total: number;
    ai: number;
    manual: number;
  };
}

export function useDashboardStats(accountAddress: string | undefined) {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', accountAddress],
    queryFn: async () => {
      if (!accountAddress) throw new Error('No account address');
      
      const response = await fetch(`/api/dashboard/stats/${accountAddress}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      
      const data = await response.json();
      return data.stats;
    },
    enabled: !!accountAddress,
    staleTime: 60_000, // Cache for 1 minute
    refetchInterval: 60_000 // Refresh every minute (Envio polling limit)
  });
}
