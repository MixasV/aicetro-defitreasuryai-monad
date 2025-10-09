"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CorporateAccountState {
  address?: string;
  owners: string[];
  threshold: number;
}

interface CorporateAccountContextValue {
  account: CorporateAccountState;
  setAccount: (update: CorporateAccountState | ((prev: CorporateAccountState) => CorporateAccountState)) => void;
  setAccountAddress: (address?: string | null) => void;
  setOwners: (owners: string[]) => void;
  setThreshold: (threshold: number) => void;
  resetAccount: () => void;
  connectedEOA?: string;
  setConnectedEOA: (address?: string | null) => void;
}

const STORAGE_KEY = 'defitreasury.corporate-account';

const defaultState: CorporateAccountState = {
  owners: [],
  threshold: 2
};

const CorporateAccountContext = createContext<CorporateAccountContextValue | undefined>(undefined);

const loadStoredState = (): CorporateAccountState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<CorporateAccountState> | null;
    if (!parsed || typeof parsed !== 'object') return defaultState;

    const owners = Array.isArray(parsed.owners)
      ? parsed.owners.filter((owner): owner is string => typeof owner === 'string')
      : [];

    const threshold = typeof parsed.threshold === 'number' && Number.isFinite(parsed.threshold)
      ? parsed.threshold
      : defaultState.threshold;

    const address = typeof parsed.address === 'string' ? parsed.address : undefined;

    return {
      address,
      owners,
      threshold
    };
  } catch (error) {
    console.warn('[CorporateAccount] failed to parse stored state', error);
    return defaultState;
  }
};

export const CorporateAccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccountState] = useState<CorporateAccountState>(() => loadStoredState());
  const [connectedEOA, setConnectedEOAState] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const payload = JSON.stringify(account);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.warn('[CorporateAccount] failed to persist state', error);
    }
  }, [account]);

  const setAccount = useCallback<CorporateAccountContextValue['setAccount']>((update) => {
    setAccountState((prev) => (typeof update === 'function' ? update(prev) : update));
  }, []);

  const setAccountAddress = useCallback<CorporateAccountContextValue['setAccountAddress']>((address) => {
    setAccountState((prev) => ({
      ...prev,
      address: address ?? undefined
    }));
  }, []);

  const setOwners = useCallback<CorporateAccountContextValue['setOwners']>((owners) => {
    setAccountState((prev) => ({
      ...prev,
      owners
    }));
  }, []);

  const setThreshold = useCallback<CorporateAccountContextValue['setThreshold']>((threshold) => {
    setAccountState((prev) => ({
      ...prev,
      threshold
    }));
  }, []);

  const resetAccount = useCallback(() => {
    setAccountState(defaultState);
  }, []);

  const setConnectedEOA = useCallback<CorporateAccountContextValue['setConnectedEOA']>((address) => {
    setConnectedEOAState(address ?? undefined);
  }, []);

  const value = useMemo<CorporateAccountContextValue>(() => ({
    account,
    setAccount,
    setAccountAddress,
    setOwners,
    setThreshold,
    resetAccount,
    connectedEOA,
    setConnectedEOA
  }), [account, connectedEOA, resetAccount, setAccount, setAccountAddress, setConnectedEOA, setOwners, setThreshold]);

  return <CorporateAccountContext.Provider value={value}>{children}</CorporateAccountContext.Provider>;
};

export const useCorporateAccountContext = () => {
  const context = useContext(CorporateAccountContext);
  if (context == null) {
    throw new Error('useCorporateAccountContext must be used within CorporateAccountProvider');
  }
  return context;
};
