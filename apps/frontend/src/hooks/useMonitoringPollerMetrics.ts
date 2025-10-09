import useSWR from 'swr';
import type { MonitoringPollerMetrics } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useMonitoringPollerMetrics = () => {
  const { data, error, isLoading, mutate } = useSWR<MonitoringPollerMetrics>(
    'monitoring:poller:metrics',
    async () => await apiClient.getMonitoringPollerMetrics(),
    {
      refreshInterval: 20000,
      revalidateOnFocus: true
    }
  );

  return {
    metrics: data ?? null,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
