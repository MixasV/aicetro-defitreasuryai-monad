'use client';

import { RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { http, type Chain } from 'viem';
import { monadTestnet } from '../config/chains';

if (typeof window === 'undefined') {
  void import('fake-indexeddb/auto');
}

const MetaMaskProvider = dynamic(() => import('@metamask/sdk-react').then((mod) => mod.MetaMaskProvider), {
  ssr: false
});

interface Props {
  children: React.ReactNode;
}

const CHAINS = [monadTestnet] as const satisfies readonly [Chain, ...Chain[]];

export const Web3Providers = ({ children }: Props) => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo-project';

  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const wagmiConfig = useMemo(
    () =>
      getDefaultConfig({
        appName: 'DeFiTreasury AI',
        projectId,
        chains: CHAINS,
        transports: {
          [monadTestnet.id]: http('https://testnet-rpc.monad.xyz')
        },
        ssr: true
      }),
    [projectId]
  );

  const metamaskSdkOptions = useMemo(
    () => ({
      dappMetadata: {
        name: 'DeFiTreasury AI',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://defitreasury.ai'
      },
      logging: { developerMode: process.env.NODE_ENV !== 'production' },
      checkInstallationImmediately: true
    }),
    []
  );

  const content = (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={darkTheme({ accentColor: '#346ef0' })} modalSize="compact">
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {mounted ? (
        <MetaMaskProvider debug={process.env.NODE_ENV !== 'production'} sdkOptions={metamaskSdkOptions}>
          {content}
        </MetaMaskProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
};
