"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSDK } from '@metamask/sdk-react';
import type { DelegationConfig } from '@defitreasuryai/types';
import { encodeFunctionData, type Hex } from 'viem';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import { apiClient } from '../../lib/api';
import { useDelegations } from '../../hooks/useDelegations';
import { DEMO_AI_DELEGATE, DEMO_PROTOCOLS } from '../../config/demo';
import { TRUSTLESS_TREASURY_ADDRESS, trustlessTreasuryAbi } from '../../config/contracts';
import { useDelegationToolkit, type DelegationDraft, PROTOCOL_REGISTRY } from '../../hooks/useDelegation';

const steps = [
  'Create the smart account',
  'Multisig policies',
  'AI delegation',
  'Risk parameters',
  'Protocol whitelist'
];

const DEFAULT_DELEGATION_VALIDITY_SECONDS = 7 * 24 * 60 * 60;

const waitForTransactionReceipt = async (
  provider: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> },
  txHash: string,
  timeoutMs = 60_000,
  intervalMs = 1_500
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const receipt = await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      if (receipt && typeof receipt === 'object' && receipt !== null && 'blockNumber' in receipt) {
        return;
      }
    } catch (error) {
      console.warn('[Delegation] waiting for tx receipt failed, retrying', error);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('Transaction confirmation timeout');
};

const ensureOwnerList = (source?: string[]): string[] => {
  const base = Array.isArray(source) && source.length > 0 ? [...source] : ['', '', ''];
  while (base.length < 3) {
    base.push('');
  }
  return base.slice(0, 3).map((owner) => (typeof owner === 'string' ? owner : ''));
};

export const CorporateSetupWizard = () => {
  const [step, setStep] = useState(0);
  const {
    account,
    createCorporateAccount,
    connectWallet,
    disconnectWallet,
    connectedEOA,
    isConnected,
    isConnecting,
    isLoading,
    error,
    updateOwners,
    updateThreshold,
    updateAgentName
  } = useSmartAccount();
  const { sdk } = useSDK();
  const { createDelegation } = useDelegationToolkit();
  const [owners, setOwners] = useState<string[]>(() => ensureOwnerList(account.owners));
  const [threshold, setThresholdState] = useState<number>(account.threshold ?? 2);
  const { delegations, refresh } = useDelegations(account.address);
  const availableProtocols = useMemo(() => {
    const registry = new Set<string>(DEMO_PROTOCOLS);
    delegations.forEach((config) => {
      config.allowedProtocols?.forEach((protocol) => registry.add(protocol));
    });
    return Array.from(registry);
  }, [delegations]);
  const [delegate, setDelegate] = useState<string>(account.aiAgentAddress ?? DEMO_AI_DELEGATE);
  const [agentName, setAgentNameState] = useState<string>(account.aiAgentName ?? '');
  const [dailyLimit, setDailyLimit] = useState<number>(10_000);
  const [maxRiskScore, setMaxRiskScore] = useState<number>(3);
  const [whitelist, setWhitelist] = useState<string[]>(() => [...DEMO_PROTOCOLS]);
  const [delegationConfig, setDelegationConfig] = useState<DelegationConfig | null>(null);
  const [isSavingDelegation, setIsSavingDelegation] = useState(false);
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const [delegationSuccess, setDelegationSuccess] = useState<string | null>(null);
  const [delegationDraft, setDelegationDraft] = useState<DelegationDraft | null>(null);
  const [delegationSignature, setDelegationSignature] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [isSigningDelegation, setIsSigningDelegation] = useState(false);
  const [isRevokingDelegation, setIsRevokingDelegation] = useState(false);
  const [isPausingDelegation, setIsPausingDelegation] = useState(false);
  const [isResumingDelegation, setIsResumingDelegation] = useState(false);

  const handleOwnerChange = (index: number, value: string) => {
    setOwners((prev) => {
      const next = ensureOwnerList(prev);
      if (index >= 0 && index < next.length) {
        next[index] = value;
        updateOwners(next);
      }
      return next;
    });
  };

  const handleThresholdChange = (value: number) => {
    const normalized = Number.isFinite(value) ? Math.max(2, Math.min(owners.length, value)) : 2;
    setThresholdState(normalized);
    updateThreshold(normalized);
  };

  useEffect(() => {
    if (!delegations.length) {
      setDelegationConfig(null);
      setDelegationDraft(null);
      setDelegationSignature(null);
      return;
    }
    const primary = delegations[0];
    setDelegationConfig(primary);
    setDelegate(primary.delegate);
    const parsedLimit = Number.parseFloat(primary.dailyLimit);
    setDailyLimit(Number.isFinite(parsedLimit) ? parsedLimit : 10_000);
    setMaxRiskScore(typeof primary.maxRiskScore === 'number' ? primary.maxRiskScore : 3);
    setWhitelist(primary.allowedProtocols?.length ? primary.allowedProtocols : [...DEMO_PROTOCOLS]);
    setDelegationDraft(null);
    setDelegationSignature(null);
    setSignatureError(null);
  }, [delegations]);

  const toggleProtocol = (protocol: string) => {
    setWhitelist((prev) => (prev.includes(protocol) ? prev.filter((item) => item !== protocol) : [...prev, protocol]));
  };

  useEffect(() => {
    if (!account.owners.length) return;
    setOwners((prev) => {
      const next = ensureOwnerList(account.owners);
      const unchanged = next.every((owner, index) => owner === prev[index]);
      if (unchanged) {
        return prev;
      }
      return next;
    });
  }, [account.owners]);

  useEffect(() => {
    if (typeof account.threshold === 'number' && Number.isFinite(account.threshold)) {
      setThresholdState(account.threshold);
    }
  }, [account.threshold]);

  useEffect(() => {
    if (typeof account.aiAgentAddress === 'string' && account.aiAgentAddress !== '') {
      setDelegate(account.aiAgentAddress);
    }
  }, [account.aiAgentAddress]);

  useEffect(() => {
    if (typeof account.aiAgentName === 'string') {
      setAgentNameState(account.aiAgentName);
    }
  }, [account.aiAgentName]);

  useEffect(() => {
    if (!connectedEOA) return;
    setOwners((prev) => {
      const next = ensureOwnerList(prev);
      if (next[0]?.toLowerCase() === connectedEOA) {
        return prev;
      }
      next[0] = connectedEOA;
      updateOwners(next);
      return next;
    });
  }, [connectedEOA, updateOwners]);

  const handleSaveDelegation = async () => {
    if (!account.address) {
      setDelegationError('Create the corporate account first.');
      return;
    }

    const trimmedAgentName = agentName.trim();
    if (trimmedAgentName.length === 0) {
      setDelegationError('Provide a name for your AI agent.');
      return;
    }

    const normalizedAccount = account.address.toLowerCase();
    const resolvedDelegate = (account.aiAgentAddress ?? delegate).toLowerCase();
    const isHexAddress = /^0x[a-f0-9]{40}$/;

    if (!isHexAddress.test(resolvedDelegate)) {
      setDelegationError('AI agent address is invalid.');
      return;
    }

    if (!isHexAddress.test(normalizedAccount)) {
      setDelegationError('Corporate account address is invalid.');
      return;
    }

    if (Number.isNaN(dailyLimit) || dailyLimit <= 0) {
      setDelegationError('Daily limit must be a positive number.');
      return;
    }

    if (whitelist.length === 0) {
      setDelegationError('Select at least one protocol for the whitelist.');
      return;
    }

    setIsSavingDelegation(true);
    setIsSigningDelegation(false);
    setDelegationError(null);
    setDelegationSuccess(null);
    setSignatureError(null);
    setDelegationDraft(null);
    setDelegationSignature(null);

    try {
      if (!TRUSTLESS_TREASURY_ADDRESS || TRUSTLESS_TREASURY_ADDRESS.trim() === '') {
        setDelegationError('TRUSTLESS_TREASURY_ADDRESS is missing. Define the contract address in the environment.');
        return;
      }

      const provider = sdk?.getProvider?.();
      if (!provider || typeof provider.request !== 'function') {
        setDelegationError('MetaMask provider unavailable. Connect your wallet and retry.');
        return;
      }

      const registryEntries = whitelist.map((name) => PROTOCOL_REGISTRY[name]).filter((entry): entry is { target: Hex; selectors: `0x${string}`[] } => entry != null);
      if (registryEntries.length !== whitelist.length) {
        setDelegationError('Some selected protocols are not supported by the registry.');
        return;
      }

      const protocolTargets = registryEntries.map((entry) => entry.target);
      const normalizedLimit = Math.round(dailyLimit);
      const validitySeconds = DEFAULT_DELEGATION_VALIDITY_SECONDS;
      const validUntil = Math.floor(Date.now() / 1000) + validitySeconds;
      const hasExistingDelegation = delegationConfig?.delegate?.toLowerCase() === resolvedDelegate;

      const encodedCall = encodeFunctionData({
        abi: trustlessTreasuryAbi,
        functionName: hasExistingDelegation ? 'updateDelegation' : 'grantDelegation',
        args: hasExistingDelegation
          ? [BigInt(normalizedLimit), protocolTargets, BigInt(validUntil)]
          : [resolvedDelegate as Hex, BigInt(normalizedLimit), protocolTargets, BigInt(validUntil)]
      });

      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: normalizedAccount,
            to: TRUSTLESS_TREASURY_ADDRESS,
            data: encodedCall,
            value: '0x0'
          }
        ]
      });

      const txHashString = typeof transactionHash === 'string' ? transactionHash : undefined;

      if (txHashString) {
        try {
          await waitForTransactionReceipt(provider, txHashString);
        } catch (receiptError) {
          console.warn('[Delegation] transaction confirmation timeout', receiptError);
        }
      }

      updateAgentName(trimmedAgentName);

      const response = await apiClient.configureDelegation({
        account: normalizedAccount,
        delegate: resolvedDelegate,
        dailyLimitUsd: normalizedLimit,
        whitelist,
        maxRiskScore,
        agentName: trimmedAgentName
      });

      const fallbackValidUntil = new Date(validUntil * 1000).toISOString();
      const nextConfig: DelegationConfig = {
        ...response,
        validUntil: response.validUntil ?? fallbackValidUntil,
        active: response.active ?? true,
        remainingDailyLimit: response.remainingDailyLimit ?? Math.max(normalizedLimit - (Number.parseFloat(response.spent24h) || 0), 0).toFixed(0)
      };

      setDelegationConfig(nextConfig);
      setDelegate(nextConfig.delegate);
      setAgentNameState(trimmedAgentName);
      const parsedLimit = Number.parseFloat(nextConfig.dailyLimit);
      setDailyLimit(Number.isFinite(parsedLimit) ? parsedLimit : dailyLimit);
      setMaxRiskScore(nextConfig.maxRiskScore);
      setWhitelist(nextConfig.allowedProtocols);

      setDelegationSuccess(
        txHashString != null
          ? `Delegation updated on-chain. Tx: ${txHashString}`
          : 'Delegation parameters stored on-chain.'
      );

      const draft = await createDelegation(normalizedAccount, resolvedDelegate, whitelist);
      setDelegationDraft(draft);

      const typedData = (draft.delegation as any)?.typedData;

      if (typedData) {
        setIsSigningDelegation(true);
        try {
          const signer = connectedEOA ?? normalizedAccount;
          const payload = typeof typedData === 'string' ? typedData : JSON.stringify(typedData);
          const signature = await provider.request({
            method: 'eth_signTypedData_v4',
            params: [signer, payload]
          });
          if (typeof signature === 'string') {
            setDelegationSignature(signature);
            setDelegationSuccess(
              txHashString != null
                ? `Delegation updated (tx: ${txHashString}) and signed in MetaMask.`
                : 'Delegation parameters signed in MetaMask.'
            );
          } else if (signature != null) {
            setDelegationSignature(JSON.stringify(signature));
          }
        } catch (signatureErr) {
          console.warn('[Delegation] signature failed', signatureErr);
          setSignatureError('MetaMask signature failed. Check the wallet window.');
        } finally {
          setIsSigningDelegation(false);
        }
      } else if (!connectedEOA) {
      setSignatureError('Connect MetaMask to sign the delegation locally.');
      }

      await refresh();
    } catch (saveError) {
      console.error(saveError);
      setDelegationError('Failed to save delegation, please try again.');
      setDelegationDraft(null);
      setDelegationSignature(null);
    } finally {
      setIsSavingDelegation(false);
      setIsSigningDelegation(false);
    }
  };

  const handleRevokeDelegation = async () => {
    if (!account.address) {
      setDelegationError('No corporate account available to revoke delegation.');
      return;
    }
    if (!TRUSTLESS_TREASURY_ADDRESS || TRUSTLESS_TREASURY_ADDRESS.trim() === '') {
      setDelegationError('TRUSTLESS_TREASURY_ADDRESS is missing.');
      return;
    }

    const provider = sdk?.getProvider?.();
    if (!provider || typeof provider.request !== 'function') {
      setDelegationError('MetaMask provider unavailable.');
      return;
    }

    setIsRevokingDelegation(true);
    setDelegationError(null);
    setDelegationSuccess(null);

    try {
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account.address.toLowerCase(),
            to: TRUSTLESS_TREASURY_ADDRESS,
            data: encodeFunctionData({ abi: trustlessTreasuryAbi, functionName: 'revokeDelegation', args: [] }),
            value: '0x0'
          }
        ]
      });

      const txHashString = typeof txHash === 'string' ? txHash : undefined;

      if (txHashString) {
        try {
          await waitForTransactionReceipt(provider, txHashString);
        } catch (receiptError) {
          console.warn('[Delegation] revoke confirmation timeout', receiptError);
        }
      }

      setDelegationSuccess(txHashString ? `Delegation revoked. Tx: ${txHashString}` : 'Delegation revoked.');
      setDelegationSignature(null);
      setDelegationDraft(null);
      setDelegationConfig(null);
      await refresh();
    } catch (error) {
      console.error('[Delegation] revoke failed', error);
      setDelegationError('Failed to revoke delegation. Check MetaMask.');
    } finally {
      setIsRevokingDelegation(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!account.address) {
      setDelegationError('No corporate account available for emergency stop.');
      return;
    }
    if (!TRUSTLESS_TREASURY_ADDRESS || TRUSTLESS_TREASURY_ADDRESS.trim() === '') {
      setDelegationError('TRUSTLESS_TREASURY_ADDRESS is missing.');
      return;
    }

    const provider = sdk?.getProvider?.();
    if (!provider || typeof provider.request !== 'function') {
      setDelegationError('MetaMask provider unavailable.');
      return;
    }

    setIsPausingDelegation(true);
    setDelegationError(null);
    setDelegationSuccess(null);

    try {
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account.address.toLowerCase(),
            to: TRUSTLESS_TREASURY_ADDRESS,
            data: encodeFunctionData({ abi: trustlessTreasuryAbi, functionName: 'emergencyStop', args: [] }),
            value: '0x0'
          }
        ]
      });

      const txHashString = typeof txHash === 'string' ? txHash : undefined;

      if (txHashString) {
        try {
          await waitForTransactionReceipt(provider, txHashString);
        } catch (receiptError) {
          console.warn('[Delegation] emergency stop confirmation timeout', receiptError);
        }
      }

      setDelegationSuccess(txHashString ? `Emergency stop executed. Tx: ${txHashString}` : 'Emergency stop executed.');
      setDelegationConfig((prev) => (prev ? { ...prev, active: false } : prev));
      await refresh();
    } catch (error) {
      console.error('[Delegation] emergency stop failed', error);
      setDelegationError('Failed to execute emergency stop.');
    } finally {
      setIsPausingDelegation(false);
    }
  };

  const handleEmergencyResume = async () => {
    if (!account.address) {
      setDelegationError('No corporate account available to resume delegation.');
      return;
    }
    if (!TRUSTLESS_TREASURY_ADDRESS || TRUSTLESS_TREASURY_ADDRESS.trim() === '') {
      setDelegationError('TRUSTLESS_TREASURY_ADDRESS is missing.');
      return;
    }

    const provider = sdk?.getProvider?.();
    if (!provider || typeof provider.request !== 'function') {
      setDelegationError('MetaMask provider unavailable.');
      return;
    }

    setIsResumingDelegation(true);
    setDelegationError(null);
    setDelegationSuccess(null);

    try {
      const validUntil = Math.floor(Date.now() / 1000) + DEFAULT_DELEGATION_VALIDITY_SECONDS;
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account.address.toLowerCase(),
            to: TRUSTLESS_TREASURY_ADDRESS,
            data: encodeFunctionData({
              abi: trustlessTreasuryAbi,
              functionName: 'resumeDelegation',
              args: [BigInt(validUntil)]
            }),
            value: '0x0'
          }
        ]
      });

      const txHashString = typeof txHash === 'string' ? txHash : undefined;

      if (txHashString) {
        try {
          await waitForTransactionReceipt(provider, txHashString);
        } catch (receiptError) {
          console.warn('[Delegation] resume confirmation timeout', receiptError);
        }
      }

      const fallbackValidUntil = new Date(validUntil * 1000).toISOString();
      setDelegationConfig((prev) => (prev ? { ...prev, active: true, validUntil: fallbackValidUntil } : prev));
      setDelegationSuccess(txHashString ? `Delegation resumed. Tx: ${txHashString}` : 'Delegation resumed.');
      await refresh();
    } catch (error) {
      console.error('[Delegation] emergency resume failed', error);
      setDelegationError('Failed to resume delegation.');
    } finally {
      setIsResumingDelegation(false);
    }
  };

  return (
    <div className="glass-card space-y-6 p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-slate-400">Step {step + 1} of {steps.length}</p>
        <h2 className="text-2xl font-semibold text-white">{steps[step]}</h2>
      </header>
      <WalletBanner
        isConnected={isConnected}
        isConnecting={isConnecting}
        connectedEOA={connectedEOA}
        accountAddress={account.address}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />
      <WizardStepper currentStep={step} />
      <WizardContent
        step={step}
        createCorporateAccount={createCorporateAccount}
        account={account}
        isLoading={isLoading}
        error={error}
        owners={owners}
        threshold={threshold}
        onOwnerChange={handleOwnerChange}
        onThresholdChange={handleThresholdChange}
        delegate={delegate}
        agentName={agentName}
        onAgentNameChange={(value) => {
          setAgentNameState(value);
          updateAgentName(value);
        }}
        dailyLimit={dailyLimit}
        onDailyLimitChange={setDailyLimit}
        maxRiskScore={maxRiskScore}
        onMaxRiskScoreChange={setMaxRiskScore}
        whitelist={whitelist}
        onWhitelistToggle={toggleProtocol}
        availableProtocols={availableProtocols}
        onSaveDelegation={handleSaveDelegation}
        isSavingDelegation={isSavingDelegation}
        delegationSuccess={delegationSuccess}
        delegationError={delegationError}
        delegationConfig={delegationConfig}
        connectedEOA={connectedEOA}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isSigningDelegation={isSigningDelegation}
        delegationDraft={delegationDraft}
        delegationSignature={delegationSignature}
        signatureError={signatureError}
        onRevokeDelegation={handleRevokeDelegation}
        onEmergencyStop={handleEmergencyStop}
        onEmergencyResume={handleEmergencyResume}
        isRevokingDelegation={isRevokingDelegation}
        isPausingDelegation={isPausingDelegation}
        isResumingDelegation={isResumingDelegation}
      />
      <footer className="flex justify-between">
        <button
          type="button"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200"
          disabled={step === 0}
          onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white"
          onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
        >
          {step === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </footer>
    </div>
  );
};

const WalletBanner = ({
  isConnected,
  isConnecting,
  connectedEOA,
  accountAddress,
  onConnect,
  onDisconnect
}: {
  isConnected: boolean;
  isConnecting: boolean;
  connectedEOA?: string | null;
  accountAddress?: string;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="font-semibold text-slate-100">MetaMask connection</p>
        <p className="text-[11px] text-slate-400">
          {isConnected
            ? `Active signer: ${connectedEOA}`
            : 'MetaMask is disconnected. Connect to auto-fill owners and sign delegations.'}
        </p>
        {accountAddress ? (
          <p className="text-[11px] text-emerald-300">Corporate smart account: {accountAddress}</p>
        ) : (
          <p className="text-[11px] text-slate-400">Corporate account is not created yet.</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          const action = isConnected ? onDisconnect() : onConnect();
          void Promise.resolve(action).catch(() => {
            /* handled inside hook */
          });
        }}
        disabled={isConnecting}
        className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
          isConnected
            ? 'border border-rose-400/40 text-rose-200 hover:border-rose-300/70'
            : 'border border-primary-400/40 text-primary-100 hover:border-primary-300/70'
        } disabled:opacity-40`}
      >
        {isConnecting ? 'Waiting for MetaMask…' : isConnected ? 'Disconnect' : 'Connect MetaMask'}
      </button>
    </div>
  </div>
);

const WizardStepper = ({ currentStep }: { currentStep: number }) => (
  <div className="flex flex-wrap gap-2">
    {steps.map((title, index) => (
      <div
        key={title}
        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
          index <= currentStep ? 'border-primary-400 bg-primary-500/10 text-primary-100' : 'border-white/10 text-slate-400'
        }`}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10">
          {index + 1}
        </span>
        {title}
      </div>
    ))}
  </div>
);

const WizardContent = ({
  step,
  createCorporateAccount,
  account,
  isLoading,
  error,
  owners,
  threshold,
  onOwnerChange,
  onThresholdChange,
  delegate,
  agentName,
  onAgentNameChange,
  dailyLimit,
  onDailyLimitChange,
  maxRiskScore,
  onMaxRiskScoreChange,
  whitelist,
  onWhitelistToggle,
  availableProtocols,
  onSaveDelegation,
  isSavingDelegation,
  delegationSuccess,
  delegationError,
  delegationConfig,
  connectedEOA,
  isConnected,
  isConnecting,
  isSigningDelegation,
  delegationDraft,
  delegationSignature,
  signatureError,
  onRevokeDelegation,
  onEmergencyStop,
  onEmergencyResume,
  isRevokingDelegation,
  isPausingDelegation,
  isResumingDelegation
}: {
  step: number;
  createCorporateAccount: (owners: string[], threshold?: number, agentName?: string) => Promise<void> | void;
  account: { address?: string; owners: string[]; threshold: number; aiAgentAddress?: string; aiAgentName?: string };
  isLoading: boolean;
  error: string | null;
  owners: string[];
  threshold: number;
  onOwnerChange: (index: number, value: string) => void;
  onThresholdChange: (threshold: number) => void;
  delegate: string;
  agentName: string;
  onAgentNameChange: (value: string) => void;
  dailyLimit: number;
  onDailyLimitChange: (value: number) => void;
  maxRiskScore: number;
  onMaxRiskScoreChange: (value: number) => void;
  whitelist: string[];
  onWhitelistToggle: (protocol: string) => void;
  availableProtocols: string[];
  onSaveDelegation: () => void;
  isSavingDelegation: boolean;
  delegationSuccess: string | null;
  delegationError: string | null;
  delegationConfig: DelegationConfig | null;
  connectedEOA?: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isSigningDelegation: boolean;
  delegationDraft: DelegationDraft | null;
  delegationSignature: string | null;
  signatureError: string | null;
  onRevokeDelegation: () => void | Promise<void>;
  onEmergencyStop: () => void | Promise<void>;
  onEmergencyResume: () => void | Promise<void>;
  isRevokingDelegation: boolean;
  isPausingDelegation: boolean;
  isResumingDelegation: boolean;
}) => {
  switch (step) {
    case 0: {
      const trimmedOwners = owners.map((owner) => owner.trim());
      const isValid = trimmedOwners.every((owner) => owner.startsWith('0x') && owner.length >= 10);
      return (
        <WizardCard
          title="Smart account initialisation"
          description="Connect MetaMask, review owner set, and prepare the corporate account."
        >
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {owners.map((owner, index) => (
                <label key={index} className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Owner {index + 1}
                  <input
                    value={owner}
                    onChange={(event) => onOwnerChange(index, event.target.value)}
                    placeholder="0x..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <label className="block w-full text-xs font-medium uppercase tracking-wide text-slate-300">
              Signature threshold (multisig)
              <input
                type="number"
                min={2}
                max={owners.length}
                value={threshold}
                onChange={(event) => onThresholdChange(Number(event.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
              />
            </label>

            <button
              type="button"
              onClick={() => createCorporateAccount(trimmedOwners, threshold)}
              disabled={isLoading || !isValid}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isLoading ? 'Provisioning…' : 'Create corporate smart account'}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {isConnected
              ? `Connected CFO wallet: ${connectedEOA}`
              : 'Connect MetaMask (panel above) to autofill the CFO signer and sign delegations.'}
          </p>
          {account.address && (
            <p className="mt-3 text-xs text-emerald-400">Provisioned account: {account.address}</p>
          )}
          {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
          {isConnecting && <p className="mt-2 text-xs text-amber-300">Awaiting MetaMask confirmation…</p>}
        </WizardCard>
      );
    }
    case 1:
      return (
        <WizardCard
          title="Multisig policies"
          description="Review the owner quorum and confirm the 2-of-3 approval policy."
        >
          <ul className="space-y-2 text-sm text-slate-200">
            {owners.map((owner, index) => (
              <li key={index} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="font-medium text-primary-200">Owner {index + 1}</span>
                <span className="font-mono text-xs text-slate-300">{owner || '—'}</span>
              </li>
            ))}
            <li className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
              <span className="font-medium text-primary-200">Threshold</span>
              <span className="font-mono text-xs text-slate-300">{threshold}-of-{owners.length}</span>
            </li>
          </ul>
        </WizardCard>
      );
    case 2: {
      const isDelegationTxPending =
        isSavingDelegation ||
        isSigningDelegation ||
        isRevokingDelegation ||
        isPausingDelegation ||
        isResumingDelegation;

      return (
        <WizardCard title="AI delegation" description="Name your AI agent and define the execution guardrails.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
              AI agent name
              <input
                value={agentName}
                onChange={(event) => onAgentNameChange(event.target.value)}
                placeholder="Treasury copilot"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
              Daily limit, USD
              <input
                type="number"
                min={100}
                step={100}
                value={dailyLimit}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  onDailyLimitChange(Number.isFinite(nextValue) ? nextValue : 0);
                }}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
            <p className="font-medium text-primary-100">Auto-generated agent address</p>
            <p className="mt-2 font-mono text-[11px] text-slate-200">
              {delegate || 'AI agent address will be generated after account provisioning'}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              The platform issues a dedicated smart account for this treasury. You only need to provide the agent name.
            </p>
          </div>

          {delegationConfig && (
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
              <p className="font-medium text-primary-100">Current configuration</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <span>Daily limit: ${delegationConfig.dailyLimit}</span>
                <span>Spent in 24h: ${delegationConfig.spent24h}</span>
                <span>Max risk score: {delegationConfig.maxRiskScore}</span>
                <span>Updated: {new Date(delegationConfig.updatedAt).toLocaleString()}</span>
                {delegationConfig.remainingDailyLimit != null ? (
                  <span>Remaining: ${delegationConfig.remainingDailyLimit}</span>
                ) : null}
                {delegationConfig.validUntil ? (
                  <span>Valid until: {new Date(delegationConfig.validUntil).toLocaleString()}</span>
                ) : null}
                <span>
                  Status:{' '}
                  {delegationConfig.active === false ? (
                    <span className="text-rose-300">paused</span>
                  ) : (
                    <span className="text-emerald-300">active</span>
                  )}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRevokeDelegation}
                  disabled={isDelegationTxPending}
                  className="rounded-lg border border-rose-500/60 px-4 py-2 text-xs font-semibold text-rose-200 hover:border-rose-400 disabled:opacity-50"
                >
                  {isRevokingDelegation ? 'Revoking…' : 'Revoke delegation'}
                </button>
                <button
                  type="button"
                  onClick={onEmergencyStop}
                  disabled={isDelegationTxPending || delegationConfig.active === false}
                  className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold text-amber-200 hover:border-amber-400 disabled:opacity-50"
                >
                  {isPausingDelegation ? 'Pausing…' : 'Emergency stop'}
                </button>
                <button
                  type="button"
                  onClick={onEmergencyResume}
                  disabled={isDelegationTxPending || delegationConfig.active !== false}
                  className="rounded-lg border border-emerald-500/60 px-4 py-2 text-xs font-semibold text-emerald-200 hover:border-emerald-400 disabled:opacity-50"
                >
                  {isResumingDelegation ? 'Resuming…' : 'Resume'}
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onSaveDelegation}
            disabled={isDelegationTxPending || !account.address}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSavingDelegation
              ? 'Saving…'
              : isSigningDelegation
                ? 'Awaiting signature…'
                : isRevokingDelegation
                  ? 'Revoking…'
                  : isPausingDelegation
                    ? 'Emergency stop…'
                    : isResumingDelegation
                      ? 'Resuming…'
                      : 'Save delegation'}
          </button>

          {!account.address && (
            <p className="text-xs text-amber-300">Create the corporate account on step 1 before configuring delegation.</p>
          )}

          <DelegationStatus
            success={delegationSuccess}
            error={delegationError}
            signature={delegationSignature}
            signatureError={signatureError}
            isSigning={isSigningDelegation}
          />

          <DelegationSignaturePreview draft={delegationDraft} signature={delegationSignature} isSigning={isSigningDelegation} />
        </WizardCard>
      );
    }
    case 3:
      const isRiskTxPending =
        isSavingDelegation ||
        isSigningDelegation ||
        isRevokingDelegation ||
        isPausingDelegation ||
        isResumingDelegation;
      return (
        <WizardCard
          title="Risk parameters"
          description="Tune the maximum risk score your AI agent may operate within."
        >
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
            Maximum risk score
            <input
              type="range"
              min={1}
              max={5}
              value={maxRiskScore}
              onChange={(event) => onMaxRiskScoreChange(Number(event.target.value))}
              className="mt-2 w-full"
            />
          </label>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>1 — stable-only allocation</span>
            <span>5 — high-volatility strategies</span>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
            <p className="font-medium text-primary-100">Current value: {maxRiskScore}</p>
            <p className="mt-2">The agent cannot engage with protocols exceeding this risk score.</p>
          </div>

          <button
            type="button"
            onClick={onSaveDelegation}
            disabled={isRiskTxPending || !account.address}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSavingDelegation
              ? 'Saving…'
              : isSigningDelegation
                ? 'Awaiting signature…'
                : isRevokingDelegation
                  ? 'Revoking…'
                  : isPausingDelegation
                    ? 'Emergency stop…'
                    : isResumingDelegation
                      ? 'Resuming…'
                      : 'Save risk guardrail'}
          </button>

          <DelegationStatus
            success={delegationSuccess}
            error={delegationError}
            signature={delegationSignature}
            signatureError={signatureError}
            isSigning={isSigningDelegation}
          />
        </WizardCard>
      );
    case 4:
      const isWhitelistTxPending =
        isSavingDelegation ||
        isSigningDelegation ||
        isRevokingDelegation ||
        isPausingDelegation ||
        isResumingDelegation;
      return (
        <WizardCard title="Protocol whitelist" description="Select Monad protocols that the agent is allowed to access.">
          <div className="flex flex-wrap gap-2">
            {availableProtocols.map((protocol) => {
              const selected = whitelist.includes(protocol);
              return (
                <button
                  key={protocol}
                  type="button"
                  onClick={() => onWhitelistToggle(protocol)}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    selected
                      ? 'border border-primary-500 bg-primary-500/20 text-primary-100'
                      : 'border border-white/10 text-slate-300 hover:border-primary-400/70'
                  }`}
                >
                  {protocol}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">
            Save the whitelist to ensure the agent interacts only with audited protocols.
          </p>

          <button
            type="button"
            onClick={onSaveDelegation}
            disabled={isWhitelistTxPending || !account.address}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSavingDelegation
              ? 'Saving…'
              : isSigningDelegation
                ? 'Awaiting signature…'
                : isRevokingDelegation
                  ? 'Revoking…'
                  : isPausingDelegation
                    ? 'Emergency stop…'
                    : isResumingDelegation
                      ? 'Resuming…'
                      : 'Save whitelist'}
          </button>

          <DelegationStatus
            success={delegationSuccess}
            error={delegationError}
            signature={delegationSignature}
            signatureError={signatureError}
            isSigning={isSigningDelegation}
          />
        </WizardCard>
      );
    default:
      return null;
  }
};

const WizardCard = ({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
    {children}
  </div>
);

const DelegationStatus = ({
  success,
  error,
  signature,
  signatureError,
  isSigning
}: {
  success: string | null;
  error: string | null;
  signature: string | null;
  signatureError: string | null;
  isSigning: boolean;
}) => (
  <div className="space-y-1">
    {isSigning ? <p className="text-xs text-amber-300">Waiting for MetaMask signature…</p> : null}
    {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    {signature ? (
      <p className="text-[11px] text-primary-200">
        Signature: {signature.slice(0, 18)}…{signature.slice(-6)}
      </p>
    ) : null}
    {signatureError ? <p className="text-[11px] text-amber-300">{signatureError}</p> : null}
    {error ? <p className="text-xs text-rose-400">{error}</p> : null}
  </div>
);

const DelegationSignaturePreview = ({
  draft,
  signature,
  isSigning
}: {
  draft: DelegationDraft | null;
  signature: string | null;
  isSigning: boolean;
}) => {
  if (!draft) {
    return null;
  }

  const selectorCount = draft.scope.selectors.length;
  const targets = draft.scope.targets.length;

  return (
    <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
      <p className="font-medium text-primary-100">MetaMask Delegation Preview</p>
      <p>Delegator: <span className="font-mono text-[11px] text-slate-200">{draft.delegator}</span></p>
      <p>Delegate: <span className="font-mono text-[11px] text-slate-200">{draft.delegate}</span></p>
      <p>Scope: {targets} target(s), {selectorCount} permitted selectors</p>
      <p>Protocols: {draft.allowedProtocols.join(', ')}</p>
      {signature ? (
        <p className="text-[11px] text-primary-200">Signature stored: {signature.slice(0, 18)}…{signature.slice(-6)}</p>
      ) : isSigning ? null : (
        <p className="text-[11px] text-slate-400">Sign the typed data in MetaMask to finalise the delegation.</p>
      )}
    </div>
  );
};
