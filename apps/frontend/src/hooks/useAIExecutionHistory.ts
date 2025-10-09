import useSWR from 'swr';
import type { AIExecutionRecord } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIExecutionHistory = (account: string) => {
  const shouldFetch = account.trim().length > 0;
  const key = shouldFetch ? (['ai:executions', account.toLowerCase()] as const) : null;
  const fetcher = ([, acc]: readonly [string, string]) => apiClient.getExecutionHistory(acc);
  const { data, error, isLoading, mutate } = useSWR<AIExecutionRecord[]>(key, fetcher);

  return {
    history: data ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
