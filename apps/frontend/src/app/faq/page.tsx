'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackGoal, GOALS } from '@/lib/yandex-metrika';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is AIcetro?',
        a: 'AIcetro is an AI-powered DeFi treasury management system that automatically optimizes your crypto portfolio for maximum yield while managing risk.',
      },
      {
        q: 'Is my money safe?',
        a: 'Yes. AIcetro is 100% non-custodial. We never hold your private keys, funds stay in YOUR wallet, and you can revoke AI access anytime.',
      },
      {
        q: 'How much does it cost?',
        a: 'Management fee: 0.3% of portfolio value per month (capped at 1% of AI-managed capital per 30 days). Setup is FREE for Simple Mode.',
      },
    ],
  },
  {
    category: 'Simple Mode',
    questions: [
      {
        q: 'How do I set up Simple Mode?',
        a: '3 easy steps: Visit /setup/simple, connect wallet + set parameters (2 min), sign delegation with MetaMask (FREE).',
      },
      {
        q: 'Can I change parameters after delegating?',
        a: 'Yes. Revoke current delegation (FREE, instant), then create new delegation with new parameters (2 min).',
      },
      {
        q: 'What happens when my delegation expires?',
        a: 'AI stops executing new transactions. Existing positions remain open. You receive notification to renew.',
      },
    ],
  },
  {
    category: 'Corporate Mode',
    questions: [
      {
        q: 'When should I use Corporate Mode?',
        a: 'Required if portfolio ≥ $100,000. Recommended for organizations needing multi-signature security and governance features.',
      },
      {
        q: 'How does multi-signature work?',
        a: 'Example: 2-of-3 multi-sig means 2 out of 3 owners must approve each transaction. Provides security and prevents single point of failure.',
      },
    ],
  },
  {
    category: 'Security',
    questions: [
      {
        q: 'Can AIcetro be hacked?',
        a: "We're non-custodial (no keys stored), have on-chain enforcement (limits cannot be bypassed), rate limiting, and whitelisted protocols only.",
      },
      {
        q: 'How do I verify AIcetro is non-custodial?',
        a: 'Check our open-source code on GitHub. AI agent address is generated deterministically with NO corresponding private key.',
      },
    ],
  },
];

export default function FAQPage() {
  usePageTitle('FAQ');
  
  useEffect(() => {
    trackGoal(GOALS.FAQ_VIEWED);
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                🤖
              </div>
              <span className="text-xl font-bold text-white">AIcetro</span>
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-muted transition hover:border-primary hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-white/10 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-wider text-primary">
            <span>💬</span>
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            How can we help you?
          </h1>
          <p className="text-lg text-muted">
            Find answers to common questions about AIcetro, Simple Mode, Corporate Mode, and security.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-12">
          {faqs.map((category) => (
            <div key={category.category} className="space-y-6">
              <h2 className="text-2xl font-bold text-white">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group rounded-xl border border-white/10 bg-white/5 transition hover:border-primary/30"
                  >
                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-medium text-white">
                      <span>{faq.q}</span>
                      <svg
                        className="h-5 w-5 text-muted transition group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="border-t border-white/10 px-6 py-4 text-muted">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-transparent p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-white">Still have questions?</h3>
          <p className="mb-6 text-muted">
            Check our comprehensive documentation or reach out to our community.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-light"
            >
              Read Documentation
            </Link>
            <a
              href="https://github.com/AIcetro"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-muted transition hover:border-primary hover:text-white"
            >
              GitHub Community
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
