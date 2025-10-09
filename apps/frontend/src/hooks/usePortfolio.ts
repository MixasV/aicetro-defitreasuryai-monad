import useSWR from 'swr';
import type { AlertEvent, PortfolioProjection, PortfolioSnapshot } from '@defitreasuryai/types';
import { apiClient } from '../lib/api';

export const usePortfolio = (address: string) => {
  const { data, error, isLoading } = useSWR<PortfolioSnapshot>(
    address ? ['portfolio', address] : null,
    () => apiClient.getPortfolio(address)
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
