import { Router, type Request, type Response } from 'express';
import {
  POOLS_DATA,
  getPoolsByChain,
  getPoolsByCategory,
  getPoolsByRisk,
  getAvailablePools,
  searchPools
} from '../../data/pools.data';

const router = Router();

// In-memory whitelist storage (in production, use database)
const whitelist: Set<string> = new Set();

// GET /api/pools - Get all pools
router.get('/', (_req: Request, res: Response) => {
  try {
    const available = POOLS_DATA.filter(p => p.available);
    const preview = POOLS_DATA.filter(p => !p.available);
    
    res.json({
      total: POOLS_DATA.length,
      available: available.length,
      preview: preview.length,
      pools: POOLS_DATA
    });
  } catch (error) {
    console.error('[pools] Failed to fetch pools:', error);
    res.status(500).json({ error: 'Failed to fetch pools' });
  }
});

// GET /api/pools/available - Get only available pools (Monad Testnet)
router.get('/available', (_req: Request, res: Response) => {
  try {
    const pools = getAvailablePools();
    res.json({
      total: pools.length,
      pools
    });
  } catch (error) {
    console.error('[pools] Failed to fetch available pools:', error);
    res.status(500).json({ error: 'Failed to fetch available pools' });
  }
});

// GET /api/pools/chain/:chain - Get pools by chain
router.get('/chain/:chain', (req: Request, res: Response) => {
  try {
    const { chain } = req.params;
    const pools = getPoolsByChain(chain);
    
    res.json({
      chain,
      total: pools.length,
      available: pools.filter(p => p.available).length,
      pools
    });
  } catch (error) {
    console.error('[pools] Failed to fetch pools by chain:', error);
    res.status(500).json({ error: 'Failed to fetch pools by chain' });
  }
});

// GET /api/pools/category/:category - Get pools by category
router.get('/category/:category', (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const pools = getPoolsByCategory(category);
    
    res.json({
      category,
      total: pools.length,
      available: pools.filter(p => p.available).length,
      pools
    });
  } catch (error) {
    console.error('[pools] Failed to fetch pools by category:', error);
    res.status(500).json({ error: 'Failed to fetch pools by category' });
  }
});

// GET /api/pools/risk?min=1&max=3 - Get pools by risk range
router.get('/risk', (req: Request, res: Response) => {
  try {
    const minRisk = parseInt(req.query.min as string) || 1;
    const maxRisk = parseInt(req.query.max as string) || 5;
    
    const pools = getPoolsByRisk(minRisk, maxRisk);
    
    res.json({
      minRisk,
      maxRisk,
      total: pools.length,
      pools
    });
  } catch (error) {
    console.error('[pools] Failed to fetch pools by risk:', error);
    res.status(500).json({ error: 'Failed to fetch pools by risk' });
  }
});

// GET /api/pools/search?q=aave - Search pools
router.get('/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const pools = searchPools(query);
    
    res.json({
      query,
      total: pools.length,
      pools
    });
  } catch (error) {
    console.error('[pools] Failed to search pools:', error);
    res.status(500).json({ error: 'Failed to search pools' });
  }
});

// GET /api/pools/categories - Get pool category summaries
router.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = [
      {
        id: 'monad-active',
        name: 'Monad Testnet',
        description: 'Live pools you can interact with now',
        icon: '🌊',
        count: getPoolsByChain('monad-testnet').length,
        available: true,
        avgApy: calculateAvgApy(getPoolsByChain('monad-testnet')),
        totalTvl: calculateTotalTvl(getPoolsByChain('monad-testnet'))
      },
      {
        id: 'ethereum',
        name: 'Ethereum Mainnet',
        description: 'Preview what you could do with Ethereum pools',
        icon: '⟠',
        count: getPoolsByChain('ethereum').length,
        available: false,
        avgApy: calculateAvgApy(getPoolsByChain('ethereum')),
        totalTvl: calculateTotalTvl(getPoolsByChain('ethereum'))
      },
      {
        id: 'base',
        name: 'Base',
        description: 'Base L2 pools preview',
        icon: '🔵',
        count: getPoolsByChain('base').length,
        available: false,
        avgApy: calculateAvgApy(getPoolsByChain('base')),
        totalTvl: calculateTotalTvl(getPoolsByChain('base'))
      },
      {
        id: 'arbitrum',
        name: 'Arbitrum',
        description: 'Arbitrum L2 pools preview',
        icon: '🔷',
        count: getPoolsByChain('arbitrum').length,
        available: false,
        avgApy: calculateAvgApy(getPoolsByChain('arbitrum')),
        totalTvl: calculateTotalTvl(getPoolsByChain('arbitrum'))
      },
      {
        id: 'optimism',
        name: 'Optimism',
        description: 'Optimism L2 pools preview',
        icon: '🔴',
        count: getPoolsByChain('optimism').length,
        available: false,
        avgApy: calculateAvgApy(getPoolsByChain('optimism')),
        totalTvl: calculateTotalTvl(getPoolsByChain('optimism'))
      },
      {
        id: 'conservative',
        name: 'Conservative',
        description: 'Low risk, stable returns (Risk 1-2)',
        icon: '🛡️',
        count: getPoolsByRisk(1, 2).length,
        available: getPoolsByRisk(1, 2).some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByRisk(1, 2)),
        totalTvl: calculateTotalTvl(getPoolsByRisk(1, 2))
      },
      {
        id: 'moderate',
        name: 'Moderate',
        description: 'Balanced risk and returns (Risk 3)',
        icon: '⚖️',
        count: getPoolsByRisk(3, 3).length,
        available: getPoolsByRisk(3, 3).some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByRisk(3, 3)),
        totalTvl: calculateTotalTvl(getPoolsByRisk(3, 3))
      },
      {
        id: 'aggressive',
        name: 'Aggressive',
        description: 'Higher yields, higher risks (Risk 4-5)',
        icon: '🚀',
        count: getPoolsByRisk(4, 5).length,
        available: getPoolsByRisk(4, 5).some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByRisk(4, 5)),
        totalTvl: calculateTotalTvl(getPoolsByRisk(4, 5))
      },
      {
        id: 'stablecoin',
        name: 'Stablecoins',
        description: 'USDC, USDT, DAI - minimal volatility',
        icon: '💵',
        count: getPoolsByCategory('stablecoin').length,
        available: getPoolsByCategory('stablecoin').some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByCategory('stablecoin')),
        totalTvl: calculateTotalTvl(getPoolsByCategory('stablecoin'))
      },
      {
        id: 'eth-derivative',
        name: 'ETH Derivatives',
        description: 'wstETH, rETH, cbETH and other ETH variants',
        icon: '⟠',
        count: getPoolsByCategory('eth-derivative').length,
        available: getPoolsByCategory('eth-derivative').some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByCategory('eth-derivative')),
        totalTvl: calculateTotalTvl(getPoolsByCategory('eth-derivative'))
      },
      {
        id: 'lp',
        name: 'Liquidity Pools',
        description: 'High-yield LP tokens with impermanent loss risk',
        icon: '💧',
        count: getPoolsByCategory('lp').length,
        available: getPoolsByCategory('lp').some(p => p.available),
        avgApy: calculateAvgApy(getPoolsByCategory('lp')),
        totalTvl: calculateTotalTvl(getPoolsByCategory('lp'))
      }
    ];
    
    res.json({ categories });
  } catch (error) {
    console.error('[pools] Failed to fetch categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/pools/whitelist - Add pool to whitelist
router.post('/whitelist', (req: Request, res: Response) => {
  try {
    const { poolId } = req.body;
    
    if (!poolId || typeof poolId !== 'string') {
      return res.status(400).json({ error: 'Pool ID required' });
    }
    
    const pool = POOLS_DATA.find(p => p.id === poolId);
    if (!pool) {
      return res.status(404).json({ error: 'Pool not found' });
    }
    
    if (!pool.available) {
      return res.status(400).json({ error: 'Pool not available on Monad Testnet' });
    }
    
    whitelist.add(poolId);
    
    res.json({ 
      success: true, 
      poolId,
      whitelisted: true,
      message: `${pool.name} added to whitelist`
    });
  } catch (error) {
    console.error('[pools] Failed to add to whitelist:', error);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
});

// DELETE /api/pools/whitelist/:poolId - Remove pool from whitelist
router.delete('/whitelist/:poolId', (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    
    if (whitelist.has(poolId)) {
      whitelist.delete(poolId);
      res.json({ 
        success: true, 
        poolId,
        whitelisted: false,
        message: 'Pool removed from whitelist'
      });
    } else {
      res.status(404).json({ error: 'Pool not in whitelist' });
    }
  } catch (error) {
    console.error('[pools] Failed to remove from whitelist:', error);
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
});

// GET /api/pools/whitelist - Get all whitelisted pools
router.get('/whitelist', (_req: Request, res: Response) => {
  try {
    const whitelistedPools = POOLS_DATA.filter(p => whitelist.has(p.id));
    
    res.json({
      total: whitelistedPools.length,
      pools: whitelistedPools,
      poolIds: [...whitelist]
    });
  } catch (error) {
    console.error('[pools] Failed to fetch whitelist:', error);
    res.status(500).json({ error: 'Failed to fetch whitelist' });
  }
});

// GET /api/pools/whitelist/check/:poolId - Check if pool is whitelisted
router.get('/whitelist/check/:poolId', (req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const isWhitelisted = whitelist.has(poolId);
    
    res.json({ 
      poolId,
      whitelisted: isWhitelisted
    });
  } catch (error) {
    console.error('[pools] Failed to check whitelist:', error);
    res.status(500).json({ error: 'Failed to check whitelist' });
  }
});

// Helper functions
function calculateAvgApy(pools: typeof POOLS_DATA): number {
  if (pools.length === 0) return 0;
  const sum = pools.reduce((acc, p) => acc + p.apy, 0);
  return Math.round((sum / pools.length) * 100) / 100;
}

function calculateTotalTvl(pools: typeof POOLS_DATA): number {
  return pools.reduce((acc, p) => acc + p.tvl, 0);
}

export default router;
