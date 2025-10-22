import { useQuery } from '@tanstack/react-query';

const DEMO_CORPORATE_ACCOUNT = '0xcccccccccccccccccccccccccccccccccccccccc';

interface DelegationInfo {
  active: boolean;
  type?: 'simple' | 'multi';
  dailyLimitUsd?: number;
  aiAgentAddress?: string;
}

export function useDashboardMode(address: string | undefined) {
  // If demo address, skip API call entirely
  const isDemoAddress = address?.toLowerCase() === DEMO_CORPORATE_ACCOUNT.toLowerCase();
  
  const { data: delegation, isLoading } = useQuery<DelegationInfo>({
    queryKey: ['delegation-check', address],
    queryFn: async () => {
      if (!address) return { active: false };
      
      try {
        const response = await fetch(`/api/delegation/${address}`);
        if (!response.ok) {
          console.log('[useDashboardMode] No delegation found (404 expected for new users)');
          return { active: false };
        }
        
        const data = await response.json();
        console.log('[useDashboardMode] API response:', data);
        
        // API returns { exists: boolean, delegation: {...} }
        if (!data.exists || !data.delegation) {
          return { active: false };
        }
        
        return {
          active: data.delegation.active === true,
          type: data.delegation.mode || 'simple',
          dailyLimitUsd: data.delegation.dailyLimitUSD,
          aiAgentAddress: data.delegation.aiAgentAddress
        };
      } catch (error) {
        console.error('[useDashboardMode] Error:', error);
        return { active: false };
      }
    },
    enabled: !!address && !isDemoAddress, // Don't query for demo account
    staleTime: 60_000, // Cache for 1 minute
    refetchInterval: 60_000 // Refresh every minute
  });

  // If demo address, always return demo mode
  if (isDemoAddress) {
    return {
      isDemo: true,
      isReal: false,
      isDelegated: false,
      delegationType: undefined,
      isLoading: false,
      delegation: { active: false }
    };
  }

  return {
    isDemo: !delegation?.active,
    isReal: delegation?.active === true,
    isDelegated: delegation?.active === true,
    delegationType: delegation?.type,
    isLoading,
    delegation
  };
}
