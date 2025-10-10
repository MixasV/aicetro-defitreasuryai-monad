import useSWR from 'swr';
import type { AlertEvent, PortfolioProjection, PortfolioSnapshot } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const usePortfolio = (address: string) => {
  const { data, error, isLoading } = useSWR<PortfolioSnapshot>(
    address ? ['portfolio', address] : null,
    () => apiClient.getPortfolio(address),
    {
      refreshInterval: 30000, // Refresh every 30s
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      onError: (err) => {
        console.error('[usePortfolio] Failed to load portfolio:', err);
      }
    }
  );

  return {
    portfolio: data,
    isLoading,
    isError: Boolean(error)
  };
};

export const useAlerts = (address: string) => {
  const { data, error, isLoading } = useSWR<AlertEvent[]>(
    address ? ['alerts', address] : null,
    () => apiClient.getAlerts(address)
  );

  return {
    alerts: data ?? [],
    isLoading,
    isError: Boolean(error)
  };
};

export const usePortfolioProjection = (address: string) => {
  const { data, error, isLoading } = useSWR<PortfolioProjection>(
    address ? ['portfolio-projection', address] : null,
    () => apiClient.getPortfolioProjection(address)
  );

  return {
    projection: data,
    isLoading,
    isError: Boolean(error)
  };
};
