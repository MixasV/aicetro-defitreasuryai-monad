import useSWR from 'swr';
import type { EmergencyLogEntry } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

const buildKey = (account?: string) => {
  if (account == null || account.trim() === '') {
    return ['emergency-log', 'all'] as const;
  }
  return ['emergency-log', account.toLowerCase()] as const;
};

export const useEmergencyLog = (account?: string) => {
  const key = buildKey(account);
  const { data, error, isLoading, mutate } = useSWR<EmergencyLogEntry[]>(key, () => apiClient.getEmergencyLog(account));

  return {
    entries: data ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: () => mutate(),
    appendEntry: (entry: EmergencyLogEntry) => mutate((current) => {
      const currentEntries = current ?? [];
      const filtered = currentEntries.filter((item) => item.id !== entry.id);
      return [entry, ...filtered].slice(0, 50);
    }, { revalidate: false }),
    replaceEntries: (entries: EmergencyLogEntry[]) => mutate(entries, { revalidate: false })
  };
};
