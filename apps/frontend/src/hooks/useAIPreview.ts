import useSWRMutation from 'swr/mutation';
import type { AIPreviewRequest, AIPreviewResult } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIPreview = () => {
  const { trigger, data, error, isMutating } = useSWRMutation<
    AIPreviewResult,
    Error,
    string,
    AIPreviewRequest
  >('ai:preview', (_key, { arg }) => apiClient.previewAI(arg));

  return {
    runPreview: trigger,
    preview: data ?? null,
    isLoading: isMutating,
    isError: Boolean(error)
  };
};
