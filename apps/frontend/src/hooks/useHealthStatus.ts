import useSWR from 'swr';
import type { HealthStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useHealthStatus = (refreshInterval = 20000) => {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<HealthStatus>('health:status', async () => await apiClient.getHealthStatus(), {
    refreshInterval,
    revalidateOnFocus: true
  });

  return {
    status: data ?? null,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
