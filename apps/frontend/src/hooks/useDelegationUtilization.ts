import { useQuery } from '@tanstack/react-query';
import { useEffectiveAddress } from './useEffectiveAddress';

interface DelegationUtilization {
  success: boolean;
  dailyLimit: number;
  spent24h: number;
  remaining: number;
  utilization: number;
  recentTransactions?: number;
  message?: string;
}

export function useDelegationUtilization(overrideAddress?: string) {
  const { effectiveAddress: defaultAddress } = useEffectiveAddress();
  const address = overrideAddress || defaultAddress;
  return useQuery<DelegationUtilization>({
    queryKey: ['delegation-utilization', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      
      const response = await fetch(`/api/delegation/simple/${address}/utilization`);
      if (!response.ok) {
        if (response.status === 404) {
          // No delegation yet
          return {
            success: false,
            dailyLimit: 0,
            spent24h: 0,
            remaining: 0,
            utilization: 0,
            message: 'No active delegation'
          };
        }
        throw new Error('Failed to fetch delegation utilization');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!address,
    staleTime: 10_000, // Cache for 10 seconds
    refetchInterval: 10_000 // Refresh every 10 seconds (more frequent for limits)
  });
}
