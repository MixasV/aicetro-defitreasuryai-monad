import useSWR from 'swr';
import type { AIExecutionSummary } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIExecutionSummary = (account: string) => {
  const shouldFetch = account.trim().length > 0;
  const key = shouldFetch ? (['ai:execution-summary', account.toLowerCase()] as const) : null;
  const fetcher = ([, acc]: readonly [string, string]) => apiClient.getExecutionSummary(acc);
  const { data, error, isLoading, mutate } = useSWR<AIExecutionSummary>(key, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false
  });

  return {
    summary: data,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
