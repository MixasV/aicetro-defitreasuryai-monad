import useSWR from 'swr';
import type { PreviewDataOverview } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';
import type { ApplicationMode } from '@defitreasuryai/types';

export const usePreviewOverview = (mode: ApplicationMode) => {
  const shouldFetch = mode === 'preview';
  const { data, error, isLoading } = useSWR<PreviewDataOverview>(
    shouldFetch ? 'preview-overview' : null,
    () => apiClient.getPreviewOverview(),
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000
    }
  );

  return {
    overview: data,
    isLoading,
    isError: Boolean(error)
  };
};
