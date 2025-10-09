import useSWRMutation from 'swr/mutation';
import type { AIExecutionRequest, AIExecutionResult } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const useAIExecution = () => {
  const { trigger, data, error, isMutating } = useSWRMutation<
    AIExecutionResult,
    Error,
    string,
    AIExecutionRequest
  >('ai:execute', (_key, { arg }) => apiClient.executeAI(arg));

  return {
    execute: trigger,
    result: data ?? null,
    isLoading: isMutating,
    isError: Boolean(error)
  };
};
