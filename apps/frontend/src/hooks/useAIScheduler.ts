import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import type { AISchedulerRunSummary, AISchedulerStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

interface StartSchedulerResponse {
  started: boolean;
  status: AISchedulerStatus;
}

interface StopSchedulerResponse {
  stopped: boolean;
  status: AISchedulerStatus;
}

interface RunSchedulerResponse {
  summary?: AISchedulerRunSummary | null;
  status: AISchedulerStatus;
  message?: string;
}

export const useAIScheduler = () => {
  const {
    data: status,
    error,
    isLoading,
    mutate
  } = useSWR<AISchedulerStatus>('ai:scheduler:status', async () => await apiClient.getSchedulerStatus(), {
    refreshInterval: 15000,
    revalidateOnFocus: true
  });

  const startMutation = useSWRMutation<StartSchedulerResponse, Error>('ai:scheduler:start', async () => {
    const response = await apiClient.startScheduler();
    await mutate(response.status, false);
    return response;
  });

  const stopMutation = useSWRMutation<StopSchedulerResponse, Error>('ai:scheduler:stop', async () => {
    const response = await apiClient.stopScheduler();
    await mutate(response.status, false);
    return response;
  });

  const runMutation = useSWRMutation<RunSchedulerResponse, Error>('ai:scheduler:run', async () => {
    const response = await apiClient.runSchedulerOnce();
    await mutate(response.status, false);
    return response;
  });

  return {
    status: status ?? null,
    isLoading,
    isError: Boolean(error),
    start: startMutation.trigger,
    stop: stopMutation.trigger,
    runOnce: runMutation.trigger,
    isStarting: startMutation.isMutating,
    isStopping: stopMutation.isMutating,
    isRunningOnce: runMutation.isMutating,
    lastRunResponse: runMutation.data ?? null,
    actionError: startMutation.error ?? stopMutation.error ?? runMutation.error ?? null
  };
};
