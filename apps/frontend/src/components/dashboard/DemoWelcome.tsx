"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';

const ConnectWalletButton = dynamic(
  () => import('./ConnectWalletButton').then((mod) => ({ default: mod.ConnectWalletButton })),
  { 
    ssr: false,
    loading: () => (
      <div className="rounded-full bg-primary-500/50 px-8 py-3 text-base font-semibold text-white">
        Loading...
      </div>
    )
  }
);

export const DemoWelcome = () => {

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 via-slate-900/50 to-slate-900/80 p-8 md:p-12">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-400/30 bg-primary-400/10 px-4 py-2 text-sm font-medium text-primary-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
            </span>
            DEMO MODE
          </div>
          
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            Welcome to AIcetro Dashboard
          </h1>
          
          <p className="text-lg text-slate-300 md:text-xl">
            You&apos;re viewing a <span className="font-semibold text-white">simulated treasury</span> with demo data. 
            Explore the full interface safely before connecting your wallet.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <ConnectWalletButton />
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-primary-500/20 to-transparent blur-3xl"></div>
      </div>

      {/* What Happens When You Connect */}
      <div id="how-it-works" className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
            👁️
          </div>
          <h3 className="text-xl font-semibold text-white">Step 1: Connect & View</h3>
          <p className="text-sm text-slate-400">
            Connect your wallet to <strong className="text-slate-300">view your real balances</strong>. 
            This is read-only and completely safe - no permissions needed yet.
          </p>
          <div className="pt-2 text-xs text-emerald-400">
            ✓ Read-only access • No risk
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
            ⚙️
          </div>
          <h3 className="text-xl font-semibold text-white">Step 2: Setup (Optional)</h3>
          <p className="text-sm text-slate-400">
            Create a <strong className="text-slate-300">Smart Account</strong> (~$0.50 gas) and 
            set YOUR rules: spending limits, protocol whitelist, risk thresholds.
          </p>
          <div className="pt-2 text-xs text-amber-400">
            ⚠️ Requires transaction • Your choice
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
            🤖
          </div>
          <h3 className="text-xl font-semibold text-white">Step 3: AI Manages</h3>
          <p className="text-sm text-slate-400">
            AI executes <strong className="text-slate-300">within YOUR constraints</strong>. 
            You keep emergency stop control and full transparency.
          </p>
          <div className="pt-2 text-xs text-primary-400">
            ✓ Guardrails enforced • You control
          </div>
        </div>
      </div>

      {/* Security Guarantees */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8">
        <h3 className="mb-6 text-2xl font-bold text-white">🔒 Security Guarantees</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Non-Custodial</div>
              <div className="text-sm text-slate-400">You own and control your funds at all times</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Enforced Guardrails</div>
              <div className="text-sm text-slate-400">AI cannot exceed your defined limits</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Emergency Stop</div>
              <div className="text-sm text-slate-400">Pause AI operations instantly anytime</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Full Transparency</div>
              <div className="text-sm text-slate-400">All actions recorded on-chain with reasoning</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Monad Testnet</div>
              <div className="text-sm text-slate-400">Try risk-free with testnet tokens first</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 text-emerald-400">✓</div>
            <div>
              <div className="font-semibold text-white">Open Source</div>
              <div className="text-sm text-slate-400">Verify the code and smart contracts yourself</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Dashboard Info */}
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📊</div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-white">Interactive Demo Dashboard Below</h3>
            <p className="text-sm text-slate-400">
              Scroll down to explore the full interface with simulated data. See portfolio overview, 
              AI recommendations, risk analysis, and more. Everything works exactly like it will with your real treasury.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
