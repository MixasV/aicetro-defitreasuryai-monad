import useSWR from 'swr';
import type { AISimulationLogEntry } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAISimulations = (account: string, limit = 10) => {
  const normalized = account.trim().toLowerCase();
  const shouldFetch = normalized.length > 0;
  const key = shouldFetch ? (['ai:simulations', normalized, limit] as const) : null;
  const fetcher = ([, acc, max]: readonly [string, string, number]) => apiClient.getSimulationHistory(acc, max);
  const { data, error, isLoading, mutate } = useSWR<AISimulationLogEntry[]>(key, fetcher);

  return {
    simulations: data ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
