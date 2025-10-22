'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export function DemoModeBanner() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <strong className="text-amber-200 font-semibold">Demo Mode</strong>
          <p className="text-sm text-amber-200/80 mt-1">
            You're viewing demo data. {' '}
            <Link 
              href="/wizard" 
              className="underline hover:text-amber-100 transition"
            >
              Create delegation
            </Link>
            {' '}to see your real portfolio data.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RealModeBanner({ address }: { address: string }) {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm text-emerald-200">
          <strong className="font-semibold">Real Mode</strong> — Connected to {shortAddress}
        </span>
      </div>
    </div>
  );
}
