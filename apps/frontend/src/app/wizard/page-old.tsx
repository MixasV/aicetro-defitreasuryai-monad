'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackGoal, GOALS } from '@/lib/yandex-metrika';

export default function WizardPage() {
  usePageTitle('AI Control');
  const router = useRouter();
  const [selected, setSelected] = useState<'simple' | 'corporate' | null>(null);

  return (
    <AppShell>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to AIcetro
          </h1>
          <p className="text-xl text-gray-400">
            Choose how you want to manage your treasury
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Simple Mode Card */}
          <button
            onClick={() => setSelected('simple')}
            className={`
              relative p-8 rounded-2xl border-2 text-left transition-all transform hover:scale-105
              ${selected === 'simple' 
                ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' 
                : 'border-white/20 bg-white/5 hover:border-primary/50'
              }
            `}
          >
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-3">Simple Mode</h3>
            <p className="text-gray-400 mb-6">
              Perfect for individual users managing under $100,000
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">2-minute setup</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">No smart contract deployment</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Direct wallet delegation</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Zero gas fees for setup</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Easy to revoke anytime</span>
              </li>
            </ul>

            {selected === 'simple' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  trackGoal(GOALS.SIMPLE_SETUP_STARTED, { source: 'wizard' });
                  router.push('/setup/simple');
                }}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Start Simple Setup →
              </button>
            )}
          </button>

          {/* Corporate Mode Card */}
          <button
            onClick={() => setSelected('corporate')}
            className={`
              relative p-8 rounded-2xl border-2 text-left transition-all transform hover:scale-105
              ${selected === 'corporate' 
                ? 'border-primary bg-primary/10 shadow-xl shadow-primary/20' 
                : 'border-white/20 bg-white/5 hover:border-primary/50'
              }
            `}
          >
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-white mb-3">Corporate Mode</h3>
            <p className="text-gray-400 mb-6">
              For organizations managing over $100,000
            </p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Multi-signature security</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">ERC-4337 smart account</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Advanced governance</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-400 text-lg">✓</span>
                <span className="text-gray-300">Compliance features</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="text-amber-400 text-lg">⚠</span>
                <span className="text-gray-300">~$50-100 gas fees</span>
              </li>
            </ul>

            {selected === 'corporate' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  trackGoal(GOALS.CORPORATE_SETUP_STARTED, { source: 'wizard' });
                  router.push('/setup/corporate');
                }}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Start Corporate Setup →
              </button>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Not sure which to choose?{' '}
            <a href="/docs" className="text-primary hover:underline">
              Learn more
            </a>
          </p>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
