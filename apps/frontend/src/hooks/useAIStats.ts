import { useQuery } from '@tanstack/react-query';

interface AIStats {
  success: boolean;
  totalTransactions: number;
  avgTransactionCost: number;
  monthlyFees: number;
  monthlyFeeLimit: number;
  roi: number;
  savedByOptimization: number;
  avgGasGwei: number;
  lastExecutionAt?: string;
  lastExecutionMode?: string;
}

export function useAIStats(address: string | undefined) {
  return useQuery<AIStats>({
    queryKey: ['ai-stats', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      
      const response = await fetch(`/api/ai/stats/${address}`);
      if (!response.ok) {
        if (response.status === 404) {
          // No stats yet - return zeros
          return {
            success: true,
            totalTransactions: 0,
            avgTransactionCost: 0,
            monthlyFees: 0,
            monthlyFeeLimit: 500,
            roi: 0,
            savedByOptimization: 0,
            avgGasGwei: 0
          };
        }
        throw new Error('Failed to fetch AI stats');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!address,
    staleTime: 30_000, // Cache for 30 seconds
    refetchInterval: 30_000 // Refresh every 30 seconds
  });
}
