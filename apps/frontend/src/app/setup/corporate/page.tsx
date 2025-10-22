'use client';

import { AppShell } from '@/components/layout/AppShell';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';

export default function CorporateSetupPage() {
  usePageTitle('Corporate Setup');
  return (
    <AppShell>
      <div className="py-12 px-4">
        <div className="max-w-2xl w-full mx-auto text-center space-y-8">
          <div className="text-6xl mb-6">🏢</div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Corporate Mode
          </h1>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8">
            <p className="text-xl text-amber-200 mb-4">
              🚧 Coming Soon
            </p>
            <p className="text-gray-300 mb-6">
              Corporate mode with multi-signature security and ERC-4337 smart accounts is currently under development.
            </p>
            <p className="text-sm text-gray-400">
              For organizations managing over $100,000
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-3">✨ Features</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Multi-signature security</li>
                <li>• ERC-4337 smart account</li>
                <li>• Advanced governance</li>
                <li>• Compliance features</li>
                <li>• Role-based access control</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-3">📋 Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Portfolio value &gt; $100,000</li>
                <li>• Multiple signers (2-5)</li>
                <li>• Gas fees: ~$50-100</li>
                <li>• Smart contract deployment</li>
                <li>• Setup time: ~15-20 minutes</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/wizard"
              className="rounded-full border border-white/20 px-8 py-3 text-base font-medium text-muted transition hover:border-primary hover:text-white"
            >
              ← Back to Mode Selection
            </Link>
            <Link
              href="/setup/simple"
              className="rounded-full bg-primary px-8 py-3 text-base font-medium text-white transition hover:bg-primary/90"
            >
              Try Simple Mode Instead →
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-8">
            Want to be notified when Corporate mode launches?{' '}
            <a href="mailto:hello@aicetro.com" className="text-primary hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
