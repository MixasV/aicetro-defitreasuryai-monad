'use client';

import { ReactNode } from 'react';
import { Web3Providers } from './Web3Providers';
import { CorporateAccountProvider } from './CorporateAccountProvider';
import { ModeProvider } from './ModeProvider';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Web3Providers>
      <ModeProvider>
        <CorporateAccountProvider>{children}</CorporateAccountProvider>
      </ModeProvider>
    </Web3Providers>
  );
};
