import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import type { MonitoringPollerRunSummary, MonitoringPollerStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

interface StartPollerResponse {
  started: boolean;
  status: MonitoringPollerStatus;
}

interface StopPollerResponse {
  stopped: boolean;
  status: MonitoringPollerStatus;
}

interface RunPollerResponse {
  summary?: MonitoringPollerRunSummary | null;
  status: MonitoringPollerStatus;
  message?: string;
}

export const useMonitoringPoller = () => {
  const {
    data: status,
    error,
    isLoading,
    mutate
  } = useSWR<MonitoringPollerStatus>('monitoring:poller:status', async () => await apiClient.getMonitoringPollerStatus(), {
    refreshInterval: 20000,
    revalidateOnFocus: true
  });

  const startMutation = useSWRMutation<StartPollerResponse, Error>('monitoring:poller:start', async () => {
    const response = await apiClient.startMonitoringPoller();
    await mutate(response.status, false);
    return response;
  });

  const stopMutation = useSWRMutation<StopPollerResponse, Error>('monitoring:poller:stop', async () => {
    const response = await apiClient.stopMonitoringPoller();
    await mutate(response.status, false);
    return response;
  });

  const runMutation = useSWRMutation<RunPollerResponse, Error>('monitoring:poller:run', async () => {
    const response = await apiClient.runMonitoringPollerOnce();
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
