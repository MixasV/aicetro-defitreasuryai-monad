import { envioClient } from '../monitoring/envio.client';
import { MONAD_PROTOCOLS } from '../../config/protocols.monad';

interface EnvioPool {
  id: string;
  protocol: string;
  poolAddress: string;
  poolType: string;
  asset: string | null;
  assetAddress: string | null;
  token0: string | null;
  token0Address: string | null;
  token1: string | null;
  token1Address: string | null;
  totalDeposits: string;
  totalWithdrawals: string;
  totalSwapVolume: string;
  transactionCount: number;
  uniqueUsers: number;
  reserve0: string | null;
  reserve1: string | null;
  lastReserveUpdate: string | null;
  createdAt: string;
  lastActivityAt: string;
}

interface PoolData {
  id: string;
  name: string;
  protocol: string;
  chain: 'monad-testnet';
  asset: string;
  apy: number;
  tvl: number;
  risk: 1 | 2 | 3 | 4 | 5;
  available: boolean;
  address: string;
  category: 'stablecoin' | 'eth-derivative' | 'volatile' | 'lp';
  description: string;
}

class EnvioPoolsService {
  private cache: PoolData[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Query all pools from Envio
   */
  async queryPools(): Promise<EnvioPool[]> {
    const query = `
      query GetAllPools {
        Pool(order_by: { lastActivityAt: desc }) {
          id
          protocol
          poolAddress
          poolType
          asset
          assetAddress
          token0
          token0Address
          token1
          token1Address
          totalDeposits
          totalWithdrawals
          totalSwapVolume
          transactionCount
          uniqueUsers
          reserve0
          reserve1
          lastReserveUpdate
          createdAt
          lastActivityAt
        }
      }
    `;

    const response: any = await envioClient.query(query);
    return response.Pool || [];
  }

  /**
   * Calculate APY from pool metrics
   */
  private calculateAPY(pool: EnvioPool, fallbackConfig: any): number {
    // Try to use fallback APY from protocols.monad.ts
    if (fallbackConfig?.fallback?.currentApy) {
      return fallbackConfig.fallback.currentApy;
    }

    // Calculate from volume/deposits (rough estimate)
    const deposits = BigInt(pool.totalDeposits || '0');
    const volume = BigInt(pool.totalSwapVolume || '0');

    if (deposits === 0n) return 0;

    // Rough APY: (annual volume * 0.3% fees) / deposits * 100
    const annualVolume = volume * 365n;
    const fees = annualVolume * 3n / 1000n; // 0.3% swap fees
    const apy = Number(fees * 10000n / deposits) / 100;

    return Math.min(apy, 200); // Cap at 200% APY
  }

  /**
   * Calculate TVL from pool metrics
   */
  private calculateTVL(pool: EnvioPool, fallbackConfig: any): number {
    // Try to use fallback TVL
    if (fallbackConfig?.fallback?.tvlUsd) {
      return fallbackConfig.fallback.tvlUsd;
    }

    // Calculate from deposits - withdrawals
    const deposits = BigInt(pool.totalDeposits || '0');
    const withdrawals = BigInt(pool.totalWithdrawals || '0');
    const netDeposits = deposits - withdrawals;

    // Convert to USD (assuming USDC/USDT have 6 decimals)
    return Number(netDeposits) / 1e6;
  }

  /**
   * Calculate risk score
   */
  private calculateRisk(pool: EnvioPool): 1 | 2 | 3 | 4 | 5 {
    // Nabla pools: medium risk (3-4)
    if (pool.protocol === 'Nabla') {
      return pool.asset === 'WBTC' ? 4 : 3;
    }

    // Uniswap V2 LP: higher risk (4-5)
    if (pool.protocol === 'Uniswap V2' && pool.poolType === 'lp-pair') {
      // Stablecoin pairs: lower risk
      if (pool.token0 === 'USDC' || pool.token0 === 'USDT') {
        if (pool.token1 === 'USDC' || pool.token1 === 'USDT') {
          return 2; // USDC-USDT pair
        }
      }
      return 5; // Volatile pairs (e.g., USDC-WMON)
    }

    return 3; // Default medium risk
  }

  /**
   * Convert Envio pool to PoolData format
   */
  private async convertToPoolData(envioPool: EnvioPool): Promise<PoolData> {
    // Find fallback config from protocols.monad.ts
    let fallbackConfig: any = null;

    if (envioPool.protocol === 'Nabla') {
      // Nabla removed - pools do not exist on Monad Testnet
      fallbackConfig = null;  // Was: MONAD_PROTOCOLS.nabla.pools.find(...)
    } else if (envioPool.protocol === 'Uniswap V2') {
      fallbackConfig = MONAD_PROTOCOLS.uniswapV2.pairs.find(
        (p) => p.pairAddress.toLowerCase() === envioPool.poolAddress.toLowerCase()
      );
    }

    const apy = this.calculateAPY(envioPool, fallbackConfig);
    const tvl = this.calculateTVL(envioPool, fallbackConfig);
    const risk = this.calculateRisk(envioPool);

    // Determine category
    let category: 'stablecoin' | 'eth-derivative' | 'volatile' | 'lp' = 'stablecoin';
    if (envioPool.poolType === 'lp-pair') {
      category = 'lp';
    } else if (envioPool.asset === 'WBTC') {
      category = 'volatile';
    } else {
      category = 'stablecoin';
    }

    // Generate human-readable name
    let name = '';
    if (envioPool.protocol === 'Nabla') {
      name = `Nabla ${envioPool.asset} Pool`;
    } else if (envioPool.protocol === 'Uniswap V2') {
      name = `Uniswap V2 ${envioPool.token0}/${envioPool.token1} LP`;
    }

    // Generate description
    let description = '';
    if (envioPool.protocol === 'Nabla') {
      description = `High-yield ${envioPool.asset} pool with cross-chain liquidity on Monad`;
    } else if (envioPool.protocol === 'Uniswap V2') {
      description = `Liquidity pool for ${envioPool.token0}/${envioPool.token1} pair on Uniswap V2`;
    }

    return {
      id: envioPool.id,
      name,
      protocol: envioPool.protocol,
      chain: 'monad-testnet',
      asset: envioPool.asset || `${envioPool.token0}/${envioPool.token1}`,
      apy,
      tvl,
      risk,
      available: true, // All Envio pools are available on Monad
      address: envioPool.poolAddress,
      category,
      description,
    };
  }

  /**
   * Get all pools (with caching)
   */
  async getAllPools(): Promise<PoolData[]> {
    // Check cache
    const now = Date.now();
    if (this.cache && now - this.cacheTimestamp < this.CACHE_TTL) {
      console.log('[EnvioPoolsService] Returning cached pools');
      return this.cache;
    }

    console.log('[EnvioPoolsService] Fetching pools from Envio...');

    try {
      // Query from Envio
      const envioPools = await this.queryPools();

      // Convert to PoolData format
      const pools = await Promise.all(
        envioPools.map((pool) => this.convertToPoolData(pool))
      );

      // Update cache
      this.cache = pools;
      this.cacheTimestamp = now;

      console.log(`[EnvioPoolsService] Fetched ${pools.length} pools from Envio`);

      return pools;
    } catch (error) {
      console.error('[EnvioPoolsService] Failed to fetch pools:', error);

      // Return cached data if available
      if (this.cache) {
        console.log('[EnvioPoolsService] Returning stale cache due to error');
        return this.cache;
      }

      // Last resort: return pools from protocols.monad.ts
      return this.getFallbackPools();
    }
  }

  /**
   * Fallback: Generate pools from protocols.monad.ts
   */
  private getFallbackPools(): PoolData[] {
    console.log('[EnvioPoolsService] Using fallback pools from protocols.monad.ts');

    const pools: PoolData[] = [];

    // Nabla pools removed - do not exist on Monad Testnet
    /* OLD CODE:
    for (const pool of MONAD_PROTOCOLS.nabla.pools) {
      pools.push({
        id: pool.id,
        name: `Nabla ${pool.assetSymbol} Pool`,
        protocol: 'Nabla',
        chain: 'monad-testnet',
        asset: pool.assetSymbol,
        apy: pool.fallback.currentApy,
        tvl: pool.fallback.tvlUsd,
        risk: Math.min(pool.fallback.riskScore, 5) as 1 | 2 | 3 | 4 | 5,
        available: pool.fallback.isActive !== false,
        address: pool.address,
        category: pool.assetSymbol === 'WBTC' ? 'volatile' : 'stablecoin',
        description: `High-yield ${pool.assetSymbol} pool with cross-chain liquidity on Monad`,
      });
    }
    */ // END Nabla old code

    // Uniswap V2 pairs
    for (const pair of MONAD_PROTOCOLS.uniswapV2.pairs) {
      pools.push({
        id: pair.id,
        name: `Uniswap V2 ${pair.token0.symbol}/${pair.token1.symbol} LP`,
        protocol: 'Uniswap V2',
        chain: 'monad-testnet',
        asset: `${pair.token0.symbol}/${pair.token1.symbol}`,
        apy: pair.fallback.apr,
        tvl: pair.fallback.volume24hUsd * 30, // Rough estimate
        risk: 4 as 1 | 2 | 3 | 4 | 5,
        available: pair.fallback.isActive !== false,
        address: pair.pairAddress,
        category: 'lp',
        description: `Liquidity pool for ${pair.token0.symbol}/${pair.token1.symbol} pair on Uniswap V2`,
      });
    }

    return pools;
  }

  /**
   * Get available pools only (Monad Testnet)
   */
  async getAvailablePools(): Promise<PoolData[]> {
    const all = await this.getAllPools();
    return all.filter((p) => p.available);
  }

  /**
   * Get pools by chain
   */
  async getPoolsByChain(chain: string): Promise<PoolData[]> {
    const all = await this.getAllPools();
    return all.filter((p) => p.chain === chain);
  }

  /**
   * Get pools by category
   */
  async getPoolsByCategory(category: string): Promise<PoolData[]> {
    const all = await this.getAllPools();
    return all.filter((p) => p.category === category);
  }

  /**
   * Get pools by risk range
   */
  async getPoolsByRisk(minRisk: number, maxRisk: number): Promise<PoolData[]> {
    const all = await this.getAllPools();
    return all.filter((p) => p.risk >= minRisk && p.risk <= maxRisk);
  }

  /**
   * Search pools by query
   */
  async searchPools(query: string): Promise<PoolData[]> {
    const all = await this.getAllPools();
    const lowerQuery = query.toLowerCase();

    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.protocol.toLowerCase().includes(lowerQuery) ||
        p.asset.toLowerCase().includes(lowerQuery) ||
        p.address.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Clear cache (for testing/manual refresh)
   */
  clearCache() {
    this.cache = null;
    this.cacheTimestamp = 0;
    console.log('[EnvioPoolsService] Cache cleared');
  }
}

export const envioPoolsService = new EnvioPoolsService();
