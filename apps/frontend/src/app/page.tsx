import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Home | AIcetro',
  description: 'AI-powered autonomous treasury management for corporate DeFi portfolios'
};

const featureList = [
  {
    title: 'Autonomous Treasury Operations',
    description:
      'Deploy your personal AI agent that executes treasury policies around the clock with no human intermediaries.'
  },
  {
    title: 'Transparent, Auditable Decisions',
    description:
      'Every action is recorded on-chain and accompanied by verifiable reasoning so finance teams can trust each move.'
  },
  {
    title: 'Precision Risk Controls',
    description:
      'Program delegation limits, protocol whitelists, and emergency halts that the agent can never override.'
  }
];

const valuePillars = [
  'Autonomy over every digital asset',
  'AI intelligence calibrated for your treasury mandate',
  'Composable infrastructure on the Monad network'
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="pointer-events-none h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      <section className="max-w-5xl space-y-16 text-center">
        <div className="space-y-8">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary-light">
            Aicetro • Monad Testnet • MetaMask Smart Accounts
          </span>
          <h1 className="heading-xl">
            AIcetro: Your Autonomous Treasury
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            Aicetro gives every finance leader a personal, trustless AI captain. Set the destination, define your
            constraints, and let the agent navigate yields, risks, and liquidity across Monad with absolute precision.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/wizard"
              className="rounded-full bg-primary px-8 py-3 text-base font-medium text-white transition hover:bg-primary-light"
            >
              Get Started →
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 px-8 py-3 text-base font-medium text-muted transition hover:border-primary hover:text-white"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {featureList.map((feature) => (
            <article key={feature.title} className="glass-card flex flex-col gap-4 p-6 text-left">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-muted">{feature.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {valuePillars.map((pillar) => (
            <div key={pillar} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted">
              {pillar}
            </div>
          ))}
        </div>
      </section>

      {/* Footer with proper spacing */}
      <div className="w-full">
        <Footer />
      </div>
    </main>
  );
}
