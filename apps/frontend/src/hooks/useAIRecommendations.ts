import useSWRMutation from 'swr/mutation';
import type { AIRecommendationRequest, AIRecommendationResponse } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIRecommendations = () => {
  const { trigger, data, error, isMutating } = useSWRMutation<
    AIRecommendationResponse,
    Error,
    string,
    AIRecommendationRequest
  >('ai:recommendations', (_key, { arg }) => apiClient.postRecommendation(arg));

  return {
    recommendations: data ?? null,
    generate: trigger,
    isLoading: isMutating,
    isError: Boolean(error)
  };
};
