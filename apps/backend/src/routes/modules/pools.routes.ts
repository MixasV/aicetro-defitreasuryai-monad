import { Router, Request, Response } from 'express'
import { prisma } from '../../db/prisma'
import Joi from 'joi'
import { defiLlamaService } from '../../services/external/defi-llama.service'

const router = Router()

/**
 * Helper: Get mainnet pool history using DeFi Llama, snapshots, or approximation
 */
async function getMainnetHistory(pool: any, days: number, res: Response) {
  try {
    // PRIORITY 1: Try DeFi Llama historical data (for mainnet pools from DeFi Llama)
    if (pool.source === 'defillama' && pool.externalId) {
      try {
        const historyData = await defiLlamaService.getPoolHistoricalChart(pool.externalId, days)
        
        if (historyData.length > 0) {
          return res.json({
            poolId: pool.id,
            days,
            data: historyData,
            source: 'defillama-approximation'
          })
        }
      } catch (error) {
        console.error('[pools] DeFi Llama history error:', error)
        // Fall through to snapshots
      }
    }
    
    // PRIORITY 2: Try to get real snapshots
    const sinceTimestamp = new Date(Date.now() - days * 86400 * 1000)
    
    const snapshots = await prisma.poolSnapshot.findMany({
      where: {
        poolId: pool.id,
        timestamp: { gte: sinceTimestamp }
      },
      orderBy: { timestamp: 'asc' }
    })
    
    if (snapshots.length >= 2) {
      const dailyData: { [date: string]: { tvl: number; apy: number; volume: number; count: number } } = {}
      
      snapshots.forEach(snap => {
        const date = snap.timestamp.toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = { tvl: 0, apy: 0, volume: 0, count: 0 }
        }
        dailyData[date].tvl += snap.tvl
        dailyData[date].apy += snap.apy
        dailyData[date].volume += snap.volume24h
        dailyData[date].count += 1
      })
      
      const data = Object.entries(dailyData).map(([date, d]) => ({
        timestamp: Math.floor(new Date(date).getTime() / 1000),
        tvl: d.tvl / d.count,
        apy: d.apy / d.count,
        volume24h: d.volume / d.count
      }))
      
      return res.json({
        poolId: pool.id,
        days,
        data,
        source: 'snapshots'
      })
    }
    
    // PRIORITY 3: Fallback to approximation
    if (pool.apyPct7D !== null || pool.apyPct30D !== null) {
      const apyChange = days <= 7 ? (pool.apyPct7D || 0) : (pool.apyPct30D || 0)
      const currentAPY = pool.apy || 0
      const startAPY = currentAPY - apyChange
      
      const data = []
      for (let i = 0; i < days; i++) {
        const progress = i / (days - 1)
        const apy = startAPY + (apyChange * progress)
        const timestamp = Date.now() - ((days - 1 - i) * 86400 * 1000)
        
        data.push({
          timestamp: Math.floor(timestamp / 1000),
          tvl: pool.tvl,
          apy: Math.max(0, apy),
          volume24h: pool.volume24h || 0
        })
      }
      
      return res.json({
        poolId: pool.id,
        days,
        data,
        source: 'approximation'
      })
    }
    
    // No data available
    return res.json({
      poolId: pool.id,
      days,
      data: [],
      source: 'none',
      note: 'No historical data available yet'
    })
    
  } catch (error) {
    console.error('[pools] Error fetching mainnet history:', error)
    return res.status(500).json({ error: 'Failed to fetch mainnet history' })
  }
}

/**
 * GET /api/pools - Get all pools with pagination, filters, sorting
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      chain: Joi.string().optional(),
      category: Joi.string().optional(),
      sortBy: Joi.string().valid('tvl', 'apy', 'volume24h', 'createdAt', 'smart').default('tvl'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    })
    
    const { error, value } = schema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    
    const { page, limit, chain, category, sortBy, order } = value
    const skip = (page - 1) * limit
    
    // Build where clause
    // Note: Monad testnet has low swap activity (last swaps 30+ hours ago)
    // Filter by TVL instead of volume for Monad to show available pools
    const isShowingAllChains = !chain || chain === 'all'
    const isMonadOnly = chain === 'Monad'
    
    const where: any = {
      isActive: true,
      apy: { gte: 0.5 },  // Only show pools with APY >= 0.5%
      // Filter pools: Other chains by volume, Monad by TVL (testnet has low activity)
      OR: [
        { chain: { not: 'Monad' }, volume24h: { gte: 100000 } }, // Other chains: $100K min volume
        { chain: 'Monad', tvl: { gte: 1000000 } }  // Monad: $1M min TVL (testnet inactive)
      ]
    }
    
    if (chain && chain !== 'all') {
      where.chain = chain
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    // Get total count
    const total = await prisma.pool.count({ where })
    
    // Get pools with smart sorting
    let pools
    
    if (sortBy === 'smart') {
      // SMART SORT: Monad first, then by AI Score (high to low), pools without AI Score last
      const allPools = await prisma.pool.findMany({
        where,
        select: {
          id: true,
          protocol: true,
          chain: true,
          source: true,
          address: true,
          asset: true,
          category: true,
          tvl: true,
          apy: true,
          volume24h: true,
          apyPct1D: true,
          apyPct7D: true,
          apyPct30D: true,
          riskScore: true,
          aiScore: true,
          lastAnalyzedAt: true,
          createdAt: true
        }
      })
      
      // Sort: 1) Monad ALWAYS first (regardless of aiScore), 2) By aiScore DESC, 3) Pools without aiScore last
      const sorted = allPools.sort((a, b) => {
        // ⚠️ CRITICAL: Monad pools ALWAYS first (hackathon requirement!)
        const aIsMonad = a.chain === 'Monad'
        const bIsMonad = b.chain === 'Monad'
        
        if (aIsMonad && !bIsMonad) return -1
        if (!aIsMonad && bIsMonad) return 1
        
        // Both Monad: sort by TVL (highest first)
        if (aIsMonad && bIsMonad) {
          return b.tvl - a.tvl
        }
        
        // Both non-Monad: sort by aiScore
        const aScore = a.aiScore ?? -1
        const bScore = b.aiScore ?? -1
        
        // Pools with aiScore before pools without
        if (aScore >= 0 && bScore < 0) return -1
        if (aScore < 0 && bScore >= 0) return 1
        
        // Both have scores: higher first
        if (aScore !== bScore) return bScore - aScore
        
        // Same score or both null: by TVL
        return b.tvl - a.tvl
      })
      
      pools = sorted.slice(skip, skip + limit)
    } else {
      // Regular sorting
      pools = await prisma.pool.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limit,
        select: {
          id: true,
          protocol: true,
          chain: true,
          source: true,
          address: true,
          asset: true,
          category: true,
          tvl: true,
          apy: true,
          volume24h: true,
          apyPct1D: true,
          apyPct7D: true,
          apyPct30D: true,
          riskScore: true,
          aiScore: true,
          lastAnalyzedAt: true,
          createdAt: true
        }
      })
    }
    
    const totalPages = Math.ceil(total / limit)
    
    res.json({
      pools,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
    
  } catch (error) {
    console.error('[pools] Error fetching pools:', error)
    res.status(500).json({ error: 'Failed to fetch pools' })
  }
})

/**
 * GET /api/pools/:poolId/history - Get pool historical data (7/30 days)
 */
router.get('/:poolId/history', async (req: Request, res: Response) => {
  try {
    const poolId = decodeURIComponent(req.params.poolId)
    const { days = 7 } = req.query
    
    const daysNum = parseInt(days as string, 10)
    const sinceTimestamp = Math.floor(Date.now() / 1000) - (daysNum * 86400)
    
    // Get pool from database
    const pool = await prisma.pool.findUnique({ where: { id: poolId } })
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' })
    }
    
    // For Monad pools (source='envio'), use PoolTransaction data
    if (pool.source === 'envio' && pool.envioPoolId) {
      try {
        const envioPoolQuery = await fetch(`${process.env.ENVIO_GRAPHQL_URL || 'http://hasura:8080/v1/graphql'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPoolHistory($poolId: String!, $since: numeric!) {
                PoolTransaction(
                  where: { pool_id: { _eq: $poolId }, timestamp: { _gte: $since } }
                  order_by: { timestamp: asc }
                ) {
                  timestamp
                  transactionType
                  amount0
                  amount1
                }
              }
            `,
            variables: {
              poolId: pool.envioPoolId,
              since: sinceTimestamp
            }
          })
        })
        
        const data = await envioPoolQuery.json()
        
        if (data.errors) {
          console.error('[pools] Envio GraphQL error:', data.errors)
        } else if (data.data?.PoolTransaction) {
          // Process transactions into daily data
          const transactions = data.data.PoolTransaction
          const dailyData: { [date: string]: { swapCount: number; addCount: number; removeCount: number } } = {}
          
          transactions.forEach((tx: any) => {
            const date = new Date(tx.timestamp * 1000).toISOString().split('T')[0]
            if (!dailyData[date]) {
              dailyData[date] = { swapCount: 0, addCount: 0, removeCount: 0 }
            }
            
            if (tx.transactionType === 'Swap') dailyData[date].swapCount++
            if (tx.transactionType === 'Mint') dailyData[date].addCount++
            if (tx.transactionType === 'Burn') dailyData[date].removeCount++
          })
          
          const result = Object.entries(dailyData).map(([date, d]) => ({
            timestamp: Math.floor(new Date(date).getTime() / 1000),
            tvl: pool.tvl,
            apy: pool.apy,
            volume24h: pool.volume24h || 0,
            swapCount: d.swapCount,
            addCount: d.addCount,
            removeCount: d.removeCount
          }))
          
          return res.json({
            poolId: pool.id,
            days: daysNum,
            data: result,
            source: 'envio-real'
          })
        }
      } catch (error) {
        console.error('[pools] Envio fetch error:', error)
        // Fall through to mainnet history
      }
    }
    
    // For mainnet pools: use DeFi Llama, snapshots, or approximation
    return getMainnetHistory(pool, daysNum, res)
    
  } catch (error) {
    console.error('[pools] Error fetching pool history:', error)
    res.status(500).json({ error: 'Failed to fetch pool history' })
  }
})

/**
 * GET /api/pools/:poolId/transactions
 * Get recent transactions for a specific pool
 */
router.get('/:poolId/transactions', async (req: Request, res: Response) => {
  try {
    const { poolId } = req.params
    const { limit = 10 } = req.query
    
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 100)
    
    // Get pool from database
    const pool = await prisma.pool.findUnique({ where: { id: poolId } })
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' })
    }
    
    // For Monad pools (source='envio'), query PoolTransaction from Envio
    if (pool.source === 'envio' && pool.envioPoolId) {
      try {
        const envioQuery = await fetch(`${process.env.ENVIO_GRAPHQL_URL || 'http://hasura:8080/v1/graphql'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPoolTransactions($poolId: String!, $limit: Int!) {
                PoolTransaction(
                  where: { pool_id: { _eq: $poolId } }
                  order_by: { timestamp: desc }
                  limit: $limit
                ) {
                  id
                  transactionHash
                  transactionType
                  amount0
                  amount1
                  sender
                  timestamp
                }
              }
            `,
            variables: {
              poolId: pool.envioPoolId,
              limit: limitNum
            }
          })
        })
        
        const data = await envioQuery.json()
        
        if (data.errors) {
          console.error('[pools] Envio GraphQL error:', data.errors)
          return res.json({
            success: true,
            transactions: [],
            source: 'envio',
            note: 'Envio GraphQL error - check logs'
          })
        }
        
        if (data.data?.PoolTransaction) {
          const transactions = data.data.PoolTransaction.map((tx: any) => ({
            id: tx.id,
            hash: tx.transactionHash,
            type: tx.transactionType,
            amount0: tx.amount0,
            amount1: tx.amount1,
            sender: tx.sender,
            timestamp: tx.timestamp,
            date: new Date(tx.timestamp * 1000).toISOString()
          }))
          
          return res.json({
            success: true,
            poolId: pool.id,
            transactions,
            source: 'envio',
            count: transactions.length
          })
        }
      } catch (error) {
        console.error('[pools] Error fetching Envio transactions:', error)
        // Fall through to empty response
      }
    }
    
    // For mainnet pools (source='defillama'), no transaction data available
    return res.json({
      success: true,
      poolId: pool.id,
      transactions: [],
      source: pool.source,
      note: pool.source === 'defillama' 
        ? 'Transaction history not available for mainnet pools (DeFi Llama source)' 
        : 'No transactions indexed yet'
    })
    
  } catch (error) {
    console.error('[pools] Error fetching pool transactions:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch pool transactions' 
    })
  }
})

/**
 * GET /api/pools/monad-available - Get Monad pools grouped by protocol (for wizard)
 */
router.get('/monad-available', async (req: Request, res: Response) => {
  try {
    const monadPools = await prisma.pool.findMany({
      where: {
        chain: 'Monad',
        isActive: true,
        tvl: { gte: 1000000 },
        apy: { gte: 0.5 }  // Only show pools with APY >= 0.5%
      },
      select: {
        id: true,
        protocol: true,
        asset: true,
        apy: true,
        tvl: true,
        volume24h: true,
        riskScore: true,
        category: true
      }
    })
    
    // Group by protocol
    const protocolMap: { [key: string]: any[] } = {}
    monadPools.forEach(pool => {
      if (!protocolMap[pool.protocol]) {
        protocolMap[pool.protocol] = []
      }
      protocolMap[pool.protocol].push(pool)
    })
    
    // Calculate stats per protocol
    const byProtocol = Object.entries(protocolMap).map(([protocol, pools]) => {
      const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length
      const minRisk = Math.min(...pools.map(p => p.riskScore || 5))
      const maxRisk = Math.max(...pools.map(p => p.riskScore || 5))
      
      return {
        protocol,
        avgApy,
        minRisk,
        maxRisk,
        pools
      }
    })
    
    res.json({
      total: monadPools.length,
      byProtocol,
      pools: monadPools
    })
    
  } catch (error) {
    console.error('[pools] Error fetching Monad pools:', error)
    res.status(500).json({ error: 'Failed to fetch Monad pools' })
  }
})

/**
 * GET /api/pools/top-for-ai
 * Returns pools for AI analysis:
 * - Monad Testnet: ONLY pools with volume >0 (executable)
 * - Mainnet: TOP-10 by aiScore (advisory only for comparison)
 * 
 * IMPORTANT: This specific route MUST be before /:poolId to avoid conflict!
 */
router.get('/top-for-ai', async (req: Request, res: Response) => {
  try {
    const schema = Joi.object({
      accountAddress: Joi.string().optional(),
      includeMainnet: Joi.boolean().default(true)
    })

    const { error, value } = schema.validate(req.query)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const { includeMainnet } = value

    // 1. Monad pools (executable) - NO volume filter for testnet!
    // Monad Testnet may have low/zero volume but pools are still usable
    const monadPools = await prisma.pool.findMany({
      where: {
        chain: 'Monad',
        isActive: true,
        tvl: { gte: 100000 },  // Min $100K TVL (shows liquidity exists)
        apy: { gte: 0.5 }  // Only show pools with APY >= 0.5%
      },
      select: {
        id: true,
        protocol: true,
        chain: true,
        address: true,
        asset: true,
        apy: true,
        tvl: true,
        volume24h: true,
        riskScore: true,
        aiScore: true,
        category: true
      },
      orderBy: { tvl: 'desc' }
    })

    // 2. TOP-10 mainnet by aiScore (advisory only)
    let mainnetTop10: any[] = []
    if (includeMainnet) {
      mainnetTop10 = await prisma.pool.findMany({
        where: {
          chain: { not: 'Monad' },
          isActive: true,
          apy: { gte: 0.5 },  // Only show pools with APY >= 0.5%
          aiScore: { not: null },
          tvl: { gte: 1000000 }  // Only pools with TVL >$1M
        },
        select: {
          id: true,
          protocol: true,
          chain: true,
          asset: true,
          apy: true,
          tvl: true,
          volume24h: true,
          riskScore: true,
          aiScore: true,
          category: true
        },
        orderBy: { aiScore: 'desc' },
        take: 10  // TOP-10 by AI score
      })
    }

    return res.json({
      monad: {
        count: monadPools.length,
        pools: monadPools,
        note: 'Executable pools on Monad Testnet (TVL >= $100K) - volume may be low on testnet'
      },
      mainnetTop10: {
        count: mainnetTop10.length,
        pools: mainnetTop10,
        note: 'TOP-10 mainnet pools by AI score (advisory only - cannot execute)'
      },
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('[pools] Failed to get top pools for AI:', error)
    return res.status(500).json({ error: 'Failed to fetch pools for AI' })
  }
})

/**
 * GET /api/pools/:poolId - Get single pool details
 * 
 * IMPORTANT: This route MUST be AFTER /top-for-ai to avoid catching it!
 */
router.get('/:poolId', async (req: Request, res: Response) => {
  try {
    const poolId = decodeURIComponent(req.params.poolId)
    
    const pool = await prisma.pool.findUnique({
      where: { id: poolId }
    })
    
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' })
    }
    
    res.json({ pool })
    
  } catch (error) {
    console.error('[pools] Error fetching pool:', error)
    res.status(500).json({ error: 'Failed to fetch pool' })
  }
})

export default router
