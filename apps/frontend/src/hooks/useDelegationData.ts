import { useQuery } from '@tanstack/react-query';
import { useEffectiveAddress } from './useEffectiveAddress';

interface DelegationData {
  exists: boolean;
  delegation: {
    id: string;
    userAddress: string;
    aiAgentAddress: string;
    delegationHash: string;
    dailyLimitUSD: number;
    maxRiskScore: number;
    allowedProtocols: string[];
    validUntil: string;
    active: boolean;
    mode: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  message?: string;
}

export function useDelegationData(overrideAddress?: string) {
  const { effectiveAddress: defaultAddress } = useEffectiveAddress();
  const address = overrideAddress || defaultAddress;
  return useQuery<DelegationData>({
    queryKey: ['delegation-data', address],
    queryFn: async () => {
      if (!address) throw new Error('No address provided');
      
      const response = await fetch(`/api/delegation/${address}`);
      if (!response.ok) {
        if (response.status === 404) {
          // No delegation found
          return {
            exists: false,
            delegation: null,
            message: 'No active delegation'
          };
        }
        throw new Error('Failed to fetch delegation data');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!address,
    staleTime: 60_000, // Cache for 1 minute
    refetchInterval: 60_000 // Refresh every minute
  });
}
