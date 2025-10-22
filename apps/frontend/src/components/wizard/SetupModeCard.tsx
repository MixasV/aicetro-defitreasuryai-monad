'use client';

import { useRouter } from 'next/navigation';
import { Building2, Rocket } from 'lucide-react';

interface SetupModeCardProps {
  mode: 'simple' | 'corporate';
  hasSimple: boolean;
  hasCorporate: boolean;
}

export function SetupModeCard({ mode, hasSimple, hasCorporate }: SetupModeCardProps) {
  const router = useRouter();

  // Don't show if both are set up
  if (hasSimple && hasCorporate) {
    return null;
  }

  const showSimpleCard = !hasSimple && mode === 'corporate';
  const showCorporateCard = !hasCorporate && mode === 'simple';

  if (!showSimpleCard && !showCorporateCard) {
    return null;
  }

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/30 p-6">
      {showCorporateCard && (
        <>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-3xl">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Need Corporate Treasury Management?
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Multisig support, advanced features, and institutional-grade controls for managing over $100,000
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/setup/corporate')}
                  className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition"
                >
                  Set up Corporate Mode →
                </button>
                <button
                  onClick={() => window.open('/docs/corporate', '_blank')}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSimpleCard && (
        <>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-3xl">
              <Rocket className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Need Quick Personal Setup?
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Fast 2-minute setup for individual users managing under $100,000. No smart contract deployment required.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/setup/simple')}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
                >
                  Set up Simple Mode →
                </button>
                <button
                  onClick={() => window.open('/docs/simple', '_blank')}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
