'use client';

import { useSDK } from '@metamask/sdk-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../lib/api';
import { useCorporateAccount } from './useCorporateAccount';

const normalizeAddress = (value?: string | null): string | undefined => {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed.startsWith('0x')) return undefined;
  return trimmed.toLowerCase();
};

export const useSmartAccount = () => {
  const { sdk } = useSDK();
  const {
    account,
    setAccount,
    setAccountAddress,
    setOwners,
    setThreshold,
    connectedEOA,
    setConnectedEOA,
    setAgentAddress,
    setAgentName
  } = useCorporateAccount();
  const [isLoading, setLoading] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdk) return;
    try {
      const provider = sdk.getProvider?.();
      const selected = normalizeAddress((provider as { selectedAddress?: string } | null)?.selectedAddress);
      if (selected && selected !== connectedEOA) {
        setConnectedEOA(selected);
      }
    } catch (err) {
      console.warn('[SmartAccount] failed to read provider state', err);
    }
  }, [sdk, connectedEOA, setConnectedEOA]);

  const ensureOwnersArray = useCallback(
    (owners?: string[]): string[] => {
      const base = Array.isArray(owners) && owners.length > 0
        ? owners.map((owner) => owner.trim())
        : account.owners.length > 0
          ? [...account.owners]
          : [];

      while (base.length < 3) {
        base.push('');
      }

      return base.slice(0, 3);
    },
    [account.owners]
  );

  const createCorporateAccount = useCallback(
    async (owners: string[], threshold = 2, agentName?: string) => {
      setError(null);
      setLoading(true);
      const trimmedOwners = ensureOwnersArray(owners).map((owner) => owner.trim());
      const normalizedOwners = trimmedOwners.map((owner) => (owner.startsWith('0x') ? owner.toLowerCase() : owner));

      const fallback = async () => {
        const result = await apiClient.createCorporateAccount({ owners: normalizedOwners, threshold, agentName });
        const nextOwners = ensureOwnersArray(result.owners);
        setAccount((prev) => ({
          ...prev,
          address: result.address,
          owners: nextOwners,
          threshold: result.threshold,
          aiAgentAddress: result.aiAgentAddress,
          aiAgentName: result.aiAgentName
        }));
        setAccountAddress(result.address);
        setOwners(nextOwners);
        setThreshold(result.threshold);
        setAgentAddress(result.aiAgentAddress);
        setAgentName(result.aiAgentName);
      };

      try {
        if (!sdk) {
          console.warn('[SmartAccount] MetaMask SDK not available, using backend');
          await fallback();
          return;
        }

        const provider = sdk.getProvider();
        if (!provider) {
          console.warn('[SmartAccount] MetaMask provider not initialized, using backend');
          await fallback();
          return;
        }

        const response = await provider.request({
          method: 'wallet_createSmartAccount',
          params: [{
            owners: normalizedOwners,
            threshold,
            features: ['delegation', 'timelock'],
            chainId: '0x279f'
          }]
        });

        const smartAccount = (response as any)?.smartAccount as string | undefined;
        if (!smartAccount) {
          throw new Error('MetaMask вернул пустой адрес');
        }

        const nextOwners = ensureOwnersArray(normalizedOwners);
        setAccount((prev) => ({
          ...prev,
          address: smartAccount,
          owners: nextOwners,
          threshold
        }));
        setAccountAddress(smartAccount);
        setOwners(nextOwners);
        setThreshold(threshold);

        void apiClient.createCorporateAccount({ owners: normalizedOwners, threshold, agentName })
          .then((result) => {
            const syncedOwners = ensureOwnersArray(result.owners);
            setAccount((prev) => ({
              ...prev,
              address: prev.address ?? result.address,
              owners: syncedOwners,
              threshold: result.threshold,
              aiAgentAddress: result.aiAgentAddress,
              aiAgentName: result.aiAgentName
            }));
            setAgentAddress(result.aiAgentAddress);
            setAgentName(result.aiAgentName);
          })
          .catch((err) => {
            console.warn('[SmartAccount] backend sync failed', err);
          });
      } catch (err) {
        console.warn('[SmartAccount] wallet_createSmartAccount not supported, using backend fallback', err);
        try {
          await fallback();
        } catch (fallbackError) {
          console.error('[SmartAccount] backend fallback failed', fallbackError);
          setError(fallbackError instanceof Error ? fallbackError.message : 'Failed to create Smart Account');
        }
      } finally {
        setLoading(false);
      }
    },
    [ensureOwnersArray, sdk, setAccount, setAccountAddress, setAgentAddress, setAgentName, setOwners, setThreshold]
  );

  const connectWallet = useCallback(async () => {
    setError(null);
    if (!sdk) {
      setError('MetaMask SDK недоступен');
      return;
    }

    setConnecting(true);
    try {
      const result = await (sdk.connect?.() ?? Promise.resolve([]));
      const accounts = Array.isArray(result) ? result : [];
      const primary = normalizeAddress(accounts[0]);
      if (!primary) {
        throw new Error('MetaMask не вернул адрес кошелька');
      }

      setConnectedEOA(primary);
      const nextOwners = ensureOwnersArray(account.owners.length ? account.owners : [primary]);
      nextOwners[0] = primary;
      setOwners(nextOwners.map((owner, index) => (owner && owner.startsWith('0x') ? owner.toLowerCase() : index === 0 ? primary : owner)));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Не удалось подключить MetaMask');
      throw err;
    } finally {
      setConnecting(false);
    }
  }, [sdk, ensureOwnersArray, account.owners, setOwners, setConnectedEOA]);

  const disconnectWallet = useCallback(async () => {
    setError(null);
    try {
      if (typeof sdk?.disconnect === 'function') {
        await sdk.disconnect();
      }
    } catch (err) {
      console.warn('[SmartAccount] disconnect failed', err);
    } finally {
      setConnectedEOA(null);
    }
  }, [sdk, setConnectedEOA]);

  const isConnected = useMemo(() => Boolean(connectedEOA), [connectedEOA]);

  const updateOwners = useCallback((owners: string[]) => {
    const next = ensureOwnersArray(owners);
    setOwners(next.map((owner) => (owner && owner.startsWith('0x') ? owner.toLowerCase() : owner)));
  }, [ensureOwnersArray, setOwners]);

  const updateThreshold = useCallback((value: number) => {
    setThreshold(value);
  }, [setThreshold]);

  return {
    account,
    createCorporateAccount,
    connectWallet,
    disconnectWallet,
    connectedEOA,
    isConnected,
    isLoading,
    isConnecting,
    error,
    updateOwners,
    updateThreshold,
    updateAgentName: setAgentName
  };
};
