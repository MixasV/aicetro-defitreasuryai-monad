import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import type { MonitoringStreamStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

interface StartStreamResponse {
  started: boolean;
  status: MonitoringStreamStatus;
}

interface StopStreamResponse {
  stopped: boolean;
  status: MonitoringStreamStatus;
}

export const useMonitoringStream = () => {
  const {
    data: status,
    error,
    isLoading,
    mutate
  } = useSWR<MonitoringStreamStatus>('monitoring:stream:status', async () => await apiClient.getMonitoringStreamStatus(), {
    refreshInterval: 20000,
    revalidateOnFocus: true
  });

  const startMutation = useSWRMutation<StartStreamResponse, Error>('monitoring:stream:start', async () => {
    const response = await apiClient.startMonitoringStream();
    await mutate(response.status, false);
    return response;
  });

  const stopMutation = useSWRMutation<StopStreamResponse, Error>('monitoring:stream:stop', async () => {
    const response = await apiClient.stopMonitoringStream();
    await mutate(response.status, false);
    return response;
  });

  return {
    status: status ?? null,
    isLoading,
    isError: Boolean(error),
    start: startMutation.trigger,
    stop: stopMutation.trigger,
    isStarting: startMutation.isMutating,
    isStopping: stopMutation.isMutating,
    actionError: startMutation.error ?? stopMutation.error ?? null
  };
};
