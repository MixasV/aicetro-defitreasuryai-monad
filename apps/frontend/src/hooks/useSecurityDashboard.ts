import useSWR from 'swr';
import type { SecurityDashboardSummary } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useSecurityDashboard = (account?: string) => {
  const { data, error, isLoading, mutate } = useSWR<SecurityDashboardSummary>(
    account ? ['security-dashboard', account] : null,
    () => apiClient.getSecurityDashboard(account!)
  );

  return {
    summary: data,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
