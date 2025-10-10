"use client";

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const ConnectWalletButton = () => {
  const { isConnected } = useAccount();

  if (isConnected) {
    return (
      <Link
        href="/wizard"
        className="rounded-full bg-primary-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-400"
      >
        Setup Your Treasury →
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            onClick={openConnectModal}
            className="rounded-full bg-primary-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-400"
          >
            Connect Wallet to Get Started
          </button>
        )}
      </ConnectButton.Custom>
      <Link
        href="#how-it-works"
        className="rounded-full border border-white/20 px-8 py-3 text-base font-medium text-slate-200 transition hover:border-primary-400 hover:text-white"
      >
        Learn More
      </Link>
    </div>
  );
};
