import Link from 'next/link';
import { useMemo } from 'react';
import type { ApplicationMode } from '@defitreasuryai/types';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import { useAppMode } from '../../hooks/useAppMode';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pools', label: 'Pools' },
  { href: '/wizard', label: 'Onboarding' },
  { href: '/ai-controls', label: 'AI Orchestration' },
  { href: '/emergency', label: 'Emergency' },
  { href: '/demo', label: 'Live Demo' }
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const {
    account,
    isConnected,
    isConnecting,
    connectedEOA,
    connectWallet,
    disconnectWallet
  } = useSmartAccount();
  const { mode, isSwitching, setMode } = useAppMode();

  const activeAccountLabel = useMemo(() => formatAddress(account.address), [account.address]);
  const connectedWalletLabel = useMemo(() => formatAddress(connectedEOA ?? undefined), [connectedEOA]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight text-white">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-elevated"
                style={{ background: 'var(--gradient-primary)' }}
              >
                AI
              </span>
              Aicetro
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ModeToggle mode={mode} isSwitching={isSwitching} onSwitch={setMode} />
            <WalletIndicator
              isConnected={isConnected}
              isConnecting={isConnecting}
              connectedWalletLabel={connectedWalletLabel}
              accountLabel={activeAccountLabel}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
};

const formatAddress = (value?: string) => {
  if (!value || value.length < 6) {
    return '—';
  }
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const WalletIndicator = ({
  isConnected,
  isConnecting,
  connectedWalletLabel,
  accountLabel,
  onConnect,
  onDisconnect
}: {
  isConnected: boolean;
  isConnecting: boolean;
  connectedWalletLabel: string;
  accountLabel: string;
  onConnect: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
}) => (
  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
    <div className="space-y-1 text-left">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">Corporate account</p>
      <p className="font-mono text-[12px] text-slate-200">{accountLabel}</p>
      <p className="text-[11px] text-slate-400">
        CFO Wallet: <span className="font-mono text-[12px] text-slate-200">{connectedWalletLabel}</span>
      </p>
    </div>
    <button
      type="button"
      onClick={() => {
        const action = isConnected ? onDisconnect() : onConnect();
        void Promise.resolve(action).catch(() => {
          /* swallow */
        });
      }}
      disabled={isConnecting}
      className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
        isConnected
          ? 'border border-rose-400/40 text-rose-200 hover:border-rose-300/70'
          : 'border border-primary-400/40 text-primary-100 hover:border-primary-300/70'
      } disabled:opacity-40`}
    >
      {isConnecting ? 'MetaMask…' : isConnected ? 'Disconnect' : 'Connect'}
    </button>
  </div>
);

const ModeToggle = ({
  mode,
  isSwitching,
  onSwitch
}: {
  mode: ApplicationMode;
  isSwitching: boolean;
  onSwitch: (mode: ApplicationMode) => Promise<void>;
}) => {
  console.log('[ModeToggle] Current mode:', mode, 'isSwitching:', isSwitching);
  
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-slate-300">
      <span className="uppercase tracking-wide text-slate-400">Mode</span>
      <button
        type="button"
        onClick={() => {
          console.log('[ModeToggle] Real Trading clicked, current mode:', mode);
          if (mode !== 'real') {
            console.log('[ModeToggle] Switching to real...');
            void onSwitch('real');
          }
        }}
        disabled={isSwitching || mode === 'real'}
        className={`rounded-full px-3 py-1 font-medium transition ${
          mode === 'real'
            ? 'bg-primary-500/20 text-primary-100'
            : 'text-slate-300 hover:text-white'
        } disabled:opacity-50`}
      >
        Real Trading
      </button>
      <button
        type="button"
        onClick={() => {
          console.log('[ModeToggle] Preview clicked, current mode:', mode);
          if (mode !== 'preview') {
            console.log('[ModeToggle] Switching to preview...');
            void onSwitch('preview');
          }
        }}
        disabled={isSwitching || mode === 'preview'}
        className={`rounded-full px-3 py-1 font-medium transition ${
          mode === 'preview'
            ? 'bg-amber-400/20 text-amber-100'
            : 'text-slate-300 hover:text-white'
        } disabled:opacity-50`}
      >
        Preview
      </button>
    </div>
  );
};
