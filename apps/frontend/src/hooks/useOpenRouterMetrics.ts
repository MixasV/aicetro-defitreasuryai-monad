import useSWR from 'swr';
import type { OpenRouterMetricsResponse } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useOpenRouterMetrics = (limit = 20) => {
  const normalizedLimit = Number.isFinite(limit) ? Math.min(Math.max(Math.floor(limit), 1), 100) : 20;
  const key = ['ai:openrouter:metrics', normalizedLimit] as const;
  const fetcher = ([, size]: readonly [string, number]) => apiClient.getOpenRouterMetrics(size);
  const { data, error, isLoading, isValidating, mutate } = useSWR<OpenRouterMetricsResponse>(key, fetcher, {
    refreshInterval: 30_000,
    dedupingInterval: 10_000,
    revalidateOnFocus: false
  });

  const fallback: OpenRouterMetricsResponse = {
    summary: {
      totalCalls: 0,
      successCount: 0,
      errorCount: 0,
      skippedCount: 0
    },
    metrics: []
  };

  return {
    telemetry: data ?? fallback,
    isLoading,
    isError: Boolean(error),
    isRefreshing: isValidating,
    refresh: mutate
  };
};
