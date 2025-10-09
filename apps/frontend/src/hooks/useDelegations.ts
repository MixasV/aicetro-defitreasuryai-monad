import useSWR from 'swr';
import type { DelegationConfig } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useDelegations = (account?: string) => {
  const { data, error, isLoading, mutate } = useSWR<DelegationConfig[]>(
    account ? ['delegations', account] : null,
    () => apiClient.getDelegations(account as string)
  );

  return {
    delegations: data ?? [],
    isLoading,
    isError: Boolean(error),
    refresh: mutate
  };
};
