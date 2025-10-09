import useSWR from 'swr';
import type { EmergencyStatus } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useEmergencyStatus = (account?: string) => {
  const normalized = account?.trim().toLowerCase() ?? '';
  const key = normalized.length === 0 ? null : (['emergency-status', normalized] as const);
  const { data, error, isLoading, mutate } = useSWR<EmergencyStatus>(key, () => apiClient.getEmergencyStatus(normalized));

  return {
    status: data ?? null,
    isLoading,
    isError: Boolean(error),
    refresh: () => mutate(),
    setStatus: (next: EmergencyStatus) => mutate(next, { revalidate: false })
  };
};
