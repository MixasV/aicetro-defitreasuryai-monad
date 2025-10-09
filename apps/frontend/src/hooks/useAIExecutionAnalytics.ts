import useSWR from 'swr';
import type { AIExecutionAnalytics } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIExecutionAnalytics = (account: string) => {
  const normalized = account.trim().toLowerCase();
  const shouldFetch = normalized.length > 0;
  const key = shouldFetch ? (['ai:executions:analytics', normalized] as const) : null;
  const fetcher = ([, acc]: readonly [string, string]) => apiClient.getExecutionAnalytics(acc);
  const { data, error, isLoading, mutate } = useSWR<AIExecutionAnalytics>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000
  });

  const fallback: AIExecutionAnalytics = {
    account: normalized,
    totalExecutions: 0,
    successRate: 0,
    totalExecutedUsd: 0,
    executedProtocols: 0,
    topProtocols: []
  };

  return {
    analytics: data ?? fallback,
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
