import { monitoringService } from '../monitoring/monitoring.service'
import type { ImpactAnalysisParams, ImpactAnalysis } from '../../types/market-context.types'

class ImpactAnalysisService {
  async analyzeImpact(params: ImpactAnalysisParams): Promise<ImpactAnalysis> {
    console.log('[Impact] Analyzing pool impact...', { protocol: params.protocol, amount: params.amountUSD })
    
    const pool = await this.getPoolData(params.protocol)
    
    if (!pool) {
      throw new Error(`Pool not found: ${params.protocol}`)
    }
    
    const impactPercent = (params.amountUSD / pool.liquidity) * 100
    
    let slippagePercent = 0
    
    if (impactPercent > 10) {
      slippagePercent = impactPercent * 0.5
    } else if (impactPercent > 5) {
      slippagePercent = impactPercent * 0.2
    } else if (impactPercent > 2) {
      slippagePercent = impactPercent * 0.1
    } else {
      slippagePercent = impactPercent * 0.05
    }
    
    const slippageUSD = params.amountUSD * (slippagePercent / 100)
    
    let recommendation: 'safe' | 'caution' | 'risky'
    let suggestedMaxSize: number | undefined
    let reasoning: string
    
    if (impactPercent < 2) {
      recommendation = 'safe'
      reasoning = `Trade is ${impactPercent.toFixed(2)}% of pool liquidity - minimal impact expected`
    } else if (impactPercent < 5) {
      recommendation = 'caution'
      reasoning = `Trade is ${impactPercent.toFixed(2)}% of pool liquidity - moderate slippage expected (~${slippagePercent.toFixed(2)}%)`
    } else {
      recommendation = 'risky'
      suggestedMaxSize = pool.liquidity * 0.05
      reasoning = `Trade is ${impactPercent.toFixed(2)}% of pool liquidity - HIGH slippage risk (~${slippagePercent.toFixed(2)}%). Consider reducing size to $${suggestedMaxSize.toLocaleString()}`
    }
    
    console.log('[Impact] Analysis complete:', {
      impactPercent: impactPercent.toFixed(2),
      recommendation,
      slippageUSD: slippageUSD.toFixed(2)
    })
    
    return {
      poolLiquidity: pool.liquidity,
      tradeSize: params.amountUSD,
      impactPercent: Math.round(impactPercent * 100) / 100,
      estimatedSlippageUSD: Math.round(slippageUSD * 100) / 100,
      recommendation,
      suggestedMaxSize,
      reasoning
    }
  }

  private async getPoolData(protocol: string): Promise<{ liquidity: number; volume24h: number } | null> {
    try {
      const metrics = await monitoringService.getProtocolMetrics()
      
      const nablaPool = metrics.nablaPools.find((p: any) => 
        p.id.toLowerCase() === protocol.toLowerCase() ||
        `nabla:${p.asset}`.toLowerCase() === protocol.toLowerCase()
      )
      
      if (nablaPool) {
        return {
          liquidity: (nablaPool as any).tvlUsd || 1000000,
          volume24h: (nablaPool as any).volume24hUsd || 0
        }
      }
      
      const uniswapPair = metrics.uniswapPairs.find((p: any) => 
        p.id.toLowerCase() === protocol.toLowerCase() ||
        `uniswap:${p.token0Symbol}-${p.token1Symbol}`.toLowerCase() === protocol.toLowerCase()
      )
      
      if (uniswapPair) {
        return {
          liquidity: ((uniswapPair as any).reserve0 + (uniswapPair as any).reserve1) || 1000000,
          volume24h: (uniswapPair as any).volume24hUsd || 0
        }
      }
      
      return null
    } catch (error) {
      console.error('[Impact] Failed to get pool data:', error)
      return null
    }
  }
}

export const impactAnalysisService = new ImpactAnalysisService()
