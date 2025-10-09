import type {
  EmergencyActionResponse,
  EmergencyStopMode,
  SecurityDashboardSummary,
  SecurityCheckItem,
  SecurityCheckStatus,
  SecurityDelegationSummary
} from '@defitreasuryai/types'
import { blockchainService } from '../blockchain/blockchain.service'
import { emergencyLogService } from '../emergency/emergency.service'
import { emergencyStateService } from '../emergency/emergency.state'
import { appModeService } from '../app-mode/app-mode.service'
import { env } from '../../config/env'

const DAILY_LIMIT_ALERT_THRESHOLD = 1_000_000

class SecurityDashboardService {
  async getSummary (account: string): Promise<SecurityDashboardSummary> {
    const normalizedAccount = account.trim().toLowerCase()

    const [delegations, emergencyStatus] = await Promise.all([
      blockchainService.getDelegations(normalizedAccount),
      emergencyStateService.syncWithController(normalizedAccount)
    ])

    const delegationSummary = this.buildDelegationSummary(delegations[0])
    const lastAction = this.resolveLastEmergencyAction(normalizedAccount)

    const checks = this.buildChecks(delegationSummary, emergencyStatus.state)

    return {
      account: normalizedAccount,
      generatedAt: new Date().toISOString(),
      mode: appModeService.getState().mode,
      delegation: delegationSummary,
      emergency: {
        state: emergencyStatus.state,
        updatedAt: emergencyStatus.updatedAt,
        lastAction
      },
      trustlessGuarantees: this.buildTrustlessGuarantees(delegationSummary != null, emergencyStatus.state),
      checks
    }
  }

  private buildDelegationSummary (delegation?: unknown): SecurityDelegationSummary | null {
    if (delegation == null || typeof delegation !== 'object') {
      return null
    }

    const record = delegation as {
      delegate?: unknown
      dailyLimit?: unknown
      spent24h?: unknown
      remainingDailyLimit?: unknown
      allowedProtocols?: unknown
      maxRiskScore?: unknown
      updatedAt?: unknown
      active?: unknown
    }

    const dailyLimitUsd = Number.parseFloat(String(record.dailyLimit ?? '0'))
    const spent24hUsd = Number.parseFloat(String(record.spent24h ?? '0'))
    const remaining = typeof record.remainingDailyLimit === 'string'
      ? Number.parseFloat(record.remainingDailyLimit)
      : Number.isFinite(record.remainingDailyLimit)
        ? Number(record.remainingDailyLimit)
        : Math.max(dailyLimitUsd - spent24hUsd, 0)

    return {
      delegate: String(record.delegate ?? ''),
      dailyLimitUsd: Number.isFinite(dailyLimitUsd) ? dailyLimitUsd : 0,
      spent24hUsd: Number.isFinite(spent24hUsd) ? spent24hUsd : 0,
      remainingDailyLimitUsd: Number.isFinite(remaining) ? remaining : 0,
      whitelist: Array.isArray(record.allowedProtocols)
        ? record.allowedProtocols.map((value) => String(value))
        : [],
      maxRiskScore: Number.isFinite(Number(record.maxRiskScore))
        ? Number(record.maxRiskScore)
        : 3,
      updatedAt: String(record.updatedAt ?? new Date().toISOString()),
      active: record.active !== false
    }
  }

  private resolveLastEmergencyAction (account: string): EmergencyActionResponse | null {
    const entries = emergencyLogService.list(account)
    if (entries.length === 0) {
      return null
    }
    const [latest] = entries
    const rawMode = typeof latest.metadata?.mode === 'string' ? latest.metadata.mode : undefined
    const allowedModes: EmergencyStopMode[] = ['executed', 'simulated', 'skipped']
    const mode: EmergencyStopMode = allowedModes.includes(rawMode as EmergencyStopMode)
      ? rawMode as EmergencyStopMode
      : 'executed'

    return {
      operation: latest.metadata?.action === 'resume' ? 'resume' : latest.metadata?.action === 'stop' ? 'stop' : 'auto',
      status: emergencyStateService.getStatus(account),
      mode,
      message: latest.message,
      completedAt: latest.createdAt,
      simulated: latest.metadata?.simulated === true,
      txHash: typeof latest.metadata?.txHash === 'string' ? latest.metadata.txHash : undefined,
      reason: typeof latest.metadata?.reason === 'string' ? latest.metadata.reason : undefined,
      logEntry: latest
    }
  }

  private buildChecks (delegation: SecurityDelegationSummary | null, emergencyState: 'active' | 'paused'): SecurityCheckItem[] {
    const checks: SecurityCheckItem[] = []

    checks.push({
      id: 'delegation-configured',
      title: 'Delegation configured with trustless guardrails',
      status: delegation != null ? 'pass' : 'fail',
      details: delegation != null
        ? `Daily limit ${delegation.dailyLimitUsd.toFixed(2)} USD, whitelist size ${delegation.whitelist.length}`
        : 'No delegation found on-chain or in persistence'
    })

    if (delegation != null) {
      checks.push({
        id: 'daily-limit-threshold',
        title: 'Daily limit below treasury threshold',
        status: delegation.dailyLimitUsd <= DAILY_LIMIT_ALERT_THRESHOLD ? 'pass' : 'warn',
        details: `Configured limit ${delegation.dailyLimitUsd.toFixed(2)} USD`
      })

      checks.push({
        id: 'whitelist-present',
        title: 'Protocol whitelist enforced',
        status: delegation.whitelist.length > 0 ? 'pass' : 'fail',
        details: delegation.whitelist.length > 0
          ? `Allowed protocols: ${delegation.whitelist.join(', ')}`
          : 'Treasury delegation has empty whitelist'
      })
    }

    checks.push({
      id: 'emergency-stop-ready',
      title: 'Emergency stop available',
      status: emergencyState === 'active' ? 'pass' : 'warn',
      details: emergencyState === 'active'
        ? 'Treasury operations are active and can be paused instantly'
        : 'Treasury is currently paused'
    })

    checks.push({
      id: 'auto-execution-control',
      title: 'AI auto execution guarded',
      status: this.resolveAutoExecutionStatus(env.aiAutoExecutionEnabled),
      details: env.aiAutoExecutionEnabled
        ? 'Auto execution enabled; ensure delegation limits are aligned with policy'
        : 'Auto execution disabled; manual approval required'
    })

    checks.push({
      id: 'treasury-configuration',
      title: 'Trustless treasury configured',
      status: env.trustlessTreasuryAddress !== '' ? 'pass' : 'fail',
      details: env.trustlessTreasuryAddress !== ''
        ? `Treasury contract ${env.trustlessTreasuryAddress}`
        : 'TRUSTLESS_TREASURY_ADDRESS is missing'
    })

    return checks
  }

  private resolveAutoExecutionStatus (enabled: boolean): SecurityCheckStatus {
    return enabled ? 'warn' : 'pass'
  }

  private buildTrustlessGuarantees (hasDelegation: boolean, emergencyState: 'active' | 'paused'): string[] {
    const guarantees = [
      'No admin keys in TrustlessDeFiTreasury, only delegated execution',
      'Delegations enforce daily USD caps and protocol whitelists',
      'Emergency stop can pause all executions instantly'
    ]

    if (!env.aiAutoExecutionEnabled) {
      guarantees.push('AI auto execution requires CFO approval before broadcast')
    }

    if (!hasDelegation) {
      guarantees.push('Preview mode simulations never touch on-chain funds')
    }

    if (emergencyState === 'paused') {
      guarantees.push('Treasury is paused until CFO resumes operations')
    }

    return guarantees
  }
}

export const securityDashboardService = new SecurityDashboardService()
