/**
 * Emergency Detection Service
 * 
 * Detects anomalous activities that require immediate action,
 * bypassing normal fee limits to protect user funds.
 */

import { logger } from '../../config/logger'
import { prisma } from '../../db/prisma'

export interface EmergencySignal {
  type: 'PROTOCOL_HACK' | 'FLASH_CRASH' | 'LIQUIDITY_DRAIN' | 'CONTRACT_VULNERABILITY' | 'SLIPPAGE_SPIKE' | 'GAS_SPIKE'
  severity: 'HIGH' | 'CRITICAL'
  protocol?: string
  asset?: string
  description: string
  action: 'WITHDRAW_ALL' | 'WITHDRAW_PARTIAL' | 'PAUSE_OPERATIONS'
  confidence: number // 0-100
}

export interface EmergencyDetectionResult {
  isEmergency: boolean
  signals: EmergencySignal[]
  overallRisk: number // 0-100
  recommendedAction: string
  bypassFeeLimits: boolean
}

class EmergencyDetectionService {
  // Thresholds for anomaly detection
  private readonly FLASH_CRASH_THRESHOLD = 0.15 // 15% price drop in 5 minutes
  private readonly LIQUIDITY_DRAIN_THRESHOLD = 0.30 // 30% liquidity removed
  private readonly SLIPPAGE_SPIKE_THRESHOLD = 0.05 // 5% unexpected slippage
  private readonly GAS_SPIKE_MULTIPLIER = 10 // 10x normal gas price
  
  /**
   * Main detection method - analyzes multiple signals
   */
  async detectEmergency(
    accountAddress: string,
    positions: any[],
    marketData?: any
  ): Promise<EmergencyDetectionResult> {
    const signals: EmergencySignal[] = []
    
    try {
      // 1. Check for protocol hacks (would integrate with external monitoring)
      const protocolSignals = await this.checkProtocolSecurity(positions)
      signals.push(...protocolSignals)
      
      // 2. Check for flash crashes
      const priceSignals = await this.checkPriceAnomalies(positions, marketData)
      signals.push(...priceSignals)
      
      // 3. Check for liquidity drains
      const liquiditySignals = await this.checkLiquidityHealth(positions)
      signals.push(...liquiditySignals)
      
      // 4. Check for abnormal slippage
      const slippageSignals = await this.checkSlippageAnomalies(accountAddress)
      signals.push(...slippageSignals)
      
      // 5. Check for gas spikes (potential network attacks)
      const gasSignals = await this.checkGasAnomalies(marketData)
      signals.push(...gasSignals)
      
    } catch (error) {
      logger.error({ error }, '[Emergency] Detection failed')
    }
    
    // Calculate overall risk and determine if emergency
    const criticalSignals = signals.filter(s => s.severity === 'CRITICAL')
    const highSignals = signals.filter(s => s.severity === 'HIGH')
    
    const overallRisk = Math.min(100, 
      criticalSignals.length * 50 + highSignals.length * 20
    )
    
    const isEmergency = criticalSignals.length > 0 || highSignals.length >= 2
    const bypassFeeLimits = criticalSignals.length > 0 || overallRisk >= 80
    
    let recommendedAction = 'MONITOR'
    if (criticalSignals.length > 0) {
      recommendedAction = 'IMMEDIATE_WITHDRAWAL'
    } else if (highSignals.length >= 2) {
      recommendedAction = 'GRADUAL_WITHDRAWAL'
    } else if (highSignals.length === 1) {
      recommendedAction = 'REDUCE_EXPOSURE'
    }
    
    if (isEmergency) {
      logger.warn({
        accountAddress,
        signals,
        overallRisk,
        recommendedAction
      }, '[Emergency] EMERGENCY DETECTED!')
      
      // Record emergency event
      await this.recordEmergencyEvent(accountAddress, signals, recommendedAction)
    }
    
    return {
      isEmergency,
      signals,
      overallRisk,
      recommendedAction,
      bypassFeeLimits
    }
  }
  
  /**
   * Check for protocol security issues
   */
  private async checkProtocolSecurity(positions: any[]): Promise<EmergencySignal[]> {
    const signals: EmergencySignal[] = []
    
    // In production, this would check:
    // - Known hack databases
    // - Security monitoring services
    // - Smart contract pause states
    // - Protocol governance emergency actions
    
    for (const position of positions) {
      // Check if protocol is paused (simplified)
      if (position.protocol && position.isPaused) {
        signals.push({
          type: 'CONTRACT_VULNERABILITY',
          severity: 'CRITICAL',
          protocol: position.protocol,
          description: `Protocol ${position.protocol} has been paused - possible security issue`,
          action: 'WITHDRAW_ALL',
          confidence: 100
        })
      }
    }
    
    return signals
  }
  
  /**
   * Check for flash crashes and price anomalies
   */
  private async checkPriceAnomalies(positions: any[], marketData?: any): Promise<EmergencySignal[]> {
    const signals: EmergencySignal[] = []
    
    if (!marketData?.prices) return signals
    
    for (const position of positions) {
      const asset = position.asset
      const currentPrice = marketData.prices[asset]?.current
      const price5MinAgo = marketData.prices[asset]?.['5min']
      
      if (currentPrice && price5MinAgo) {
        const priceChange = (currentPrice - price5MinAgo) / price5MinAgo
        
        if (priceChange <= -this.FLASH_CRASH_THRESHOLD) {
          signals.push({
            type: 'FLASH_CRASH',
            severity: priceChange <= -0.25 ? 'CRITICAL' : 'HIGH',
            asset,
            description: `Flash crash detected: ${asset} dropped ${Math.abs(priceChange * 100).toFixed(1)}% in 5 minutes`,
            action: priceChange <= -0.25 ? 'WITHDRAW_ALL' : 'WITHDRAW_PARTIAL',
            confidence: 95
          })
        }
      }
    }
    
    return signals
  }
  
  /**
   * Check liquidity pool health
   */
  private async checkLiquidityHealth(positions: any[]): Promise<EmergencySignal[]> {
    const signals: EmergencySignal[] = []
    
    for (const position of positions) {
      if (position.type === 'LIQUIDITY' && position.pool) {
        const currentLiquidity = position.pool.totalLiquidity
        const previousLiquidity = position.pool.previousLiquidity
        
        if (currentLiquidity && previousLiquidity) {
          const liquidityChange = (currentLiquidity - previousLiquidity) / previousLiquidity
          
          if (liquidityChange <= -this.LIQUIDITY_DRAIN_THRESHOLD) {
            signals.push({
              type: 'LIQUIDITY_DRAIN',
              severity: liquidityChange <= -0.5 ? 'CRITICAL' : 'HIGH',
              protocol: position.protocol,
              description: `Liquidity drain: ${Math.abs(liquidityChange * 100).toFixed(1)}% removed from pool`,
              action: 'WITHDRAW_ALL',
              confidence: 90
            })
          }
        }
      }
    }
    
    return signals
  }
  
  /**
   * Check for abnormal slippage in recent transactions
   */
  private async checkSlippageAnomalies(accountAddress: string): Promise<EmergencySignal[]> {
    const signals: EmergencySignal[] = []
    
    // Get recent transactions
    const recentTxs = await prisma.aIOperation.findMany({
      where: {
        smartAccount: accountAddress.toLowerCase(),
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })
    
    const highSlippageTxs = recentTxs.filter(tx => {
      const slippage = (tx as any).actualSlippage
      return slippage && slippage > this.SLIPPAGE_SPIKE_THRESHOLD
    })
    
    if (highSlippageTxs.length >= 2) {
      signals.push({
        type: 'SLIPPAGE_SPIKE',
        severity: 'HIGH',
        description: `Abnormal slippage detected in ${highSlippageTxs.length} recent transactions`,
        action: 'PAUSE_OPERATIONS',
        confidence: 85
      })
    }
    
    return signals
  }
  
  /**
   * Check for gas price anomalies
   */
  private async checkGasAnomalies(marketData?: any): Promise<EmergencySignal[]> {
    const signals: EmergencySignal[] = []
    
    if (!marketData?.gas) return signals
    
    const currentGas = marketData.gas.current
    const avgGas = marketData.gas.average24h
    
    if (currentGas && avgGas) {
      const gasMultiplier = currentGas / avgGas
      
      if (gasMultiplier >= this.GAS_SPIKE_MULTIPLIER) {
        signals.push({
          type: 'GAS_SPIKE',
          severity: 'HIGH',
          description: `Gas spike detected: ${gasMultiplier.toFixed(1)}x normal levels (potential network attack)`,
          action: 'PAUSE_OPERATIONS',
          confidence: 80
        })
      }
    }
    
    return signals
  }
  
  /**
   * Record emergency event for audit
   */
  private async recordEmergencyEvent(
    accountAddress: string,
    signals: EmergencySignal[],
    action: string
  ): Promise<void> {
    try {
      await prisma.aIOperation.create({
        data: {
          userOpHash: `emergency-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          smartAccount: accountAddress.toLowerCase(),
          protocol: 'EMERGENCY',
          action: action,
          token: 'ALL',
          amount: '0',
          valueUsd: 0,
          riskScore: 10,
          success: false,
          gasUsed: '0',
          timestamp: new Date()
        }
      })
    } catch (error) {
      logger.error({ error }, '[Emergency] Failed to record event')
    }
  }
  
  /**
   * Manual emergency trigger (for testing or manual override)
   */
  async triggerEmergency(
    accountAddress: string,
    reason: string
  ): Promise<EmergencyDetectionResult> {
    logger.warn({ accountAddress, reason }, '[Emergency] MANUAL EMERGENCY TRIGGERED')
    
    const signal: EmergencySignal = {
      type: 'CONTRACT_VULNERABILITY',
      severity: 'CRITICAL',
      description: `Manual emergency: ${reason}`,
      action: 'WITHDRAW_ALL',
      confidence: 100
    }
    
    await this.recordEmergencyEvent(accountAddress, [signal], 'MANUAL_TRIGGER')
    
    return {
      isEmergency: true,
      signals: [signal],
      overallRisk: 100,
      recommendedAction: 'IMMEDIATE_WITHDRAWAL',
      bypassFeeLimits: true
    }
  }
}

export const emergencyDetectionService = new EmergencyDetectionService()
