import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
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

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-8 text-4xl font-bold text-white">Privacy Policy</h1>
        
        <div className="space-y-8 text-muted">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">1. Non-Custodial Architecture</h2>
            <p>
              AIcetro is a fully non-custodial platform. We do not have access to your private keys, 
              cannot control your funds, and do not store sensitive wallet information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">2. Data Collection</h2>
            <p>We collect minimal data necessary for platform operation:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Wallet addresses (public information)</li>
              <li>Delegation signatures (stored for verification)</li>
              <li>Transaction history (public on-chain data)</li>
              <li>Usage analytics (anonymized)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. Data Usage</h2>
            <p>Your data is used exclusively for:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Executing AI treasury management</li>
              <li>Verifying delegation permissions</li>
              <li>Improving platform performance</li>
              <li>Providing customer support</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">4. Data Sharing</h2>
            <p>
              We do not sell or share your personal data with third parties. Public blockchain data 
              is inherently transparent and visible to anyone.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Security</h2>
            <p>
              All data is encrypted in transit (HTTPS) and at rest. We follow industry best practices 
              for security and regularly audit our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Access your data</li>
              <li>Request data deletion</li>
              <li>Revoke AI delegation anytime</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">7. Contact</h2>
            <p>
              For privacy concerns: <a href="mailto:privacy@aicetro.com" className="text-primary hover:underline">privacy@aicetro.com</a>
            </p>
          </section>

          <section className="mt-12 rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm">
              <strong className="text-white">Last Updated:</strong> January 11, 2025<br />
              <strong className="text-white">Effective Date:</strong> January 11, 2025
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
