import useSWR from 'swr';
import type { EmergencyControlSnapshot } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useEmergencyControlSnapshot = (account?: string) => {
  const normalized = account?.trim().toLowerCase();
  const key = normalized && normalized.length > 0 ? (['emergency-control', normalized] as const) : null;

  const { data, error, isLoading, mutate } = useSWR<EmergencyControlSnapshot | null>(
    key,
    () => apiClient.getEmergencyControlSnapshot(normalized!)
  );

  return {
    snapshot: data ?? null,
    isLoading,
    isError: Boolean(error),
    refresh: () => mutate()
  };
};
