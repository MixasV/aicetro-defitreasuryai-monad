'use client';

import Link from 'next/link';
import { trackExternalLink, GOALS, trackGoal } from '@/lib/yandex-metrika';

export function Footer() {
  return (
    <footer className="w-full mt-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-t border-white/10 bg-surface rounded-t-3xl">
          {/* Main Footer Content */}
          <div className="px-6 py-12 lg:py-16">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                    🤖
                  </div>
                  <span className="text-xl font-bold text-white">AIcetro</span>
                </div>
                <p className="text-sm text-muted">
                  AI-powered DeFi treasury management with autonomous agents on Monad
                </p>
                <div className="flex items-center gap-4">
                  {/* Social Links */}
                  <a
                    href="https://x.com/AIcetro"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackGoal(GOALS.TWITTER_CLICKED);
                      trackExternalLink('https://x.com/AIcetro');
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition hover:border-primary hover:bg-primary/10 hover:text-white"
                    aria-label="Twitter/X"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/AIcetro"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackGoal(GOALS.GITHUB_CLICKED);
                      trackExternalLink('https://github.com/AIcetro');
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition hover:border-primary hover:bg-primary/10 hover:text-white"
                    aria-label="GitHub"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/wizard" className="text-sm text-muted transition hover:text-white">
                      Get Started
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-sm text-muted transition hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/docs" className="text-sm text-muted transition hover:text-white">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="text-sm text-muted transition hover:text-white">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://github.com/AIcetro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted transition hover:text-white"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <Link href="/docs/user/simple-vs-corporate" className="text-sm text-muted transition hover:text-white">
                      Mode Comparison
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Network & Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Network</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="flex h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-muted">Monad Testnet</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="flex h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="text-muted">Beta v1.1.0</span>
                  </li>
                </ul>
                <div className="mt-6 space-y-2">
                  <p className="text-xs text-muted/60">Built by</p>
                  <a
                    href="https://mixas.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackGoal(GOALS.CREATOR_CLICKED);
                      trackExternalLink('https://mixas.pro');
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted transition hover:border-primary hover:bg-primary/10 hover:text-white"
                  >
                    <span className="text-lg">👨‍💻</span>
                    <span>mixas.pro</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 bg-black/20">
            <div className="px-6 py-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-center text-sm text-muted">
                  © {new Date().getFullYear()} AIcetro. All rights reserved.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <Link href="/privacy" className="text-muted transition hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="text-muted transition hover:text-white">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
