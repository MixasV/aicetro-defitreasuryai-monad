import useSWR from 'swr';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface AutoExecutionStatus {
  autoExecutionEnabled: boolean;
  portfolioPercentage: number;
  autoExecutedUsd: number;
  lastAutoExecutionAt?: string;
}

export const useAutoExecution = (account?: string) => {
  const { data, error, mutate, isLoading } = useSWR<AutoExecutionStatus>(
    account ? `/api/delegation/${account}/auto-execution` : null,
    async (url: string) => {
      const response = await axios.get(`${BACKEND_URL}${url}`);
      return response.data;
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  );

  return {
    autoExecutionStatus: data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate
  };
};

export const useUpdateAutoExecution = () => {
  const updateSettings = async (
    account: string,
    settings: { enabled: boolean; portfolioPercentage: number }
  ): Promise<AutoExecutionStatus> => {
    const response = await axios.post(
      `${BACKEND_URL}/api/delegation/${account}/auto-execution`,
      settings
    );
    return response.data.delegation;
  };

  return { updateSettings };
};
