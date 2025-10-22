/**
 * Hook for fetching pending rebalancing transactions
 */

import { useQuery } from '@tanstack/react-query';

interface PendingRebalanceSummary {
  totalCount: number;
  totalAmountUsd: number;
  estimatedGasSavings: number;
  estimatedApyGain: number;
  poolsAffected: string[];
  oldestPendingDays: number;
}

interface PendingRebalanceDetail {
  id: string;
  fromProtocol: string;
  toProtocol: string;
  amountUsd: number;
  currentApy: number;
  targetApy: number;
  apyDifference: number;
  daysToComplete: number;
  gasPerTransaction: number;
  totalGasCost: number;
  singleTransactionGas: number;
  gasSavings: number;
  apyGainIfPushNow: number;
  netBenefit: number;
  createdAt: string;
  scheduledFor: string;
  reasoning: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function usePendingRebalanceSummary(accountAddress?: string) {
  return useQuery({
    queryKey: ['pending-rebalance-summary', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return null;
      
      const response = await fetch(
        `${API_BASE}/pending-rebalance/summary/${accountAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending rebalance summary');
      }
      
      const data = await response.json();
      return data.summary as PendingRebalanceSummary | null;
    },
    enabled: !!accountAddress,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000 // Refresh every minute
  });
}

export function usePendingRebalanceDetails(accountAddress?: string) {
  return useQuery({
    queryKey: ['pending-rebalance-details', accountAddress],
    queryFn: async () => {
      if (!accountAddress) return [];
      
      const response = await fetch(
        `${API_BASE}/pending-rebalance/details/${accountAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending rebalance details');
      }
      
      const data = await response.json();
      return data.details as PendingRebalanceDetail[];
    },
    enabled: !!accountAddress,
    staleTime: 30000
  });
}

export async function pushPendingTransaction(
  transactionId: string,
  signature: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/pending-rebalance/push/${transactionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to push transaction');
  }
}

export async function pushAllPendingTransactions(
  accountAddress: string,
  signature: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/pending-rebalance/push-all/${accountAddress}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to push all transactions');
  }
}
