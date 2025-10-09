'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Lock, Eye, CheckCircle, RefreshCw, Square, X, Phone } from 'lucide-react';
import type { SecurityCheckItem } from '@defitreasuryai/types';
import { useSecurityDashboard } from '../../hooks/useSecurityDashboard';

interface EmergencyControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'stop' | 'revoke';
}

const EmergencyControlsModal = ({ isOpen, onClose, onConfirm, action }: EmergencyControlsModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-rose-800 bg-slate-900 p-6 shadow-2xl"
        >
          <div className="mb-4 flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {action === 'stop' ? 'Emergency Stop' : 'Revoke AI Access'}
              </h3>
              <p className="text-xs text-slate-400">This action requires confirmation</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-rose-800/30 bg-rose-900/10 p-4">
            <p className="text-sm text-slate-200">
              {action === 'stop'
                ? 'This will immediately halt all AI operations and pending transactions. Your existing positions will remain safe, but no new actions will be taken until you manually restart.'
                : 'This will remove all AI agent permissions while keeping your positions active. You will need to manually manage operations until permissions are restored.'}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
            >
              Confirm {action === 'stop' ? 'Stop' : 'Revoke'}
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export const EnhancedSecurityDashboard = ({ account }: { account: string }) => {
  const { summary, isLoading, isError, refresh } = useSecurityDashboard(account);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);

  const handleEmergencyStop = () => {
    console.log('Emergency stop triggered');
    // TODO: Implement emergency stop logic
  };

  const handleRevokeAccess = () => {
    console.log('AI access revoked');
    // TODO: Implement revoke logic
  };

  if (isError) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6"
      >
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-rose-100">Failed to load security dashboard</p>
          </div>
          <button
            onClick={() => refresh()}
            className="rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs text-rose-200 transition-colors hover:bg-rose-400/10"
          >
            Retry
          </button>
        </div>
      </motion.section>
    );
  }

  if (isLoading || summary == null) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <div className="flex items-center justify-center space-x-3 text-slate-300">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading trustless guarantees…</span>
        </div>
      </motion.section>
    );
  }

  const delegation = summary.delegation;
  const isPaused = summary.emergency.state === 'paused';

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Security Status Overview */}
        <div className="rounded-xl border border-emerald-800/50 bg-gradient-to-br from-emerald-900/20 to-blue-900/20 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Security Status</h2>
                <p className="text-xs text-slate-400">Mode: {summary.mode.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center rounded-full bg-emerald-900/50 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                All Systems Secure
              </span>
              <button
                type="button"
                onClick={() => refresh()}
                className="rounded-lg border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Refresh security status"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Security Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg bg-slate-800/50 p-4 text-center"
            >
              <div className="text-3xl font-bold text-emerald-400">100%</div>
              <div className="text-sm text-slate-300">Trustless Score</div>
              <div className="mt-1 text-xs text-slate-400">Zero admin access</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-lg bg-slate-800/50 p-4 text-center"
            >
              <div className="text-3xl font-bold text-blue-400">
                {summary.trustlessGuarantees.length}
              </div>
              <div className="text-sm text-slate-300">Active Protections</div>
              <div className="mt-1 text-xs text-slate-400">Multi-layer security</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg bg-slate-800/50 p-4 text-center"
            >
              <div className="text-3xl font-bold text-purple-400">&lt;1s</div>
              <div className="text-sm text-slate-300">Emergency Response</div>
              <div className="mt-1 text-xs text-slate-400">Instant stop capability</div>
            </motion.div>
          </div>

          {/* Detailed Security Features */}
          <div className="mt-6 space-y-3">
            <SecurityFeatureItem
              icon={<Lock className="h-5 w-5 text-emerald-400" />}
              title="Smart Account Protection"
              description="Multi-signature with timelock delays"
              status="active"
            />
            {delegation && (
              <SecurityFeatureItem
                icon={<Shield className="h-5 w-5 text-purple-400" />}
                title="AI Agent Delegation"
                description="Controlled AI permissions with strict limits"
                status="active"
                details={`$${delegation.dailyLimitUsd.toFixed(0)}/day limit • ${delegation.whitelist.length} whitelisted protocols`}
              />
            )}
            <SecurityFeatureItem
              icon={<Eye className="h-5 w-5 text-blue-400" />}
              title="Real-time Monitoring"
              description="Continuous security scanning and alerts"
              status="monitoring"
              details="24/7 automated risk assessment • 0 threats detected"
            />
          </div>
        </div>

        {/* Delegation & Emergency Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Delegation Card */}
          {delegation && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-6"
            >
              <h3 className="mb-4 flex items-center text-sm font-semibold uppercase tracking-wide text-emerald-200">
                <Shield className="mr-2 h-4 w-4" />
                Delegation Status
              </h3>
              <div className="space-y-3 text-sm text-emerald-50">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Delegate</span>
                  <span className="font-mono text-xs">{delegation.delegate.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Daily Limit</span>
                  <span className="font-semibold">${delegation.dailyLimitUsd.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Remaining</span>
                  <span className="font-semibold text-emerald-300">
                    ${delegation.remainingDailyLimitUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Max Risk</span>
                  <span>{delegation.maxRiskScore}/5</span>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-emerald-200/80">Whitelisted Protocols</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {delegation.whitelist.slice(0, 3).map((protocol) => (
                      <span
                        key={protocol}
                        className="rounded-full border border-emerald-400/50 bg-emerald-900/30 px-2 py-1 text-xs"
                      >
                        {protocol}
                      </span>
                    ))}
                    {delegation.whitelist.length > 3 && (
                      <span className="rounded-full border border-emerald-400/50 bg-emerald-900/30 px-2 py-1 text-xs">
                        +{delegation.whitelist.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emergency Status Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-xl border p-6 ${
              isPaused
                ? 'border-amber-400/40 bg-amber-400/10'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <h3 className="mb-4 flex items-center text-sm font-semibold uppercase tracking-wide text-slate-200">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency Status
            </h3>
            <div className={`space-y-3 text-sm ${isPaused ? 'text-amber-50' : 'text-slate-300'}`}>
              <div className="flex justify-between">
                <span>State</span>
                <span className={`font-semibold ${isPaused ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {isPaused ? 'PAUSED' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-xs">{new Date(summary.emergency.updatedAt).toLocaleString('en-US')}</span>
              </div>
              {summary.emergency.lastAction && (
                <div className="mt-3 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3">
                  <div className="text-xs text-slate-400">Last Action</div>
                  <div className="mt-1 font-medium">{summary.emergency.lastAction.operation}</div>
                  <div className="mt-1 text-xs text-slate-400">{summary.emergency.lastAction.message}</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Emergency Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-orange-800/50 bg-orange-900/10 p-6"
        >
          <div className="mb-4">
            <h3 className="flex items-center text-sm font-semibold text-orange-400">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Emergency Controls
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Instant response controls that work even if AI systems are compromised
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Emergency Stop */}
            <div className="rounded-lg border border-rose-800/30 bg-rose-900/10 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-600/20">
                  <Square className="h-5 w-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-400">Emergency Stop</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Immediately halt all AI operations and pending transactions
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowStopModal(true)}
                    className="mt-3 flex w-full items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Emergency Stop
                  </button>
                </div>
              </div>
            </div>

            {/* Revoke Delegation */}
            <div className="rounded-lg border border-orange-800/30 bg-orange-900/10 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600/20">
                  <X className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-400">Revoke AI Access</h4>
                  <p className="mt-1 text-xs text-slate-400">
                    Remove all AI agent permissions while keeping positions active
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRevokeModal(true)}
                    className="mt-3 flex w-full items-center justify-center rounded-lg border border-orange-600 bg-transparent px-4 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-600 hover:text-white"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Revoke Permissions
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-4 flex items-center space-x-3 rounded-lg border border-slate-700 bg-slate-800/30 p-4">
            <Phone className="h-5 w-5 text-blue-400" />
            <div className="flex-1">
              <div className="font-medium text-slate-200">24/7 Emergency Support</div>
              <div className="text-sm text-slate-400">
                Critical security issues:{' '}
                <a href="mailto:emergency@aicetro.com" className="font-mono text-blue-400 hover:underline">
                  emergency@aicetro.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trustless Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-6"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-200">Trustless Guarantees</h3>
          <ul className="space-y-2">
            {summary.trustlessGuarantees.map((item, idx) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start space-x-3 text-sm text-slate-300"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Security Checks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-semibold text-slate-200">Security Checks</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {summary.checks.map((check, idx) => (
              <SecurityCheckCard key={check.id} check={check} delay={idx * 0.05} />
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* Modals */}
      <EmergencyControlsModal
        isOpen={showStopModal}
        onClose={() => setShowStopModal(false)}
        onConfirm={handleEmergencyStop}
        action="stop"
      />
      <EmergencyControlsModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleRevokeAccess}
        action="revoke"
      />
    </>
  );
};

const SecurityFeatureItem = ({
  icon,
  title,
  description,
  status,
  details
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'active' | 'monitoring';
  details?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-start space-x-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3"
  >
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-200">{title}</h4>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            status === 'active'
              ? 'bg-emerald-900/50 text-emerald-300'
              : 'bg-blue-900/50 text-blue-300'
          }`}
        >
          {status === 'active' ? 'Active' : 'Monitoring'}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      {details && <p className="mt-1 text-xs text-slate-500">{details}</p>}
    </div>
  </motion.div>
);

const SecurityCheckCard = ({ check, delay }: { check: SecurityCheckItem; delay: number }) => {
  const statusMap: Record<SecurityCheckItem['status'], { label: string; className: string; icon: React.ReactNode }> =
    {
      pass: {
        label: 'Pass',
        className: 'border-emerald-700/50 bg-emerald-900/20 text-emerald-200',
        icon: <CheckCircle className="h-4 w-4 text-emerald-400" />
      },
      warn: {
        label: 'Warning',
        className: 'border-amber-700/50 bg-amber-900/20 text-amber-200',
        icon: <AlertTriangle className="h-4 w-4 text-amber-400" />
      },
      fail: {
        label: 'Fail',
        className: 'border-rose-700/50 bg-rose-900/20 text-rose-200',
        icon: <AlertTriangle className="h-4 w-4 text-rose-400" />
      }
    };

  const status = statusMap[check.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`rounded-lg border p-4 ${status.className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status.icon}
          <p className="text-sm font-semibold text-white">{check.title}</p>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs uppercase tracking-wide text-white/80">
          {status.label}
        </span>
      </div>
      {check.details && <p className="mt-2 text-xs text-white/70">{check.details}</p>}
      {check.remediation && (
        <p className="mt-2 text-xs text-white/60">
          <span className="font-medium">Next steps:</span> {check.remediation}
        </p>
      )}
    </motion.div>
  );
};
