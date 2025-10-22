'use client';

import { AppShell } from '@/components/layout/AppShell';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Building2, Shield, Users, Zap, CheckCircle } from 'lucide-react';

export default function CorporatePage() {
  usePageTitle('Corporate Treasury Management');

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Corporate Treasury Management
          </h1>
          <p className="text-xl text-slate-400">
            Advanced multi-account treasury solution for organizations
          </p>
        </div>

        {/* What is Corporate Mode */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">What is Corporate Mode?</h2>
          <p className="text-slate-300 mb-4">
            Corporate Mode is designed for organizations managing multiple treasury accounts 
            across different departments, teams, or subsidiaries. It provides centralized 
            oversight with decentralized execution.
          </p>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-surface-light border border-primary/20 rounded-lg p-6">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Multi-Account Management
              </h3>
              <p className="text-slate-400">
                Manage unlimited sub-accounts with individual delegation settings and spending limits.
              </p>
            </div>

            <div className="bg-surface-light border border-primary/20 rounded-lg p-6">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Advanced Permissions
              </h3>
              <p className="text-slate-400">
                Role-based access control (RBAC) with customizable permissions per team member.
              </p>
            </div>

            <div className="bg-surface-light border border-primary/20 rounded-lg p-6">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Consolidated Reporting
              </h3>
              <p className="text-slate-400">
                Unified dashboard showing performance metrics across all accounts in real-time.
              </p>
            </div>

            <div className="bg-surface-light border border-primary/20 rounded-lg p-6">
              <CheckCircle className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Compliance & Audit Trail
              </h3>
              <p className="text-slate-400">
                Complete transaction history with approval workflows for regulatory compliance.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Perfect For</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white">DAOs</strong>
                <span className="text-slate-400"> - Manage treasury across multiple sub-DAOs and working groups</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white">Crypto Companies</strong>
                <span className="text-slate-400"> - Separate operational, investment, and employee funds</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white">Investment Firms</strong>
                <span className="text-slate-400"> - Manage multiple client portfolios with different risk profiles</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-6 h-6 text-primary mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-white">Protocol Treasuries</strong>
                <span className="text-slate-400"> - Optimize yields across ecosystem grants, partnerships, and reserves</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Simple vs Corporate Mode</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Simple Mode</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Corporate Mode</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4">Accounts</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4">Team Management</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">✓</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4">Role-Based Access</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">✓</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4">Consolidated Dashboard</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">✓</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-3 px-4">Approval Workflows</td>
                  <td className="text-center py-3 px-4">-</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Best For</td>
                  <td className="text-center py-3 px-4">Individuals</td>
                  <td className="text-center py-3 px-4 text-primary font-semibold">Organizations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Upgrade?
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Contact us to discuss your corporate treasury needs and get a custom onboarding plan.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="mailto:contact@aicetro.com"
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Contact Sales
            </a>
            <a
              href="/wizard"
              className="px-6 py-3 bg-surface-light text-white rounded-lg font-medium hover:bg-surface transition-colors border border-slate-700"
            >
              Back to Wizard
            </a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
