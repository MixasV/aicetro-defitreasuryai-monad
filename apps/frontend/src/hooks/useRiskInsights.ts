import useSWR from 'swr';
import type { RiskInsights } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useRiskInsights = (account: string) => {
  const key = account.trim().length > 0 ? ['risk-insights', account.toLowerCase()] : null;
  const { data, error, isLoading, mutate } = useSWR<RiskInsights>(key, () => apiClient.getRiskInsights(account));

  return {
    insights: data,
    isLoading,
    isError: Boolean(error),
    refresh: () => mutate()
  };
};
