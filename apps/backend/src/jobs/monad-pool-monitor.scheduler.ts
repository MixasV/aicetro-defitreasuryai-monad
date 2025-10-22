import { logger } from '../config/logger'
import { prisma } from '../db/prisma'
import axios from 'axios'
import { env } from '../config/env'

/**
 * Monad Pool Monitor Scheduler
 * 
 * Monitors Monad pools every 5 minutes (dedicated monitoring for testnet)
 * Fast AI analysis for the single active Monad pool
 */
export class MonadPoolMonitorScheduler {
  private handle: NodeJS.Timeout | null = null
  private running = false
  private enabled = false
  private readonly intervalMs: number
  
  constructor(intervalMs = 5 * 60 * 1000) { // Default: 5 minutes
    this.intervalMs = intervalMs
  }
  
  start(): boolean {
    if (this.enabled) {
      logger.warn('[MonadPoolMonitor] Already started')
      return false
    }
    
    this.enabled = true
    this.handle = setInterval(() => {
      void this.analyzeMonadPools()
    }, this.intervalMs)
    
    logger.info({ intervalMs: this.intervalMs }, '[MonadPoolMonitor] Scheduler started (5 min interval)')
    
    // Run first analysis immediately
    void this.analyzeMonadPools()
    
    return true
  }
  
  stop(): boolean {
    if (!this.enabled) {
      return false
    }
    
    if (this.handle !== null) {
      clearInterval(this.handle)
      this.handle = null
    }
    
    this.enabled = false
    logger.info('[MonadPoolMonitor] Scheduler stopped')
    return true
  }
  
  getStatus(): {
    enabled: boolean
    running: boolean
    intervalMs: number
  } {
    return {
      enabled: this.enabled,
      running: this.running,
      intervalMs: this.intervalMs
    }
  }
  
  /**
   * Analyze Monad pools with volume >= $100K
   */
  async analyzeMonadPools(): Promise<{ analyzed: number, errors: number }> {
    if (this.running) {
      logger.warn('[MonadPoolMonitor] Previous analysis still running, skipping')
      return { analyzed: 0, errors: 0 }
    }
    
    this.running = true
    const startTime = Date.now()
    
    try {
      // Get active Monad pools (volume >= $100K)
      const monadPools = await prisma.pool.findMany({
        where: {
          chain: 'Monad',
          isActive: true,
          volume24h: { gte: 100000 }
        },
        select: {
          id: true,
          protocol: true,
          asset: true,
          apy: true,
          tvl: true,
          volume24h: true,
          riskScore: true,
          aiScore: true
        }
      })
      
      if (monadPools.length === 0) {
        logger.info('[MonadPoolMonitor] No active Monad pools to analyze')
        return { analyzed: 0, errors: 0 }
      }
      
      logger.info({ count: monadPools.length }, '[MonadPoolMonitor] Analyzing Monad pools...')
      
      // Build AI prompt for Monad pools
      const prompt = this.buildMonadPrompt(monadPools)
      
      // Call OpenRouter API
      const aiResponse = await this.callOpenRouter(prompt)
      
      // Parse results
      const results = this.parseAIResponse(aiResponse)
      
      // Update database
      let analyzed = 0
      let errors = 0
      
      for (const result of results) {
        try {
          const pool = monadPools[result.poolNumber - 1]
          if (!pool) {
            logger.warn({ poolNumber: result.poolNumber }, '[MonadPoolMonitor] Pool not found')
            continue
          }
          
          await prisma.pool.update({
            where: { id: pool.id },
            data: {
              riskScore: result.riskScore,
              aiScore: result.aiScore,
              aiReason: result.reason,
              lastAnalyzedAt: new Date()
            }
          })
          
          analyzed++
          logger.info({ 
            pool: pool.asset, 
            riskScore: result.riskScore, 
            aiScore: result.aiScore 
          }, '[MonadPoolMonitor] Pool analyzed')
          
        } catch (error) {
          logger.error({ error, result }, '[MonadPoolMonitor] Failed to update pool')
          errors++
        }
      }
      
      const duration = Date.now() - startTime
      logger.info({
        analyzed,
        errors,
        durationMs: duration
      }, '[MonadPoolMonitor] Analysis complete')
      
      return { analyzed, errors }
      
    } catch (error) {
      logger.error({ error }, '[MonadPoolMonitor] Analysis failed')
      return { analyzed: 0, errors: 0 }
    } finally {
      this.running = false
    }
  }
  
  /**
   * Build AI prompt for Monad pools
   */
  private buildMonadPrompt(pools: any[]): string {
    const poolsText = pools.map((p, i) => 
      `Pool ${i + 1}:
- Asset: ${p.asset}
- Protocol: ${p.protocol}
- APY: ${p.apy.toFixed(2)}%
- TVL: $${p.tvl.toLocaleString()}
- Volume 24h: $${p.volume24h.toLocaleString()}
- Current Risk: ${p.riskScore || 'N/A'}
- Current AI Score: ${p.aiScore || 'N/A'}`
    ).join('\n\n')
    
    return `You are a DeFi risk analyst for Monad testnet. Analyze these ${pools.length} active pool(s):

${poolsText}

For EACH pool, provide:
1. Risk Score (1-5): 1=Very Safe, 2=Safe, 3=Medium, 4=Risky, 5=Very Risky
2. AI Score (0-100): Investment attractiveness (higher = better)
3. Reason: One sentence explaining your scores

Considerations for Monad testnet:
- Testnet has LOW liquidity (normal)
- Single active pool = HIGH concentration risk
- APY 10-15% = reasonable for testnet
- Volume volatility expected

Format your response EXACTLY like this for each pool:

Pool 1:
Risk: 3
Score: 75
Reason: Medium risk due to testnet nature, decent APY and volume.`
  }
  
  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: env.openRouterModel,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${env.openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aicetro.com',
            'X-Title': 'Aicetro DeFi Treasury'
          },
          timeout: 30000
        }
      )
      
      return response.data.choices[0].message.content
      
    } catch (error: any) {
      logger.error({ 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }, '[MonadPoolMonitor] OpenRouter API call failed')
      throw error
    }
  }
  
  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): Array<{
    poolNumber: number
    riskScore: number
    aiScore: number
    reason: string
  }> {
    const results: Array<{
      poolNumber: number
      riskScore: number
      aiScore: number
      reason: string
    }> = []
    
    const lines = response.split('\n')
    let currentPool: any = {}
    let poolNumber = 0
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('Pool ')) {
        if (poolNumber > 0 && currentPool.riskScore) {
          results.push(currentPool)
        }
        poolNumber++
        currentPool = { poolNumber }
      } else if (trimmed.startsWith('Risk:')) {
        const risk = parseInt(trimmed.split(':')[1].trim())
        currentPool.riskScore = Math.max(1, Math.min(5, risk))
      } else if (trimmed.startsWith('Score:')) {
        const score = parseInt(trimmed.split(':')[1].trim())
        currentPool.aiScore = Math.max(0, Math.min(100, score))
      } else if (trimmed.startsWith('Reason:')) {
        currentPool.reason = trimmed.substring('Reason:'.length).trim()
      }
    }
    
    // Push last pool
    if (poolNumber > 0 && currentPool.riskScore) {
      results.push(currentPool)
    }
    
    return results
  }
}

// Singleton instance
export const monadPoolMonitor = new MonadPoolMonitorScheduler()
