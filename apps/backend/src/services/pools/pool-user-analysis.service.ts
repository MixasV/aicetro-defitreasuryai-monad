import { prisma } from '../../db/prisma'
import { logger } from '../../config/logger'
import axios from 'axios'
import { env } from '../../config/env'

interface PoolUserAnalysisResult {
  shouldAdd: boolean
  reason: string
  riskLevel: 'low' | 'medium' | 'high'
  detailedAnalysis?: string
  cached: boolean
}

export class PoolUserAnalysisService {
  /**
   * Analyze if user should add pool to whitelist
   * Returns cached result if available and not expired
   */
  async analyzePoolForUser(
    poolId: string,
    userAddress: string,
    type: 'simple' | 'detailed' = 'simple'
  ): Promise<PoolUserAnalysisResult> {
    // Check cache first
    const cached = await this.getCachedAnalysis(poolId, userAddress, type)
    if (cached) {
      logger.info(`[PoolUserAnalysis] Cache hit for pool ${poolId}, user ${userAddress}`)
      return {
        shouldAdd: cached.shouldAdd,
        reason: cached.reason,
        riskLevel: cached.riskLevel as 'low' | 'medium' | 'high',
        detailedAnalysis: cached.detailedAnalysis || undefined,
        cached: true
      }
    }

    // Get pool data
    const pool = await prisma.pool.findUnique({
      where: { id: poolId }
    })

    if (!pool) {
      throw new Error(`Pool ${poolId} not found`)
    }

    // Get user delegation
    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      throw new Error(`No active delegation for user ${userAddress}`)
    }

    // Get user's current whitelist
    const whitelistedPools = await prisma.pool.findMany({
      where: {
        id: { in: delegation.whitelist }
      },
      select: {
        protocol: true,
        chain: true,
        asset: true
      }
    })

    // Build AI prompt
    const prompt = type === 'simple'
      ? this.buildSimplePrompt(pool, delegation, whitelistedPools)
      : this.buildDetailedPrompt(pool, delegation, whitelistedPools)

    // Call AI
    const aiResponse = await this.callOpenRouter(prompt, type)

    // Parse response
    const analysis = this.parseAIResponse(aiResponse, type)

    // Cache result (1 hour)
    await this.cacheAnalysis(poolId, userAddress, type, analysis)

    logger.info(`[PoolUserAnalysis] Analysis complete for pool ${poolId}, user ${userAddress}`)

    return {
      ...analysis,
      cached: false
    }
  }

  /**
   * Get cached analysis if valid
   */
  private async getCachedAnalysis(
    poolId: string,
    userAddress: string,
    type: 'simple' | 'detailed'
  ) {
    const analysis = await prisma.poolUserAnalysis.findUnique({
      where: {
        poolId_userAddress_analysisType: {
          poolId,
          userAddress: userAddress.toLowerCase(),
          analysisType: type
        }
      }
    })

    if (!analysis) {
      return null
    }

    // Check if expired
    if (analysis.validUntil < new Date()) {
      logger.info(`[PoolUserAnalysis] Cache expired for pool ${poolId}`)
      return null
    }

    return analysis
  }

  /**
   * Cache analysis result
   */
  private async cacheAnalysis(
    poolId: string,
    userAddress: string,
    type: 'simple' | 'detailed',
    analysis: { shouldAdd: boolean; reason: string; riskLevel: string; detailedAnalysis?: string }
  ) {
    const validUntil = new Date()
    validUntil.setHours(validUntil.getHours() + 1) // 1 hour cache

    await prisma.poolUserAnalysis.upsert({
      where: {
        poolId_userAddress_analysisType: {
          poolId,
          userAddress: userAddress.toLowerCase(),
          analysisType: type
        }
      },
      update: {
        shouldAdd: analysis.shouldAdd,
        reason: analysis.reason,
        riskLevel: analysis.riskLevel,
        detailedAnalysis: analysis.detailedAnalysis,
        validUntil,
        updatedAt: new Date()
      },
      create: {
        poolId,
        userAddress: userAddress.toLowerCase(),
        analysisType: type,
        shouldAdd: analysis.shouldAdd,
        reason: analysis.reason,
        riskLevel: analysis.riskLevel,
        detailedAnalysis: analysis.detailedAnalysis,
        validUntil
      }
    })
  }

  /**
   * Build simple AI prompt
   */
  private buildSimplePrompt(pool: any, delegation: any, whitelistedPools: any[]): string {
    const whitelistText = whitelistedPools.length > 0
      ? whitelistedPools.map(p => `${p.protocol} ${p.asset} on ${p.chain}`).join(', ')
      : 'None'

    return `You are a DeFi treasury advisor. A user wants to know if they should add this pool to their AI agent's whitelist.

POOL TO ANALYZE:
- Protocol: ${pool.protocol}
- Asset: ${pool.asset}
- Chain: ${pool.chain}
- APY: ${pool.apy}%
- TVL: $${(pool.tvl / 1e6).toFixed(1)}M
- Risk Score: ${pool.riskScore || 'Not rated'}/5
- AI Score: ${pool.aiScore || 'Not rated'}/100
- Category: ${pool.category}

IMPORTANT: Evaluate this pool OBJECTIVELY based on its metrics, risk, and suitability. 
DO NOT consider the user's current whitelist - different users have different strategies.

USER CONTEXT:
- Max Risk Tolerance: ${delegation.caveats?.maxRiskScore || 3}/5
- Daily Limit: $${delegation.dailyLimitUsd}

QUESTION: Should a user add this pool to their AI whitelist for automated trading?

Answer in this EXACT format:
RECOMMENDATION: [YES or NO]
RISK_LEVEL: [low or medium or high]
REASON: [One clear paragraph explaining your recommendation, max 100 words]

Focus on:
1. Risk compatibility with user's tolerance
2. Pool quality and safety
3. Diversification benefit
4. Any red flags or concerns`
  }

  /**
   * Build detailed AI prompt
   */
  private buildDetailedPrompt(pool: any, delegation: any, whitelistedPools: any[]): string {
    const whitelistText = whitelistedPools.length > 0
      ? whitelistedPools.map(p => `${p.protocol} ${p.asset} on ${p.chain}`).join(', ')
      : 'None'

    return `You are a senior DeFi portfolio advisor. Provide a comprehensive analysis of whether this user should add this pool to their AI trading whitelist.

POOL DETAILS:
- Protocol: ${pool.protocol}
- Asset: ${pool.asset}
- Chain: ${pool.chain}
- APY: ${pool.apy}%
- TVL: $${(pool.tvl / 1e6).toFixed(1)}M
- 24h Volume: $${pool.volume24h ? (pool.volume24h / 1e6).toFixed(1) + 'M' : 'N/A'}
- Risk Score: ${pool.riskScore || 'Not rated'}/5
- AI Score: ${pool.aiScore || 'Not rated'}/100
- Category: ${pool.category}
- Source: ${pool.source}

IMPORTANT: Provide OBJECTIVE analysis of this pool based ONLY on its metrics, risk, and fundamentals.
DO NOT factor in the user's current whitelist - each pool should be evaluated independently.

USER RISK PARAMETERS:
- Risk Tolerance: ${delegation.caveats?.maxRiskScore || 3}/5
- Daily Trading Limit: $${delegation.dailyLimitUsd}
- Allowed Networks: ${delegation.caveats?.selectedNetworks?.filter((n: any) => n.enabled).map((n: any) => n.name).join(', ') || 'Monad Testnet'}

PROVIDE DETAILED ANALYSIS IN THIS FORMAT:

RECOMMENDATION: [YES or NO]
RISK_LEVEL: [low or medium or high]

EXECUTIVE SUMMARY:
[2-3 sentences: Quick summary of your recommendation]

KEY STRENGTHS:
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

KEY RISKS:
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

PORTFOLIO FIT:
[2-3 sentences: How does this pool fit with user's current portfolio and risk profile?]

RECOMMENDATION DETAILS:
[2-3 paragraphs: Detailed reasoning for your recommendation, including specific numbers and comparisons]

Be honest and thorough. If you see red flags, call them out clearly.`
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(prompt: string, type: 'simple' | 'detailed'): Promise<string> {
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
              content: type === 'simple'
                ? 'You are a concise DeFi advisor. Answer directly and clearly.'
                : 'You are a senior DeFi portfolio advisor. Provide comprehensive analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: type === 'simple' ? 500 : 2000
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
      logger.error({ error }, '[PoolUserAnalysis] OpenRouter API call failed')
      throw error
    }
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(
    aiResponse: string,
    type: 'simple' | 'detailed'
  ): { shouldAdd: boolean; reason: string; riskLevel: 'low' | 'medium' | 'high'; detailedAnalysis?: string } {
    try {
      // Extract recommendation
      const recommendMatch = aiResponse.match(/RECOMMENDATION:\s*(YES|NO)/i)
      const shouldAdd = recommendMatch?.[1]?.toUpperCase() === 'YES'

      // Extract risk level
      const riskMatch = aiResponse.match(/RISK_LEVEL:\s*(low|medium|high)/i)
      const riskLevel = (riskMatch?.[1]?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high'

      // Extract reason (everything after REASON:)
      let reason: string
      let detailedAnalysis: string | undefined

      if (type === 'simple') {
        const reasonMatch = aiResponse.match(/REASON:\s*(.+)/is)
        reason = reasonMatch?.[1]?.trim() || aiResponse
      } else {
        // For detailed, use executive summary as reason
        const summaryMatch = aiResponse.match(/EXECUTIVE SUMMARY:\s*(.+?)(?=\n\n|KEY STRENGTHS:)/is)
        reason = summaryMatch?.[1]?.trim() || 'See detailed analysis below'
        detailedAnalysis = aiResponse // Store full response
      }

      return {
        shouldAdd,
        reason: reason.substring(0, 500), // Limit reason length
        riskLevel,
        detailedAnalysis
      }
    } catch (error) {
      logger.error({ error, aiResponse }, '[PoolUserAnalysis] Failed to parse AI response')
      
      // Fallback
      return {
        shouldAdd: false,
        reason: 'Unable to analyze pool at this time. Please try again later.',
        riskLevel: 'high'
      }
    }
  }

  /**
   * Clear expired cache entries (maintenance)
   */
  async clearExpiredCache(): Promise<number> {
    const result = await prisma.poolUserAnalysis.deleteMany({
      where: {
        validUntil: {
          lt: new Date()
        }
      }
    })

    logger.info(`[PoolUserAnalysis] Cleared ${result.count} expired cache entries`)
    return result.count
  }
}

export const poolUserAnalysisService = new PoolUserAnalysisService()
