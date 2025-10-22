import { prisma } from '../db/prisma'
import { logger } from '../config/logger'
import axios from 'axios'
import { env } from '../config/env'

interface PoolAnalysisResult {
  poolNumber: number
  riskScore: number
  aiScore: number
  reason: string
}

export class AIPoolAnalysisScheduler {
  private handle: NodeJS.Timeout | null = null
  private running = false
  private enabled = false
  private readonly intervalMs: number
  
  constructor(intervalMs = 30 * 60 * 1000) { // Default: 30 minutes
    this.intervalMs = intervalMs
  }
  
  start(): boolean {
    if (this.enabled) {
      logger.warn('[AIPoolAnalysis] Already started')
      return false
    }
    
    this.enabled = true
    this.handle = setInterval(() => {
      void this.analyzeBatch()
    }, this.intervalMs)
    
    logger.info({ intervalMs: this.intervalMs }, '[AIPoolAnalysis] Scheduler started')
    
    // Run first batch immediately (don't await to not block)
    void this.analyzeBatch()
    
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
    logger.info('[AIPoolAnalysis] Scheduler stopped')
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
   * Analyze next batch of pools
   */
  async analyzeBatch(): Promise<{ analyzed: number, errors: number }> {
    if (this.running) {
      logger.warn('[AIPoolAnalysis] Previous batch still running, skipping')
      return { analyzed: 0, errors: 0 }
    }
    
    this.running = true
    const startTime = Date.now()
    
    try {
      // Get next 80 pools to analyze (reduced from 100 to avoid timeout)
      const pools = await this.getNextBatchToAnalyze(80)
      
      if (pools.length === 0) {
        logger.info('[AIPoolAnalysis] No pools need analysis')
        return { analyzed: 0, errors: 0 }
      }
      
      logger.info(`[AIPoolAnalysis] Analyzing batch of ${pools.length} pools...`)
      
      // Build AI prompt
      const prompt = this.buildBatchPrompt(pools)
      
      // Call AI service
      const batchId = this.generateBatchId()
      const aiResponse = await this.callOpenRouter(prompt)
      
      // Parse results
      const results = this.parseAIResponse(aiResponse)
      
      // Update database
      let analyzed = 0
      let errors = 0
      
      for (const result of results) {
        try {
          const pool = pools[result.poolNumber - 1]
          if (!pool) {
            logger.warn(`[AIPoolAnalysis] Pool number ${result.poolNumber} not found in batch`)
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
        } catch (error) {
          logger.error({ error, result }, '[AIPoolAnalysis] Failed to update pool')
          errors++
        }
      }
      
      // Log analysis
      await this.logAnalysis({
        batchId,
        poolCount: pools.length,
        durationMs: Date.now() - startTime,
        analyzed,
        errors
      })
      
      logger.info(`[AIPoolAnalysis] Batch complete: ${analyzed} analyzed, ${errors} errors`)
      
      return { analyzed, errors }
    } catch (error) {
      logger.error({ error }, '[AIPoolAnalysis] Batch analysis failed')
      return { analyzed: 0, errors: 0 }
    } finally {
      this.running = false
    }
  }
  
  /**
   * Get next batch of pools to analyze (SMART PRIORITIZATION)
   */
  private async getNextBatchToAnalyze(limit: number) {
    const now = new Date()
    
    return await prisma.pool.findMany({
      where: {
        isActive: true,
        OR: [
          // Tier 1: User positions + Monad active pools (HIGHEST priority - every 5 minutes)
          // Case 1: User positions, never analyzed
          {
            hasUserPositions: true,
            lastAnalyzedAt: null
          },
          // Case 2: User positions, analyzed > 5 min ago
          {
            hasUserPositions: true,
            lastAnalyzedAt: {
              lt: new Date(now.getTime() - 5 * 60 * 1000)
            }
          },
          // Case 3: Monad active pools, never analyzed
          {
            chain: 'Monad',
            volume24h: { gte: 100_000 },
            lastAnalyzedAt: null
          },
          // Case 4: Monad active pools, analyzed > 5 min ago
          {
            chain: 'Monad',
            volume24h: { gte: 100_000 },
            lastAnalyzedAt: {
              lt: new Date(now.getTime() - 5 * 60 * 1000)
            }
          },
          
          // Tier 2: Very high TVL (TVL > $10M - every 15 minutes)
          {
            tvl: { gt: 10_000_000 },
            OR: [
              { lastAnalyzedAt: null },
              {
                lastAnalyzedAt: {
                  lt: new Date(now.getTime() - 15 * 60 * 1000) // 15 min ago
                }
              }
            ]
          },
          
          // Tier 3: High TVL (TVL $1M-$10M - every 30 minutes)
          {
            tvl: { gte: 1_000_000, lte: 10_000_000 },
            OR: [
              { lastAnalyzedAt: null },
              {
                lastAnalyzedAt: {
                  lt: new Date(now.getTime() - 30 * 60 * 1000) // 30 min ago
                }
              }
            ]
          },
          
          // Tier 4: Medium TVL with activity (TVL $100K-$1M, volume > 0 - every 1 hour)
          {
            tvl: { gte: 100_000, lt: 1_000_000 },
            volume24h: { gt: 0 },
            OR: [
              { lastAnalyzedAt: null },
              {
                lastAnalyzedAt: {
                  lt: new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
                }
              }
            ]
          },
          
          // Tier 5: "Dead" pools (volume = 0 - batched over 24 hours, ~220 pools/hour)
          // This ensures we analyze all dead pools once per day, but spread out
          {
            volume24h: { equals: 0 },
            OR: [
              { lastAnalyzedAt: null },
              {
                lastAnalyzedAt: {
                  lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
                }
              }
            ]
          }
        ]
      },
      orderBy: [
        { hasUserPositions: 'desc' },  // User pools first
        { tvl: 'desc' },                // Then by TVL
        { lastAnalyzedAt: 'asc' }      // Then by staleness
      ],
      take: limit
    })
  }
  
  /**
   * Build AI prompt for batch analysis
   */
  private buildBatchPrompt(pools: any[]): string {
    const poolsList = pools.map((p, i) => `
${i + 1}. ${p.protocol} ${p.asset} (${p.chain})
   Address: ${p.address}
   TVL: $${(p.tvl / 1e6).toFixed(1)}M
   APY: ${p.apy.toFixed(2)}%
   Volume 24h: $${((p.volume24h || 0) / 1e6).toFixed(1)}M
   Category: ${p.category}
`).join('\n')
    
    return `You are a DeFi investment analyst. Analyze these ${pools.length} pools for investment potential.

POOLS TO ANALYZE:
${poolsList}

For EACH pool, provide:
1. **Risk Score** (1-5):
   - 1 = Very Safe (blue-chip, battle-tested, high TVL)
   - 2 = Safe (established protocol, good track record)
   - 3 = Medium (newer protocol or moderate risk)
   - 4 = High (experimental, low TVL, or volatile)
   - 5 = Very High (unaudited, extremely risky)

2. **AI Score** (0-100):
   - Consider: Protocol reputation, TVL size, APY sustainability, smart contract security
   - Higher score = better investment opportunity
   - 90-100: Excellent
   - 80-89: Very Good
   - 70-79: Good
   - 60-69: Fair
   - 50-59: Poor
   - <50: Avoid

3. **Reason** (max 30 words):
   - Brief explanation for your scores
   - Focus on key factors

IMPORTANT CONSIDERATIONS:
- Blue-chip protocols (Aave, Compound, Uniswap) = lower risk
- High TVL (>$100M) = more stable
- Sustainable APY (5-15%) = realistic for stablecoins
- Extremely high APY (>50%) = likely unsustainable or risky
- Low TVL (<$1M) = higher risk of rug pull

OUTPUT FORMAT (CSV only, no headers):
pool_number,risk_score,ai_score,reason

EXAMPLE:
1,2,85,Blue-chip Aave with $500M TVL and sustainable 8% APY
2,4,45,Small protocol with low TVL and unsustainable 120% APY

Now analyze all ${pools.length} pools:`
  }
  
  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(prompt: string): Promise<string> {
    const provider = env.openRouterProviders[0]
    const apiKey = provider.apiKey || env.openRouterKey
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured')
    }
    
    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: 'You are a DeFi investment analyst. Respond strictly in CSV format as specified.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: env.openRouterTimeoutMs
        }
      )
      
      const content = response.data?.choices?.[0]?.message?.content
      
      if (!content) {
        throw new Error('OpenRouter returned empty response')
      }
      
      return content
    } catch (error) {
      logger.error({ error }, '[AIPoolAnalysis] OpenRouter API call failed')
      throw error
    }
  }
  
  /**
   * Parse AI response (CSV format)
   */
  private parseAIResponse(response: string): PoolAnalysisResult[] {
    const lines = response.trim().split('\n')
    const results: PoolAnalysisResult[] = []
    
    for (const line of lines) {
      // Skip empty lines and headers
      if (!line.trim() || line.toLowerCase().includes('pool_number')) continue
      
      try {
        // Parse CSV: pool_number,risk_score,ai_score,reason
        const match = line.match(/^(\d+),(\d+),(\d+(?:\.\d+)?),(.+)$/)
        if (!match) continue
        
        const [, poolNum, risk, score, reason] = match
        
        results.push({
          poolNumber: parseInt(poolNum, 10),
          riskScore: Math.min(Math.max(parseInt(risk, 10), 1), 5),
          aiScore: Math.min(Math.max(parseFloat(score), 0), 100),
          reason: reason.trim().substring(0, 200) // Limit to 200 chars
        })
      } catch (error) {
        logger.warn({ error, line }, '[AIPoolAnalysis] Failed to parse line')
      }
    }
    
    return results
  }
  
  /**
   * Log analysis to database
   */
  private async logAnalysis(data: {
    batchId: string
    poolCount: number
    durationMs: number
    analyzed: number
    errors: number
  }): Promise<void> {
    try {
      await prisma.poolAnalysisLog.create({
        data: {
          batchId: data.batchId,
          poolCount: data.poolCount,
          modelUsed: env.openRouterProviders[0].model,
          durationMs: data.durationMs,
          errorMessage: data.errors > 0 ? `${data.errors} pools failed to update` : null
        }
      })
    } catch (error) {
      logger.error({ error }, '[AIPoolAnalysis] Failed to log analysis')
    }
  }
  
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}

export const aiPoolAnalysisScheduler = new AIPoolAnalysisScheduler()
