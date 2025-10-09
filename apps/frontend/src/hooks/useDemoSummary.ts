import useSWR from 'swr';
import type { DemoScenarioRunResult, DemoScenarioSummary } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

const buildKey = (account?: string) => {
  if (account == null || account.trim() === '') {
    return ['demo-summary', 'default'] as const;
  }
  return ['demo-summary', account.toLowerCase()] as const;
};

export const useDemoSummary = (account?: string) => {
  const key = buildKey(account);
  const { data, error, isLoading, mutate } = useSWR<DemoScenarioSummary>(key, () => apiClient.getDemoSummary(account));

  const runDemo = async (): Promise<DemoScenarioRunResult> => {
    const result = await apiClient.runDemoScenario();
    await mutate(result.summary, { revalidate: false });
    return result;
  };

  return {
    summary: data,
    isLoading,
    isError: Boolean(error),
    refresh: () => mutate(),
    runDemo
  };
};
