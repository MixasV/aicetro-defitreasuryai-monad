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
    setConnectedEOA
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
    async (owners: string[], threshold = 2) => {
      setError(null);
      setLoading(true);
      const trimmedOwners = ensureOwnersArray(owners).map((owner) => owner.trim());
      const normalizedOwners = trimmedOwners.map((owner) => (owner.startsWith('0x') ? owner.toLowerCase() : owner));

      const fallback = async () => {
        const result = await apiClient.createCorporateAccount({ owners: normalizedOwners, threshold });
        const nextOwners = ensureOwnersArray(result.owners);
        setAccount({ address: result.address, owners: nextOwners, threshold: result.threshold });
        setAccountAddress(result.address);
        setOwners(nextOwners);
        setThreshold(result.threshold);
      };

      try {
        if (!sdk) {
          throw new Error('MetaMask SDK недоступен');
        }

        const provider = sdk.getProvider();
        if (!provider) {
          throw new Error('MetaMask provider не инициализирован');
        }

        const response = await provider.request({
          method: 'wallet_createSmartAccount',
          params: [{
            owners: normalizedOwners,
            threshold,
            features: ['delegation', 'timelock'],
            chainId: '0xb02e'
          }]
        });

        const smartAccount = (response as any)?.smartAccount as string | undefined;
        if (!smartAccount) {
          throw new Error('MetaMask вернул пустой адрес');
        }

        const nextOwners = ensureOwnersArray(normalizedOwners);
        setAccount({ address: smartAccount, owners: nextOwners, threshold });
        setAccountAddress(smartAccount);
        setOwners(nextOwners);
        setThreshold(threshold);

        void apiClient.createCorporateAccount({ owners: normalizedOwners, threshold }).catch((err) => {
          console.warn('[SmartAccount] backend sync failed', err);
        });
      } catch (err) {
        console.error(err);
        try {
          await fallback();
        } catch (fallbackError) {
          console.error(fallbackError);
          setError('Не удалось создать Smart Account через MetaMask или backend');
        }
      } finally {
        setLoading(false);
      }
    },
    [sdk, ensureOwnersArray, setAccount, setAccountAddress, setOwners, setThreshold]
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
    updateThreshold
  };
};
