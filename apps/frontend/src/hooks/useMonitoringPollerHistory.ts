import useSWR from 'swr';
import type { MonitoringPollerHistoryResponse } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useMonitoringPollerHistory = (limit = 5) => {
  const {
    data,
    error,
    isLoading,
    mutate
  } = useSWR<MonitoringPollerHistoryResponse>(
    `monitoring:poller:history:${limit}`,
    async () => await apiClient.getMonitoringPollerHistory(limit),
    {
      refreshInterval: 20000,
      revalidateOnFocus: true
    }
  );

  return {
    history: data?.summaries ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
