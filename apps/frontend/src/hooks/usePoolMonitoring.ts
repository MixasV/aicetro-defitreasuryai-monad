import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

interface PoolMonitoringPermission {
  id: string;
  accountAddress: string;
  poolAddress: string;
  protocol: string;
  enabled: boolean;
  signedAt: string;
}

export function usePoolMonitoring() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data: monitoredPools, isLoading } = useQuery<PoolMonitoringPermission[]>({
    queryKey: ['pool-monitoring', address],
    queryFn: async () => {
      if (!address) return [];
      
      const response = await fetch(`/api/dashboard/pool/monitoring/${address}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.pools || [];
    },
    enabled: !!address,
    staleTime: 60_000
  });

  const enableMonitoring = useMutation({
    mutationFn: async (params: {
      poolAddress: string;
      protocol: string;
      signature: string;
      message: string;
    }) => {
      if (!address) throw new Error('No wallet connected');
      
      const response = await fetch('/api/dashboard/pool/monitoring/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountAddress: address,
          ...params
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enable monitoring');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-monitoring', address] });
    }
  });

  const disableMonitoring = useMutation({
    mutationFn: async (poolAddress: string) => {
      if (!address) throw new Error('No wallet connected');
      
      const response = await fetch('/api/dashboard/pool/monitoring/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountAddress: address,
          poolAddress
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable monitoring');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-monitoring', address] });
    }
  });

  return {
    monitoredPools: monitoredPools || [],
    isLoading,
    enableMonitoring,
    disableMonitoring
  };
}
