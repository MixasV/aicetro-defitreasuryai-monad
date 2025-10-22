import axios from 'axios'
import { prisma } from '../../db/prisma'
import { logger } from '../../config/logger'
import { envioClient } from '../monitoring/envio.client'
import { tokenMetadataService } from './token-metadata.service'

interface DefiLlamaPool {
  pool: string // Unique ID
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase?: number
  apyReward?: number
  volumeUsd1d?: number
  volumeUsd7d?: number
  apyPct1D?: number
  apyPct7D?: number
  apyPct30D?: number
}

interface EnvioPool {
  id: string
  protocol: string
  poolAddress: string
  poolType: string
  asset: string | null
  token0: string | null
  token0Address: string | null
  token1: string | null
  token1Address: string | null
  totalDeposits: string
  totalWithdrawals: string
  totalSwapVolume: string
  reserve0: string | null
  reserve1: string | null
  createdAt?: number  // Unix timestamp when pool was created
  lastActivityAt?: number  // Unix timestamp of last activity
}

export class PoolDiscoveryService {
  private readonly DEFILLAMA_URL = 'https://yields.llama.fi/pools'
  private readonly SYNC_INTERVAL = 15 * 60 * 1000 // 15 minutes
  
  /**
   * Sync pools from DeFi Llama API
   * Runs every 15 minutes
   */
  async syncDefiLlamaPools(): Promise<{ synced: number, errors: number }> {
    logger.info('[PoolDiscovery] Starting DeFi Llama sync...')
    
    try {
      // Fetch all pools from DeFi Llama
      const response = await axios.get<{ data?: DefiLlamaPool[] }>(this.DEFILLAMA_URL, {
        timeout: 30000
      })
      
      const pools = response.data?.data || []
      logger.info(`[PoolDiscovery] Fetched ${pools.length} pools from DeFi Llama`)
      
      // Filter relevant pools (min TVL, reasonable APY, supported chains)
      const filtered = pools.filter(p => 
        p.tvlUsd > 100_000 && // Min $100K TVL
        p.apy > 0 && p.apy < 200 && // Reasonable APY (0-200%)
        ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon', 'Monad'].includes(p.chain)
      )
      
      logger.info(`[PoolDiscovery] Filtered to ${filtered.length} relevant pools`)
      
      // Batch upsert (chunks of 100 to avoid timeouts)
      let synced = 0
      let errors = 0
      
      for (let i = 0; i < filtered.length; i += 100) {
        const chunk = filtered.slice(i, i + 100)
        
        try {
          await this.upsertPoolsBatch(chunk)
          synced += chunk.length
          logger.info(`[PoolDiscovery] Synced batch ${Math.floor(i / 100) + 1}: ${chunk.length} pools`)
        } catch (error) {
          logger.error({ error, chunk: i / 100 }, '[PoolDiscovery] Batch upsert failed')
          errors += chunk.length
        }
      }
      
      logger.info(`[PoolDiscovery] DeFi Llama sync complete: ${synced} synced, ${errors} errors`)
      
      return { synced, errors }
    } catch (error) {
      logger.error({ error }, '[PoolDiscovery] Failed to sync DeFi Llama pools')
      throw error
    }
  }
  
  /**
   * Upsert a batch of pools from DeFi Llama
   * Also creates historical snapshots for chart building
   */
  private async upsertPoolsBatch(pools: DefiLlamaPool[]): Promise<void> {
    const operations = pools.map(p => {
      const id = this.generatePoolId(p.project, p.chain, p.symbol, p.pool)
      
      return prisma.pool.upsert({
        where: { id },
        create: {
          id,
          protocol: p.project,
          chain: p.chain,
          asset: p.symbol,
          address: p.pool, // DeFi Llama uses pool ID as address
          category: this.inferCategory(p.symbol),
          apy: p.apy,
          tvl: p.tvlUsd,
          volume24h: p.volumeUsd1d || 0,
          // Additional metrics for chart approximation
          apyPct1D: p.apyPct1D,
          apyPct7D: p.apyPct7D,
          apyPct30D: p.apyPct30D,
          volumeUsd7d: p.volumeUsd7d,
          source: 'defillama',
          isActive: true,
          lastSyncedAt: new Date()
        },
        update: {
          apy: p.apy,
          tvl: p.tvlUsd,
          volume24h: p.volumeUsd1d || 0,
          apyPct1D: p.apyPct1D,
          apyPct7D: p.apyPct7D,
          apyPct30D: p.apyPct30D,
          volumeUsd7d: p.volumeUsd7d,
          lastSyncedAt: new Date()
        }
      })
    })
    
    await prisma.$transaction(operations)
    
    // NOTE: Snapshots are created by separate hourly cron job (not on every sync)
    // See createHourlySnapshot() method
  }
  
  /**
   * Create hourly snapshots for mainnet pools (1 snapshot/hour/pool)
   * Runs every hour, processes pools in batches over 60 minutes
   * 
   * Strategy: 5,165 pools ÷ 60 minutes = ~86 pools/minute
   * Each minute processes one batch, spreading load evenly
   */
  async createHourlySnapshot(): Promise<{ created: number; errors: number }> {
    try {
      // Get current minute (0-59) to determine which batch to process
      const currentMinute = new Date().getMinutes()
      
      // Get all mainnet pools (source = 'defillama')
      const allPools = await prisma.pool.findMany({
        where: { source: 'defillama', isActive: true },
        select: { id: true, tvl: true, apy: true, volume24h: true }
      })
      
      // Calculate batch size: split pools into 60 batches
      const batchSize = Math.ceil(allPools.length / 60)
      const startIdx = currentMinute * batchSize
      const endIdx = Math.min(startIdx + batchSize, allPools.length)
      
      // Get current batch
      const batch = allPools.slice(startIdx, endIdx)
      
      logger.info(`[PoolDiscovery] Creating hourly snapshots: batch ${currentMinute + 1}/60 (${batch.length} pools)`)
      
      // Create snapshots for this batch
      const snapshots = batch.map(p => 
        prisma.poolSnapshot.create({
          data: {
            poolId: p.id,
            tvl: p.tvl,
            apy: p.apy,
            volume24h: p.volume24h || 0
          }
        })
      )
      
      // Execute in transaction (chunks of 50)
      let created = 0
      let errors = 0
      
      for (let i = 0; i < snapshots.length; i += 50) {
        const chunk = snapshots.slice(i, i + 50)
        try {
          await prisma.$transaction(chunk)
          created += chunk.length
        } catch (error) {
          logger.error({ error, batch: i / 50 }, '[PoolDiscovery] Failed to create snapshot chunk')
          errors += chunk.length
        }
      }
      
      logger.info(`[PoolDiscovery] Hourly snapshots created: ${created}, errors: ${errors}`)
      
      return { created, errors }
      
    } catch (error) {
      logger.error({ error }, '[PoolDiscovery] Failed to create hourly snapshots')
      throw error
    }
  }
  
  /**
   * Cleanup old snapshots (>30 days)
   * Runs once per day to keep storage manageable
   */
  async cleanupOldSnapshots(): Promise<{ deleted: number }> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000)
      
      const result = await prisma.poolSnapshot.deleteMany({
        where: {
          timestamp: { lt: thirtyDaysAgo }
        }
      })
      
      logger.info(`[PoolDiscovery] Cleaned up ${result.count} old snapshots (>30 days)`)
      
      return { deleted: result.count }
      
    } catch (error) {
      logger.error({ error }, '[PoolDiscovery] Failed to cleanup old snapshots')
      throw error
    }
  }
  
  /**
   * Calculate TVL for Monad testnet pools using price discovery from USDC pairs
   * Strategy: Get real token metadata (decimals/symbol) via RPC, then find price via USDC pairs
   */
  private async calculateMonadTVL(pool: EnvioPool, allPools: EnvioPool[]): Promise<number> {
    try {
      // If no reserves or token addresses, return 0
      if (!pool.reserve0 || !pool.reserve1 || !pool.token0Address || !pool.token1Address) {
        return 0
      }
      
      // Parse reserves with BigInt to avoid overflow
      const reserve0Raw = BigInt(pool.reserve0)
      const reserve1Raw = BigInt(pool.reserve1)
      
      // Check if reserves are valid
      if (reserve0Raw === 0n || reserve1Raw === 0n) {
        return 0
      }
      
      // Get REAL token metadata via RPC
      const [token0Meta, token1Meta] = await Promise.all([
        tokenMetadataService.getMetadata(pool.token0Address),
        tokenMetadataService.getMetadata(pool.token1Address)
      ])
      
      // Convert reserves to human-readable using REAL decimals
      const reserve0 = Number(reserve0Raw) / Math.pow(10, token0Meta.decimals)
      const reserve1 = Number(reserve1Raw) / Math.pow(10, token1Meta.decimals)
      
      // Check if either token is USDC (price anchor = $1)
      const isToken0USDC = tokenMetadataService.isStablecoin(token0Meta.symbol)
      const isToken1USDC = tokenMetadataService.isStablecoin(token1Meta.symbol)
      
      // Strategy 1: Direct USDC pair → TVL = USDC reserve * 2
      if (isToken0USDC) {
        let tvl = reserve0 * 2
        
        // Sanity check: Monad testnet mock tokens may have unrealistic reserves
        // If TVL > $100M, likely wrong decimals or mock token - try dividing by 10^12
        if (tvl > 100_000_000) {
          const adjustedTvl = tvl / 1e12
          logger.warn(`[PoolDiscovery] ${pool.poolAddress}: Suspiciously high USDC TVL $${tvl.toFixed(0)} - adjusting to $${adjustedTvl.toFixed(2)} (÷10^12)`)
          tvl = adjustedTvl
        }
        
        logger.debug(`[PoolDiscovery] ${pool.poolAddress}: Direct USDC pair (token0=${token0Meta.symbol}), TVL = $${tvl.toFixed(2)}`)
        return tvl
      }
      
      if (isToken1USDC) {
        let tvl = reserve1 * 2
        
        // Sanity check: Monad testnet mock tokens may have unrealistic reserves
        if (tvl > 100_000_000) {
          const adjustedTvl = tvl / 1e12
          logger.warn(`[PoolDiscovery] ${pool.poolAddress}: Suspiciously high USDC TVL $${tvl.toFixed(0)} - adjusting to $${adjustedTvl.toFixed(2)} (÷10^12)`)
          tvl = adjustedTvl
        }
        
        logger.debug(`[PoolDiscovery] ${pool.poolAddress}: Direct USDC pair (token1=${token1Meta.symbol}), TVL = $${tvl.toFixed(2)}`)
        return tvl
      }
      
      // Strategy 2: Price discovery via USDC pairs
      // Find TOKEN0/USDC pair and get price
      const token0Price = await this.findTokenPriceViaUSDC(pool.token0Address, token0Meta, allPools)
      if (token0Price > 0) {
        let tvl = reserve0 * token0Price * 2
        
        // Sanity check
        if (tvl > 100_000_000) {
          const adjustedTvl = tvl / 1e12
          logger.warn(`[PoolDiscovery] ${pool.poolAddress}: Suspiciously high TVL $${tvl.toFixed(0)} for ${token0Meta.symbol} - adjusting to $${adjustedTvl.toFixed(2)}`)
          tvl = adjustedTvl
        }
        
        logger.debug(`[PoolDiscovery] ${pool.poolAddress}: ${token0Meta.symbol} price via USDC = $${token0Price.toFixed(4)}, TVL = $${tvl.toFixed(2)}`)
        return tvl
      }
      
      // Find TOKEN1/USDC pair and get price
      const token1Price = await this.findTokenPriceViaUSDC(pool.token1Address, token1Meta, allPools)
      if (token1Price > 0) {
        let tvl = reserve1 * token1Price * 2
        
        // Sanity check
        if (tvl > 100_000_000) {
          const adjustedTvl = tvl / 1e12
          logger.warn(`[PoolDiscovery] ${pool.poolAddress}: Suspiciously high TVL $${tvl.toFixed(0)} for ${token1Meta.symbol} - adjusting to $${adjustedTvl.toFixed(2)}`)
          tvl = adjustedTvl
        }
        
        logger.debug(`[PoolDiscovery] ${pool.poolAddress}: ${token1Meta.symbol} price via USDC = $${token1Price.toFixed(4)}, TVL = $${tvl.toFixed(2)}`)
        return tvl
      }
      
      // Strategy 3: No USDC pairs found → estimate using geometric mean
      const geometricMean = Math.sqrt(reserve0 * reserve1)
      const avgTokenPrice = 1 // Conservative estimate for unknown tokens
      let estimatedTVL = geometricMean * avgTokenPrice
      
      // Sanity check: If estimated TVL > $100M for pools without USDC pair, likely wrong decimals
      if (estimatedTVL > 100_000_000) {
        const adjustedTvl = estimatedTVL / 1e12
        logger.warn(`[PoolDiscovery] ${pool.poolAddress}: Suspiciously high TVL $${estimatedTVL.toFixed(0)} for ${token0Meta.symbol}/${token1Meta.symbol} - adjusting to $${adjustedTvl.toFixed(2)}`)
        estimatedTVL = adjustedTvl
      }
      
      logger.debug(`[PoolDiscovery] ${pool.poolAddress}: No USDC price found for ${token0Meta.symbol}/${token1Meta.symbol}, estimated TVL = $${estimatedTVL.toFixed(2)}`)
      return estimatedTVL
      
    } catch (error) {
      logger.warn({ error, poolAddress: pool.poolAddress }, '[PoolDiscovery] Failed to calculate TVL')
      return 0
    }
  }
  
  /**
   * Find token price by searching for TOKEN/USDC pair in all pools
   * Returns price in USD (USDC ≈ $1)
   */
  private async findTokenPriceViaUSDC(
    tokenAddress: string, 
    tokenMeta: { symbol: string; decimals: number }, 
    allPools: EnvioPool[]
  ): Promise<number> {
    try {
      // Search for pools where this token is paired with USDC
      for (const pool of allPools) {
        if (!pool.token0Address || !pool.token1Address || !pool.reserve0 || !pool.reserve1) {
          continue
        }
        
        // Check if this pool has our token
        const hasToken0 = pool.token0Address.toLowerCase() === tokenAddress.toLowerCase()
        const hasToken1 = pool.token1Address.toLowerCase() === tokenAddress.toLowerCase()
        
        if (!hasToken0 && !hasToken1) {
          continue // This pool doesn't have our token
        }
        
        // Get metadata for the OTHER token in the pair
        const otherTokenAddress = hasToken0 ? pool.token1Address : pool.token0Address
        const otherTokenMeta = await tokenMetadataService.getMetadata(otherTokenAddress)
        
        // Check if the OTHER token is USDC
        if (!tokenMetadataService.isStablecoin(otherTokenMeta.symbol)) {
          continue // Not a USDC pair
        }
        
        // Found TOKEN/USDC pair! Calculate price
        const reserve0Raw = BigInt(pool.reserve0)
        const reserve1Raw = BigInt(pool.reserve1)
        
        if (reserve0Raw === 0n || reserve1Raw === 0n) {
          continue // Invalid reserves
        }
        
        // Get reserves with correct decimals
        let tokenReserve: number
        let usdcReserve: number
        
        if (hasToken0) {
          // Token is token0, USDC is token1
          const token0Decimals = tokenMeta.decimals
          const token1Decimals = otherTokenMeta.decimals
          tokenReserve = Number(reserve0Raw) / Math.pow(10, token0Decimals)
          usdcReserve = Number(reserve1Raw) / Math.pow(10, token1Decimals)
        } else {
          // Token is token1, USDC is token0
          const token0Decimals = otherTokenMeta.decimals
          const token1Decimals = tokenMeta.decimals
          usdcReserve = Number(reserve0Raw) / Math.pow(10, token0Decimals)
          tokenReserve = Number(reserve1Raw) / Math.pow(10, token1Decimals)
        }
        
        // Calculate price: price = USDC_reserve / TOKEN_reserve
        const price = usdcReserve / tokenReserve
        
        logger.debug(`[PoolDiscovery] Found ${tokenMeta.symbol}/USDC pair at ${pool.poolAddress}: price = $${price.toFixed(4)}`)
        
        return price
      }
      
      // No USDC pair found
      return 0
      
    } catch (error) {
      logger.warn({ error, tokenAddress }, '[PoolDiscovery] Failed to find price via USDC')
      return 0
    }
  }
  
  /**
   * Get current reserves from pool contract via RPC
   * Returns {reserve0, reserve1} as bigint strings
   */
  private async getReservesFromRPC(poolAddress: string): Promise<{ reserve0: string; reserve1: string } | null> {
    try {
      const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
      
      // getReserves() function selector
      const data = '0x0902f1ac'
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: poolAddress,
            data
          }, 'latest'],
          id: 1
        })
      })
      
      const result = await response.json()
      
      if (!result.result || result.result === '0x') {
        return null
      }
      
      // Decode result: reserve0 (112 bits), reserve1 (112 bits), blockTimestampLast (32 bits)
      const hex = result.result.slice(2) // Remove 0x
      
      // Each value is 32 bytes (64 hex chars) in ABI encoding
      const reserve0Hex = hex.slice(0, 64)
      const reserve1Hex = hex.slice(64, 128)
      
      const reserve0 = BigInt('0x' + reserve0Hex).toString()
      const reserve1 = BigInt('0x' + reserve1Hex).toString()
      
      return { reserve0, reserve1 }
      
    } catch (error) {
      logger.warn({ error, poolAddress }, '[PoolDiscovery] Failed to get reserves from RPC')
      return null
    }
  }
  
  /**
   * Calculate volume24h and APY from PoolTransaction events
   * If no recent activity (testnet inactive), use totalSwapVolume for approximate APY
   */
  private async calculateMonadVolumeAndAPY(poolId: string, tvl: number, envioPoolData?: any): Promise<{ volume24h: number; apy: number }> {
    try {
      logger.info({ poolId, tvl, hasEnvioData: !!envioPoolData }, '[PoolDiscovery] calculateMonadVolumeAndAPY called')
      
      const now = Math.floor(Date.now() / 1000)
      const yesterday = now - 86400
      const sevenDaysAgo = now - (7 * 86400)
      
      // Try to get last 24h volume first
      const response24h = await fetch(process.env.ENVIO_GRAPHQL_URL || 'http://hasura:8080/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetVolume($poolId: String!, $since: numeric!) {
              PoolTransaction(
                where: { pool_id: { _eq: $poolId }, timestamp: { _gte: $since }, transactionType: { _eq: "swap" } }
              ) {
                amount0
                amount1
              }
            }
          `,
          variables: { poolId, since: yesterday }
        })
      })
      
      const data24h = await response24h.json()
      const transactions24h = data24h.data?.PoolTransaction || []
      
      // Sum up 24h swap volumes
      let volume24h = 0
      for (const tx of transactions24h) {
        const amount1 = Math.abs(Number(tx.amount1))
        volume24h += amount1 / 1e6 // Assuming 6 decimals for stablecoin
      }
      
      // If no recent activity, use totalSwapVolume for approximate APY (testnet may be inactive)
      let apy = 0
      logger.info({ poolId, volume24h, hasEnvioPoolData: !!envioPoolData }, '[PoolDiscovery] Checking APY calculation branch')
      
      if (volume24h === 0 && envioPoolData) {
        logger.info({ poolId, envioPoolData: { totalSwapVolume: envioPoolData.totalSwapVolume, createdAt: envioPoolData.createdAt, lastActivityAt: envioPoolData.lastActivityAt } }, '[PoolDiscovery] Using historical data branch')
        
        // Use historical data from Envio Pool table
        const totalSwapVolume = BigInt(envioPoolData.totalSwapVolume || '0')
        const createdAt = Number(envioPoolData.createdAt)
        const lastActivityAt = Number(envioPoolData.lastActivityAt)
        
        if (totalSwapVolume > 0n && lastActivityAt > createdAt) {
          // Calculate average daily volume from historical data
          const daysActive = (lastActivityAt - createdAt) / 86400
          const volumeUSD = Number(totalSwapVolume) / 1e18 // Assuming 18 decimals
          const avgDailyVolume = volumeUSD / daysActive
          
          // Calculate APY from historical average
          const feeRate = 0.003 // Uniswap V2 fee = 0.3%
          apy = tvl > 0 ? (avgDailyVolume * feeRate * 365 / tvl) * 100 : 0
          
          logger.info({ 
            poolId, 
            totalSwapVolume: volumeUSD.toFixed(0), 
            daysActive: daysActive.toFixed(1),
            avgDailyVolume: avgDailyVolume.toFixed(0), 
            apy: apy.toFixed(2) 
          }, '[PoolDiscovery] Using historical totalSwapVolume for APY')
        } else {
          logger.debug({ poolId }, '[PoolDiscovery] No historical volume data available')
        }
      } else if (volume24h > 0) {
        // Use 24h volume for APY calculation
        const feeRate = 0.003
        apy = tvl > 0 ? (volume24h * feeRate * 365 / tvl) * 100 : 0
      }
      
      return { volume24h, apy: Math.min(apy, 200) } // Cap at 200%
    } catch (error) {
      logger.warn({ error, poolId }, '[PoolDiscovery] Failed to calculate volume/APY')
      return { volume24h: 0, apy: 0 }
    }
  }
  
  /**
   * Sync pools from Envio (Monad Testnet)
   * Runs every 1 hour
   * NOW FETCHES REAL RESERVES VIA RPC!
   */
  async syncEnvioPools(): Promise<{ synced: number, errors: number }> {
    logger.info('[PoolDiscovery] Starting Envio sync...')
    
    try {
      const query = `
        query GetAllPools {
          Pool(order_by: { lastActivityAt: desc }) {
            id
            protocol
            poolAddress
            poolType
            asset
            token0
            token0Address
            token1
            token1Address
            totalDeposits
            totalWithdrawals
            totalSwapVolume
            reserve0
            reserve1
            createdAt
            lastActivityAt
          }
        }
      `
      
      const response: any = await envioClient.query(query)
      
      // FIX: Handle null response from Envio timeout
      if (!response) {
        logger.warn('[PoolDiscovery] Envio returned null response (likely timeout), skipping sync')
        return { synced: 0, errors: 0 }
      }
      
      const pools: EnvioPool[] = response.Pool || []
      
      logger.info(`[PoolDiscovery] Fetched ${pools.length} pools from Envio`)
      logger.info(`[PoolDiscovery] Starting RPC sync with rate limiting (50ms between requests)...`)
      logger.info(`[PoolDiscovery] Estimated time: ${Math.ceil(pools.length * 0.15 / 60)} minutes`)
      
      let synced = 0
      let errors = 0
      let skipped = 0
      const startTime = Date.now()
      
      for (let i = 0; i < pools.length; i++) {
        const p = pools[i]
        try {
          // STEP 1: Get REAL reserves from RPC (not from Envio DB which has stale data)
          const reserves = await this.getReservesFromRPC(p.poolAddress)
          
          if (!reserves || reserves.reserve0 === '0' || reserves.reserve1 === '0') {
            // Skip pools with no liquidity
            skipped++
            continue
          }
          
          // STEP 2: Update EnvioPool with fresh reserves
          const poolWithReserves: EnvioPool = {
            ...p,
            reserve0: reserves.reserve0,
            reserve1: reserves.reserve1
          }
          
          // STEP 3: Get token metadata for symbol names
          let asset = p.asset || 'Unknown'
          if (p.token0Address && p.token1Address) {
            try {
              const [token0Meta, token1Meta] = await Promise.all([
                tokenMetadataService.getMetadata(p.token0Address),
                tokenMetadataService.getMetadata(p.token1Address)
              ])
              asset = `${token0Meta.symbol}/${token1Meta.symbol}`
            } catch (metaError) {
              logger.warn({ error: metaError, poolAddress: p.poolAddress }, '[PoolDiscovery] Failed to get token metadata')
              asset = `${p.token0 || 'Unknown'}/${p.token1 || 'Unknown'}`
            }
          }
          
          const id = this.generatePoolId(p.protocol, 'Monad', asset, p.poolAddress)
          
          // STEP 4: Calculate TVL using price discovery from USDC pairs
          const tvl = await this.calculateMonadTVL(poolWithReserves, pools)
          
          // STEP 5: Calculate REAL volume24h and APY from PoolTransaction events (or historical average)
          logger.info({ 
            poolId: p.id, 
            poolAddress: p.poolAddress, 
            asset, 
            tvl, 
            hasReserves: !!poolWithReserves,
            totalSwapVolume: poolWithReserves.totalSwapVolume 
          }, '[PoolDiscovery] About to calculate APY for pool')
          
          const { volume24h, apy } = await this.calculateMonadVolumeAndAPY(p.id, tvl, poolWithReserves)
          
          await prisma.pool.upsert({
            where: { address: p.poolAddress }, // Use address as unique key (not id)
            create: {
              id,
              protocol: p.protocol,
              chain: 'Monad',
              asset,
              address: p.poolAddress,
              envioPoolId: p.id, // Save Envio pool_id for PoolTransaction queries
              category: p.poolType === 'lp-pair' ? 'lp' : this.inferCategory(p.asset || ''),
              apy,
              tvl: Math.max(tvl, 0),
              volume24h,
              source: 'envio',
              isActive: true,
              lastSyncedAt: new Date()
            },
            update: {
              asset, // Update asset with real token symbols
              envioPoolId: p.id, // Update Envio pool_id
              apy,
              tvl: Math.max(tvl, 0),
              volume24h,
              lastSyncedAt: new Date()
            }
          })
          
          synced++
          
          // Log progress every 10 pools (более частый прогресс)
          if ((i + 1) % 10 === 0) {
            const elapsed = (Date.now() - startTime) / 1000
            const rate = (i + 1) / elapsed
            const remaining = pools.length - (i + 1)
            const eta = Math.ceil(remaining / rate)
            logger.info(`[PoolDiscovery] Progress: ${i + 1}/${pools.length} processed (${synced} with liquidity, ${skipped} empty) - ETA: ${eta}s`)
          }
        } catch (error) {
          errors++
          logger.error({ error, pool: p.id }, '[PoolDiscovery] Failed to upsert Envio pool')
        }
      }
      
      const totalTime = Math.ceil((Date.now() - startTime) / 1000)
      logger.info(`[PoolDiscovery] Envio sync complete: ${synced} pools with liquidity, ${skipped} empty, ${errors} errors - Total time: ${totalTime}s`)
      
      return { synced, errors }
    } catch (error) {
      logger.error({ error }, '[PoolDiscovery] Failed to sync Envio pools')
      // FIX: Don't crash backend if Envio is unavailable
      return { synced: 0, errors: 0 }
    }
  }
  
  /**
   * Mark pools that have user positions
   * Runs every 5 minutes
   */
  async markUserPools(): Promise<number> {
    logger.info('[PoolDiscovery] Marking pools with user positions...')
    
    try {
      // Reset all flags first
      await prisma.pool.updateMany({
        where: { hasUserPositions: true },
        data: { hasUserPositions: false }
      })
      
      // Mark pools with positions
      const result = await prisma.$executeRaw`
        UPDATE "Pool" p
        SET "hasUserPositions" = true
        WHERE EXISTS(
          SELECT 1 FROM "UserPoolPosition" upp 
          WHERE upp."poolId" = p.id
        )
      `
      
      logger.info(`[PoolDiscovery] Marked ${result} pools with user positions`)
      
      return Number(result)
    } catch (error) {
      logger.error({ error }, '[PoolDiscovery] Failed to mark user pools')
      throw error
    }
  }
  
  /**
   * Helper: Generate consistent pool ID
   */
  private generatePoolId(protocol: string, chain: string, asset: string, address: string): string {
    // Normalize inputs
    const p = protocol.toLowerCase().replace(/\s+/g, '-')
    const c = chain.toLowerCase().replace(/\s+/g, '-')
    const a = asset.toLowerCase().replace(/\s+/g, '-')
    const addr = address.toLowerCase().substring(0, 10) // First 10 chars
    
    return `${p}-${c}-${a}-${addr}`.substring(0, 255) // Limit to 255 chars
  }
  
  /**
   * Helper: Infer category from asset symbol
   */
  private inferCategory(symbol: string): string {
    const s = symbol.toUpperCase()
    
    if (s.includes('USDC') || s.includes('USDT') || s.includes('DAI') || s.includes('USDE')) {
      return 'stablecoin'
    }
    if (s.includes('WSTETH') || s.includes('RETH') || s.includes('CBETH') || s.includes('ETH')) {
      return 'eth-derivative'
    }
    if (s.includes('/') || s.includes('-LP') || s.includes('LP')) {
      return 'lp'
    }
    return 'volatile'
  }
  
  /**
   * Get statistics
   */
  async getStats(): Promise<{
    total: number
    bySource: { defillama: number, envio: number }
    byChain: Record<string, number>
    analyzed: number
    pending: number
  }> {
    const [total, bySource, byChain, analyzed] = await Promise.all([
      prisma.pool.count({ where: { isActive: true } }),
      prisma.pool.groupBy({
        by: ['source'],
        where: { isActive: true },
        _count: true
      }),
      prisma.pool.groupBy({
        by: ['chain'],
        where: { isActive: true },
        _count: true
      }),
      prisma.pool.count({
        where: {
          isActive: true,
          aiScore: { not: null }
        }
      })
    ])
    
    return {
      total,
      bySource: {
        defillama: bySource.find(s => s.source === 'defillama')?._count || 0,
        envio: bySource.find(s => s.source === 'envio')?._count || 0
      },
      byChain: Object.fromEntries(byChain.map(c => [c.chain, c._count])),
      analyzed,
      pending: total - analyzed
    }
  }
}

export const poolDiscoveryService = new PoolDiscoveryService()
