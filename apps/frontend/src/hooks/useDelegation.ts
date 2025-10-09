'use client';

import { useCallback, useMemo } from 'react';
import { createDelegation, getDeleGatorEnvironment, PREFERRED_VERSION } from '@metamask/delegation-toolkit';
import type { Hex } from 'viem';
import { bytesToHex } from 'viem';

type DelegationScope = {
  type: 'functionCall';
  targets: Hex[];
  selectors: (Hex | string)[];
};

export type DelegationDraft = {
  delegator: Hex;
  delegate: Hex;
  allowedProtocols: string[];
  createdAt: string;
  scope: DelegationScope;
  delegation: ReturnType<typeof createDelegation>;
};

const MONAD_TESTNET_CHAIN_ID = 10143;

const DEFAULT_METHOD_SELECTORS: `0x${string}`[] = ['0xa9059cbb', '0x095ea7b3', '0x23b872dd', '0x2e1a7d4d'];

export const PROTOCOL_REGISTRY: Record<string, { target: Hex; selectors: `0x${string}`[] }> = {
  'Aave Monad': {
    target: '0x1111111111111111111111111111111111111111',
    selectors: DEFAULT_METHOD_SELECTORS
  },
  'Yearn Monad': {
    target: '0x2222222222222222222222222222222222222222',
    selectors: DEFAULT_METHOD_SELECTORS
  },
  'Compound Monad': {
    target: '0x3333333333333333333333333333333333333333',
    selectors: DEFAULT_METHOD_SELECTORS
  },
  MonadSwap: {
    target: '0x4444444444444444444444444444444444444444',
    selectors: ['0x18cbafe5', '0x022c0d9f', ...DEFAULT_METHOD_SELECTORS]
  }
};

const normalizeAddress = (value: string): Hex => {
  if (!value || typeof value !== 'string' || !value.startsWith('0x')) {
    throw new Error(`Invalid address: ${value}`);
  }
  return value as Hex;
};

const randomSalt = (): Hex => {
  const buffer = new Uint8Array(32);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(buffer);
  } else {
    for (let index = 0; index < buffer.length; index += 1) {
      buffer[index] = Math.floor(Math.random() * 256);
    }
  }
  return bytesToHex(buffer);
};

const buildScope = (protocols: string[]): DelegationScope => {
  const resolved = Array.from(new Set(protocols))
    .map((name) => PROTOCOL_REGISTRY[name])
    .filter((entry): entry is { target: Hex; selectors: `0x${string}`[] } => Boolean(entry));

  if (!resolved.length) {
    throw new Error('No supported protocols supplied for delegation scope.');
  }

  const targets = resolved.map((entry) => entry.target);
  const selectors = Array.from(new Set(resolved.flatMap((entry) => entry.selectors)));

  return {
    type: 'functionCall',
    targets,
    selectors
  };
};

export const useDelegationToolkit = () => {
  const environment = useMemo(() => getDeleGatorEnvironment(MONAD_TESTNET_CHAIN_ID, PREFERRED_VERSION), []);

  const createDelegationDraft = useCallback(
    async (delegator: string, delegate: string, allowedProtocols: string[]): Promise<DelegationDraft> => {
      const scope = buildScope(allowedProtocols);
      const delegatorAddress = normalizeAddress(delegator);
      const delegateAddress = normalizeAddress(delegate);
      const delegation = createDelegation({
        environment,
        scope,
        from: delegatorAddress,
        to: delegateAddress,
        salt: randomSalt()
      });

      const draft: DelegationDraft = {
        delegator: delegatorAddress,
        delegate: delegateAddress,
        allowedProtocols,
        createdAt: new Date().toISOString(),
        scope,
        delegation
      };

      console.info('[DelegationToolkit] delegation created', {
        delegator: draft.delegator,
        delegate: draft.delegate,
        scope: draft.scope,
        caveats: delegation.caveats.length,
        salt: delegation.salt
      });

      return draft;
    },
    [environment]
  );

  return { createDelegation: createDelegationDraft };
};
