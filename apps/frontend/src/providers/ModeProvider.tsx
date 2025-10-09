'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ApplicationMode } from '@defitreasuryai/types';
import useSWR from 'swr';
import { apiClient } from '../lib/api';

interface ModeContextValue {
  mode: ApplicationMode;
  isLoading: boolean;
  isSwitching: boolean;
  setMode: (mode: ApplicationMode) => Promise<void>;
}

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, mutate, isValidating } = useSWR('app-mode', () => apiClient.getAppMode(), {
    revalidateOnFocus: false
  });

  const setMode = useCallback(
    async (mode: ApplicationMode) => {
      await apiClient.setAppMode(mode, 'frontend-ui');
      await mutate();
    },
    [mutate]
  );

  const value = useMemo<ModeContextValue>(() => ({
    mode: data?.mode ?? 'real',
    isLoading,
    isSwitching: isValidating,
    setMode
  }), [data?.mode, isLoading, isValidating, setMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useAppModeContext() {
  const context = useContext(ModeContext);
  if (context == null) {
    throw new Error('useAppModeContext must be used within ModeProvider');
  }
  return context;
}
