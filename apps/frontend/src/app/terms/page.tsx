import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
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
        <h1 className="mb-8 text-4xl font-bold text-white">Terms of Service</h1>
        
        <div className="space-y-8 text-muted">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using AIcetro, you accept and agree to be bound by these Terms of Service. 
              If you do not agree, do not use the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">2. Service Description</h2>
            <p>
              AIcetro provides AI-powered DeFi treasury management through non-custodial smart account 
              delegation. We do not provide financial, investment, or legal advice.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">3. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Securing your wallet and private keys</li>
              <li>Understanding DeFi risks</li>
              <li>Complying with applicable laws</li>
              <li>Setting appropriate delegation limits</li>
              <li>Monitoring AI agent activity</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">4. Risks and Disclaimers</h2>
            <p className="font-semibold text-amber-400">
              ⚠️ IMPORTANT: DeFi and cryptocurrency investments carry significant risks.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>AI cannot guarantee profits</li>
              <li>Smart contracts may have bugs</li>
              <li>Protocols may be exploited</li>
              <li>Market volatility may cause losses</li>
              <li>Gas fees fluctuate and can be high</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">5. Non-Custodial Nature</h2>
            <p>
              AIcetro is fully non-custodial. We never hold your funds or private keys. You retain 
              complete control and can revoke AI delegation at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">6. Fees</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Management Fee: 0.3% of portfolio value per month</li>
              <li>Capped at 1% of AI-managed capital per 30 days</li>
              <li>Gas fees paid separately by user</li>
              <li>Setup: FREE for Simple Mode, gas costs for Corporate Mode</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">7. Limitation of Liability</h2>
            <p>
              AIcetro is provided "as is" without warranties. We are not liable for losses resulting from:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Market volatility or trading losses</li>
              <li>Smart contract vulnerabilities</li>
              <li>Protocol exploits or hacks</li>
              <li>Network failures or outages</li>
              <li>User error or negligence</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">8. Beta Status</h2>
            <p className="font-semibold text-yellow-400">
              🚧 AIcetro is currently in BETA on Monad Testnet.
            </p>
            <p>
              The platform may have bugs, undergo changes, or experience downtime. Do not use with 
              production funds until mainnet launch.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">9. Termination</h2>
            <p>
              You may terminate service by revoking your delegation. We reserve the right to terminate 
              service for violations of these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">10. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use after changes constitutes acceptance 
              of new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">11. Governing Law</h2>
            <p>
              These terms are governed by applicable law. Disputes will be resolved through arbitration 
              when possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">12. Contact</h2>
            <p>
              For legal inquiries: <a href="mailto:legal@aicetro.com" className="text-primary hover:underline">legal@aicetro.com</a>
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
