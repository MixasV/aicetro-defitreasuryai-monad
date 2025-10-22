import { logger } from '../../config/logger'
import { envioStreamService } from './envio.stream.service'

interface DailyMetrics {
  date: string
  totalOperations: number
  totalVolumeUsd: string
  uniqueCorporates: number
  averageOperationSize: string
  emergencyEvents: number
  averageAPY: string
}

interface EventTimelineItem {
  timestamp: string
  eventType: string
  title: string
  description: string
  amountUsd?: string
  txHash: string
  blockNumber: string
}

interface RiskAlert {
  severity: string
  alertType: string
  message: string
  triggeredAt: string
  resolved: boolean
  currentValue?: string
  thresholdValue?: string
}

interface PerformanceMetrics {
  period: string
  startDate: string
  endDate: string
  startingValueUsd: string
  endingValueUsd: string
  netProfitUsd: string
  roiPercent: string
  totalOperations: number
  totalVolumeUsd: string
}

/**
 * Enhanced Envio service for analytics and AI-optimized queries
 */
class EnvioAnalyticsService {
  /**
   * PHASE 1: Historical Data Queries
   */
  
  async getDailyMetrics(days: number = 30): Promise<DailyMetrics[]> {
    const query = `
      query GetDailyMetrics($days: Int!) {
        Analytics_DailyMetrics(
          order_by: { date: desc }
          limit: $days
        ) {
          date
          totalDelegations
          totalSpendingUsd
          uniqueUsers
          emergencyPauses
          averageSpendPerUser
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, { days })
      return (result?.Analytics_DailyMetrics ?? []).map((m: any) => ({
        date: m.date,
        totalOperations: m.totalDelegations + (m.emergencyPauses || 0),
        totalVolumeUsd: m.totalSpendingUsd,
        uniqueCorporates: m.uniqueUsers,
        averageOperationSize: m.averageSpendPerUser,
        emergencyEvents: m.emergencyPauses,
        averageAPY: '0' // Not tracked yet
      }))
    } catch (error) {
      logger.error({ err: error }, '[EnvioAnalytics] Failed to get daily metrics')
      return []
    }
  }
  
  async getEventTimeline(
    account: string,
    limit: number = 50
  ): Promise<EventTimelineItem[]> {
    const query = `
      query GetTimeline($account: String!, $limit: Int!) {
        Analytics_EventTimeline(
          where: { user: { _eq: $account } }
          order_by: { timestamp: desc }
          limit: $limit
        ) {
          timestamp
          eventType
          title
          description
          valueUsd
          txHash
          blockNumber
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, { 
        account: account.toLowerCase(), 
        limit 
      })
      
      return (result?.Analytics_EventTimeline ?? []).map((e: any) => ({
        timestamp: e.timestamp,
        eventType: e.eventType,
        title: e.title,
        description: e.description,
        amountUsd: e.valueUsd,
        txHash: e.txHash,
        blockNumber: e.blockNumber
      }))
    } catch (error) {
      logger.error({ err: error, account }, '[EnvioAnalytics] Failed to get timeline')
      return []
    }
  }
  
  /**
   * Time-travel query: Get state at specific timestamp
   */
  async getStateAtTimestamp(
    account: string,
    timestamp: number
  ): Promise<any> {
    const query = `
      query GetHistoricalState($account: String!, $timestamp: bigint!) {
        Analytics_UserSummary(
          where: { user: { _eq: $account } }
        ) {
          user
          totalSpentUsd
          totalDelegations
          lastActivityAt
        }
        
        Analytics_EventTimeline(
          where: {
            user: { _eq: $account }
            timestamp: { _lte: $timestamp }
          }
          order_by: { timestamp: desc }
          limit: 10
        ) {
          timestamp
          eventType
          title
          valueUsd
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, {
        account: account.toLowerCase(),
        timestamp: timestamp.toString()
      })
      
      return {
        account: result?.Analytics_UserSummary?.[0] ?? null,
        recentEvents: result?.Analytics_EventTimeline ?? []
      }
    } catch (error) {
      logger.error({ err: error, account, timestamp }, '[EnvioAnalytics] Time-travel query failed')
      return { account: null, recentEvents: [] }
    }
  }
  
  /**
   * PHASE 2: Performance Analytics (simplified - uses UserSummary)
   */
  
  async getPerformanceMetrics(
    account: string,
    period: 'daily' | 'weekly' | 'monthly' = 'monthly'
  ): Promise<PerformanceMetrics[]> {
    const query = `
      query GetPerformance($account: String!) {
        Analytics_UserSummary(
          where: { user: { _eq: $account } }
        ) {
          totalSpentUsd
          totalDelegations
          activeDelegations
          lastActivityAt
          firstActivityAt
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, {
        account: account.toLowerCase()
      })
      
      const summary = result?.Analytics_UserSummary?.[0]
      if (!summary) return []
      
      // Return single aggregated metric
      return [{
        period: 'all_time',
        startDate: new Date(Number(summary.firstActivityAt) * 1000).toISOString(),
        endDate: new Date(Number(summary.lastActivityAt) * 1000).toISOString(),
        startingValueUsd: '0',
        endingValueUsd: summary.totalSpentUsd,
        netProfitUsd: summary.totalSpentUsd,
        roiPercent: '0',
        totalOperations: summary.totalDelegations,
        totalVolumeUsd: summary.totalSpentUsd
      }]
    } catch (error) {
      logger.error({ err: error, account }, '[EnvioAnalytics] Failed to get performance metrics')
      return []
    }
  }
  
  /**
   * Compare performance across periods (using daily metrics)
   */
  async comparePerformance(
    account: string,
    period1Start: string,
    period1End: string,
    period2Start: string,
    period2End: string
  ): Promise<{ period1: any, period2: any, comparison: any }> {
    const query = `
      query ComparePerformance(
        $p1Start: String!
        $p1End: String!
        $p2Start: String!
        $p2End: String!
      ) {
        period1: Analytics_DailyMetrics(
          where: {
            date: { _gte: $p1Start, _lte: $p1End }
          }
        ) {
          totalSpendingUsd
          totalDelegations
        }
        
        period2: Analytics_DailyMetrics(
          where: {
            date: { _gte: $p2Start, _lte: $p2End }
          }
        ) {
          totalSpendingUsd
          totalDelegations
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, {
        p1Start: period1Start,
        p1End: period1End,
        p2Start: period2Start,
        p2End: period2End
      })
      
      const p1 = result?.period1 ?? []
      const p2 = result?.period2 ?? []
      
      const p1Total = p1.reduce((sum: number, m: any) => sum + parseFloat(m.totalSpendingUsd || '0'), 0)
      const p2Total = p2.reduce((sum: number, m: any) => sum + parseFloat(m.totalSpendingUsd || '0'), 0)
      
      return {
        period1: { metrics: p1, totalVolume: p1Total },
        period2: { metrics: p2, totalVolume: p2Total },
        comparison: {
          volumeChange: p2Total - p1Total,
          volumeChangePercent: p1Total > 0 ? ((p2Total - p1Total) / p1Total) * 100 : 0
        }
      }
    } catch (error) {
      logger.error({ err: error }, '[EnvioAnalytics] Failed to compare performance')
      return { period1: {}, period2: {}, comparison: {} }
    }
  }
  
  /**
   * PHASE 3: AI Recommendations Data (simplified for now)
   */
  
  async getProtocolRankings(limit: number = 10): Promise<any[]> {
    // This would require aggregating TrustlessDeFiTreasury_SpendRecorded by protocol
    // For now, return empty array - can be enhanced later
    try {
      const query = `
        query GetSpendByProtocol($limit: Int!) {
          TrustlessDeFiTreasury_SpendRecorded(
            order_by: { valueUsd: desc }
            limit: $limit
          ) {
            protocol
            valueUsd
            user
          }
        }
      `
      const result = await envioStreamService.query(query, { limit })
      return result?.TrustlessDeFiTreasury_SpendRecorded ?? []
    } catch (error) {
      logger.error({ err: error }, '[EnvioAnalytics] Failed to get protocol rankings')
      return []
    }
  }
  
  async getLatestAIRecommendation(): Promise<any> {
    // Not implemented yet - would require scheduled job to generate snapshots
    return {
      message: 'AI recommendation snapshots not yet implemented',
      note: 'Use analytics data directly for now'
    }
  }
  
  /**
   * PHASE 4: Risk Monitoring
   */
  
  async getRiskAlerts(
    account?: string,
    severity?: string,
    resolved?: boolean
  ): Promise<RiskAlert[]> {
    const whereConditions: string[] = []
    
    if (account) {
      whereConditions.push(`user: { _eq: "${account.toLowerCase()}" }`)
    }
    if (severity) {
      whereConditions.push(`severity: { _eq: "${severity}" }`)
    }
    if (resolved !== undefined) {
      whereConditions.push(`resolved: { _eq: ${resolved} }`)
    }
    
    const whereClause = whereConditions.length > 0 
      ? `where: { ${whereConditions.join(', ')} }`
      : ''
    
    const query = `
      query GetRiskAlerts {
        Analytics_RiskAlert(
          ${whereClause}
          order_by: { triggeredAt: desc }
          limit: 50
        ) {
          severity
          alertType
          message
          triggeredAt
          resolved
          valueUsd
          user
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query)
      return (result?.Analytics_RiskAlert ?? []).map((a: any) => ({
        severity: a.severity,
        alertType: a.alertType,
        message: a.message,
        triggeredAt: a.triggeredAt,
        resolved: a.resolved,
        currentValue: a.valueUsd,
        thresholdValue: undefined
      }))
    } catch (error) {
      logger.error({ err: error }, '[EnvioAnalytics] Failed to get risk alerts')
      return []
    }
  }
  
  async getAnomalyEvents(account: string, limit: number = 20): Promise<any[]> {
    // Anomalies are tracked via RiskAlerts for now
    return this.getRiskAlerts(account, undefined, false)
  }
  
  /**
   * PHASE 5: Portfolio Optimization (uses existing data)
   */
  
  async getAllocationSnapshot(account: string): Promise<any> {
    const query = `
      query GetAllocation($account: String!) {
        Analytics_UserSummary(
          where: { user: { _eq: $account } }
        ) {
          totalSpentUsd
          totalDelegations
          activeDelegations
        }
      }
    `
    
    try {
      const result = await envioStreamService.query(query, {
        account: account.toLowerCase()
      })
      
      return result?.Analytics_UserSummary?.[0] ?? null
    } catch (error) {
      logger.error({ err: error, account }, '[EnvioAnalytics] Failed to get allocation')
      return null
    }
  }
  
  /**
   * Summary dashboard data (combines multiple queries)
   */
  async getDashboardSummary(account: string): Promise<any> {
    try {
      const [timeline, metrics, alerts, anomalies] = await Promise.all([
        this.getEventTimeline(account, 10),
        this.getDailyMetrics(7),
        this.getRiskAlerts(account, undefined, false),
        this.getAnomalyEvents(account, 5)
      ])
      
      return {
        recentActivity: timeline,
        weeklyMetrics: metrics,
        activeAlerts: alerts,
        recentAnomalies: anomalies,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      logger.error({ err: error, account }, '[EnvioAnalytics] Failed to get dashboard summary')
      return {
        recentActivity: [],
        weeklyMetrics: [],
        activeAlerts: [],
        recentAnomalies: [],
        generatedAt: new Date().toISOString()
      }
    }
  }
}

export const envioAnalyticsService = new EnvioAnalyticsService()
