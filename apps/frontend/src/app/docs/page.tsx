'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { usePageTitle } from '@/hooks/usePageTitle';
import { trackGoal, GOALS } from '@/lib/yandex-metrika';

const docCategories = [
  {
    title: 'Getting Started',
    icon: '🚀',
    description: 'Learn the basics and get up and running',
    docs: [
      { title: 'Simple Mode Guide', href: '/docs/user/simple-mode-guide', badge: 'Popular' },
      { title: 'Simple vs Corporate', href: '/docs/user/simple-vs-corporate', badge: 'New' },
      { title: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'User Guides',
    icon: '📖',
    description: 'Detailed guides for all features',
    docs: [
      { title: 'Simple Mode Setup', href: '/setup/simple' },
      { title: 'Corporate Mode Setup', href: '/wizard' },
      { title: 'Dashboard Guide', href: '/dashboard' },
    ],
  },
  {
    title: 'Resources',
    icon: '🔗',
    description: 'Additional resources',
    docs: [
      { title: 'GitHub Repository', href: 'https://github.com/AIcetro', badge: 'External' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function DocsPage() {
  usePageTitle('Documentation');
  
  useEffect(() => {
    trackGoal(GOALS.DOCS_VIEWED);
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
            <span>📚</span>
            <span>Documentation</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            AIcetro Documentation
          </h1>
          <p className="text-lg text-muted">
            Everything you need to know about AI-powered DeFi treasury management
          </p>
        </div>
      </section>

      {/* Search (Placeholder) */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-12 py-4 text-white placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {docCategories.map((category) => (
            <div
              key={category.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-primary/30"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{category.title}</h2>
                    <p className="text-sm text-muted">{category.description}</p>
                  </div>
                </div>
              </div>
              <ul className="space-y-2">
                {category.docs.map((doc) => (
                  <li key={doc.title}>
                    <Link
                      href={doc.href}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-muted transition hover:border-primary/30 hover:bg-primary/5 hover:text-white"
                    >
                      <span>{doc.title}</span>
                      {doc.badge && (
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {doc.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <Link
            href="/wizard"
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-2 text-3xl">🚀</div>
            <h3 className="mb-2 font-semibold text-white">Get Started</h3>
            <p className="text-sm text-muted">Begin your AIcetro journey</p>
          </Link>
          <a
            href="https://github.com/AIcetro"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-2 text-3xl">💻</div>
            <h3 className="mb-2 font-semibold text-white">GitHub</h3>
            <p className="text-sm text-muted">View source code</p>
          </a>
          <Link
            href="/faq"
            className="rounded-xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-primary hover:bg-primary/5"
          >
            <div className="mb-2 text-3xl">💬</div>
            <h3 className="mb-2 font-semibold text-white">FAQ</h3>
            <p className="text-sm text-muted">Common questions</p>
          </Link>
        </div>
      </section>

      {/* Community */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Join the Community</h2>
          <p className="mb-8 text-muted">
            Connect with other users, get help, and stay updated on the latest features
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://x.com/AIcetro"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-muted transition hover:border-primary hover:text-white"
            >
              Twitter/X
            </a>
            <a
              href="https://github.com/AIcetro"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-muted transition hover:border-primary hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
