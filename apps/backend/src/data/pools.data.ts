// Static pool data - 50 DeFi pools across multiple chains

export interface Pool {
  id: string;
  name: string;
  protocol: string;
  chain: 'monad-testnet' | 'ethereum' | 'base' | 'arbitrum' | 'optimism';
  asset: string;
  apy: number;
  tvl: number;
  risk: 1 | 2 | 3 | 4 | 5;
  available: boolean;
  address: string;
  category: 'stablecoin' | 'eth-derivative' | 'volatile' | 'lp';
  description: string;
}

export const POOLS_DATA: Pool[] = [
  // ============ MONAD TESTNET (Available) ============
  {
    id: 'monad-aave-usdc',
    name: 'Aave USDC Pool',
    protocol: 'Aave',
    chain: 'monad-testnet',
    asset: 'USDC',
    apy: 8.5,
    tvl: 5_000_000,
    risk: 2,
    available: true,
    address: '0x1111111111111111111111111111111111111111',
    category: 'stablecoin',
    description: 'Stable yield on USDC deposits with blue-chip Aave protocol'
  },
  {
    id: 'monad-aave-usdt',
    name: 'Aave USDT Pool',
    protocol: 'Aave',
    chain: 'monad-testnet',
    asset: 'USDT',
    apy: 8.2,
    tvl: 4_500_000,
    risk: 2,
    available: true,
    address: '0x1111111111111111111111111111111111111112',
    category: 'stablecoin',
    description: 'Earn interest on USDT with Aave lending protocol'
  },
  {
    id: 'monad-yearn-usdc',
    name: 'Yearn USDC Vault',
    protocol: 'Yearn',
    chain: 'monad-testnet',
    asset: 'USDC',
    apy: 12.3,
    tvl: 3_000_000,
    risk: 3,
    available: true,
    address: '0x2222222222222222222222222222222222222221',
    category: 'stablecoin',
    description: 'Automated yield optimization for USDC across multiple strategies'
  },
  {
    id: 'monad-yearn-usdt',
    name: 'Yearn USDT Vault',
    protocol: 'Yearn',
    chain: 'monad-testnet',
    asset: 'USDT',
    apy: 11.8,
    tvl: 2_800_000,
    risk: 3,
    available: true,
    address: '0x2222222222222222222222222222222222222222',
    category: 'stablecoin',
    description: 'Multi-strategy USDT vault with automated rebalancing'
  },
  {
    id: 'monad-nabla-usdc',
    name: 'Nabla USDC Pool',
    protocol: 'Nabla',
    chain: 'monad-testnet',
    asset: 'USDC',
    apy: 15.2,
    tvl: 2_000_000,
    risk: 4,
    available: true,
    address: '0x3333333333333333333333333333333333333331',
    category: 'stablecoin',
    description: 'High-yield USDC pool with cross-chain liquidity'
  },
  {
    id: 'monad-compound-dai',
    name: 'Compound DAI Pool',
    protocol: 'Compound',
    chain: 'monad-testnet',
    asset: 'DAI',
    apy: 7.8,
    tvl: 3_500_000,
    risk: 2,
    available: true,
    address: '0x3333333333333333333333333333333333333332',
    category: 'stablecoin',
    description: 'Decentralized lending pool for DAI stablecoin'
  },
  {
    id: 'monad-aave-wsteth',
    name: 'Aave wstETH Pool',
    protocol: 'Aave',
    chain: 'monad-testnet',
    asset: 'wstETH',
    apy: 4.5,
    tvl: 8_000_000,
    risk: 3,
    available: true,
    address: '0x1111111111111111111111111111111111111113',
    category: 'eth-derivative',
    description: 'Earn on wrapped staked ETH with additional staking rewards'
  },
  {
    id: 'monad-yearn-eth',
    name: 'Yearn ETH Vault',
    protocol: 'Yearn',
    chain: 'monad-testnet',
    asset: 'ETH',
    apy: 5.2,
    tvl: 10_000_000,
    risk: 3,
    available: true,
    address: '0x2222222222222222222222222222222222222223',
    category: 'eth-derivative',
    description: 'ETH vault with optimized staking and DeFi strategies'
  },
  {
    id: 'monad-uniswap-mon-eth',
    name: 'Uniswap MON/ETH LP',
    protocol: 'Uniswap V3',
    chain: 'monad-testnet',
    asset: 'MON-ETH',
    apy: 45.2,
    tvl: 1_500_000,
    risk: 5,
    available: true,
    address: '0x4444444444444444444444444444444444444441',
    category: 'lp',
    description: 'High-yield liquidity provision for MON/ETH pair'
  },
  {
    id: 'monad-nabla-btc-usdc',
    name: 'Nabla BTC/USDC LP',
    protocol: 'Nabla',
    chain: 'monad-testnet',
    asset: 'BTC-USDC',
    apy: 35.8,
    tvl: 1_800_000,
    risk: 4,
    available: true,
    address: '0x3333333333333333333333333333333333333333',
    category: 'lp',
    description: 'BTC/USDC liquidity pool with concentrated liquidity'
  },
  {
    id: 'monad-aave-mon',
    name: 'Aave MON Pool',
    protocol: 'Aave',
    chain: 'monad-testnet',
    asset: 'MON',
    apy: 12.5,
    tvl: 2_500_000,
    risk: 4,
    available: true,
    address: '0x1111111111111111111111111111111111111114',
    category: 'volatile',
    description: 'Lending pool for Monad native token'
  },
  {
    id: 'monad-compound-usdc',
    name: 'Compound USDC Pool',
    protocol: 'Compound',
    chain: 'monad-testnet',
    asset: 'USDC',
    apy: 7.5,
    tvl: 4_000_000,
    risk: 2,
    available: true,
    address: '0x3333333333333333333333333333333333333334',
    category: 'stablecoin',
    description: 'Algorithmic money market for USDC lending'
  },

  // ============ ETHEREUM MAINNET (Preview) ============
  {
    id: 'eth-aave-usdc',
    name: 'Aave USDC Pool',
    protocol: 'Aave',
    chain: 'ethereum',
    asset: 'USDC',
    apy: 7.2,
    tvl: 80_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Largest USDC lending pool on Ethereum mainnet'
  },
  {
    id: 'eth-aave-usdt',
    name: 'Aave USDT Pool',
    protocol: 'Aave',
    chain: 'ethereum',
    asset: 'USDT',
    apy: 7.5,
    tvl: 75_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Blue-chip USDT lending on Ethereum'
  },
  {
    id: 'eth-aave-dai',
    name: 'Aave DAI Pool',
    protocol: 'Aave',
    chain: 'ethereum',
    asset: 'DAI',
    apy: 6.8,
    tvl: 60_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Decentralized stablecoin lending pool'
  },
  {
    id: 'eth-compound-usdc',
    name: 'Compound USDC Pool',
    protocol: 'Compound',
    chain: 'ethereum',
    asset: 'USDC',
    apy: 6.5,
    tvl: 45_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Battle-tested USDC money market'
  },
  {
    id: 'eth-compound-dai',
    name: 'Compound DAI Pool',
    protocol: 'Compound',
    chain: 'ethereum',
    asset: 'DAI',
    apy: 6.2,
    tvl: 40_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Algorithmic DAI lending protocol'
  },
  {
    id: 'eth-yearn-usdc',
    name: 'Yearn USDC Vault',
    protocol: 'Yearn',
    chain: 'ethereum',
    asset: 'USDC',
    apy: 9.5,
    tvl: 30_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Automated yield strategies for USDC'
  },
  {
    id: 'eth-yearn-dai',
    name: 'Yearn DAI Vault',
    protocol: 'Yearn',
    chain: 'ethereum',
    asset: 'DAI',
    apy: 9.2,
    tvl: 28_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Multi-strategy DAI optimization'
  },
  {
    id: 'eth-aave-wsteth',
    name: 'Aave wstETH Pool',
    protocol: 'Aave',
    chain: 'ethereum',
    asset: 'wstETH',
    apy: 3.8,
    tvl: 120_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'Largest wrapped staked ETH lending pool'
  },
  {
    id: 'eth-aave-reth',
    name: 'Aave rETH Pool',
    protocol: 'Aave',
    chain: 'ethereum',
    asset: 'rETH',
    apy: 4.1,
    tvl: 90_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'Rocket Pool ETH lending market'
  },
  {
    id: 'eth-yearn-weth',
    name: 'Yearn WETH Vault',
    protocol: 'Yearn',
    chain: 'ethereum',
    asset: 'WETH',
    apy: 4.5,
    tvl: 100_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'ETH vault with optimized yield strategies'
  },
  {
    id: 'eth-uniswap-usdc-eth',
    name: 'Uniswap USDC/ETH LP',
    protocol: 'Uniswap V3',
    chain: 'ethereum',
    asset: 'USDC-ETH',
    apy: 18.5,
    tvl: 150_000_000,
    risk: 3,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Highest volume USDC/ETH liquidity pool'
  },
  {
    id: 'eth-uniswap-usdc-usdt',
    name: 'Uniswap USDC/USDT LP',
    protocol: 'Uniswap V3',
    chain: 'ethereum',
    asset: 'USDC-USDT',
    apy: 15.2,
    tvl: 200_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Low-volatility stablecoin pair'
  },
  {
    id: 'eth-curve-3pool',
    name: 'Curve 3pool',
    protocol: 'Curve',
    chain: 'ethereum',
    asset: 'USDC-USDT-DAI',
    apy: 8.8,
    tvl: 250_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Largest stablecoin pool on Ethereum'
  },
  {
    id: 'eth-convex-3pool',
    name: 'Convex 3pool',
    protocol: 'Convex',
    chain: 'ethereum',
    asset: 'USDC-USDT-DAI',
    apy: 10.5,
    tvl: 180_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Boosted Curve 3pool with CVX rewards'
  },

  // ============ BASE (Preview) ============
  {
    id: 'base-aave-usdc',
    name: 'Aave USDC Pool',
    protocol: 'Aave',
    chain: 'base',
    asset: 'USDC',
    apy: 8.0,
    tvl: 15_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Aave V3 on Base L2'
  },
  {
    id: 'base-compound-usdc',
    name: 'Compound USDC Pool',
    protocol: 'Compound',
    chain: 'base',
    asset: 'USDC',
    apy: 7.5,
    tvl: 12_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Compound III on Base network'
  },
  {
    id: 'base-uniswap-eth-usdc',
    name: 'Uniswap ETH/USDC LP',
    protocol: 'Uniswap V3',
    chain: 'base',
    asset: 'ETH-USDC',
    apy: 20.5,
    tvl: 25_000_000,
    risk: 3,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Main liquidity pair on Base'
  },
  {
    id: 'base-aerodrome-usdc-dai',
    name: 'Aerodrome USDC/DAI LP',
    protocol: 'Aerodrome',
    chain: 'base',
    asset: 'USDC-DAI',
    apy: 12.3,
    tvl: 10_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Base-native stablecoin DEX'
  },
  {
    id: 'base-moonwell-usdc',
    name: 'Moonwell USDC Pool',
    protocol: 'Moonwell',
    chain: 'base',
    asset: 'USDC',
    apy: 9.2,
    tvl: 8_000_000,
    risk: 3,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Base-native lending protocol'
  },
  {
    id: 'base-aave-weth',
    name: 'Aave WETH Pool',
    protocol: 'Aave',
    chain: 'base',
    asset: 'WETH',
    apy: 3.5,
    tvl: 18_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'ETH lending on Base L2'
  },
  {
    id: 'base-uniswap-cbeth-eth',
    name: 'Uniswap cbETH/ETH LP',
    protocol: 'Uniswap V3',
    chain: 'base',
    asset: 'cbETH-ETH',
    apy: 8.5,
    tvl: 12_000_000,
    risk: 3,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'Coinbase staked ETH liquidity'
  },

  // ============ ARBITRUM (Preview) ============
  {
    id: 'arb-aave-usdc',
    name: 'Aave USDC Pool',
    protocol: 'Aave',
    chain: 'arbitrum',
    asset: 'USDC',
    apy: 7.8,
    tvl: 40_000_000,
    risk: 1,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Aave V3 on Arbitrum'
  },
  {
    id: 'arb-gmx-glp',
    name: 'GMX GLP Pool',
    protocol: 'GMX',
    chain: 'arbitrum',
    asset: 'GLP',
    apy: 22.5,
    tvl: 50_000_000,
    risk: 4,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'GMX liquidity provider token'
  },
  {
    id: 'arb-radiant-usdc',
    name: 'Radiant USDC Pool',
    protocol: 'Radiant',
    chain: 'arbitrum',
    asset: 'USDC',
    apy: 10.5,
    tvl: 20_000_000,
    risk: 3,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Cross-chain lending on Arbitrum'
  },
  {
    id: 'arb-uniswap-arb-eth',
    name: 'Uniswap ARB/ETH LP',
    protocol: 'Uniswap V3',
    chain: 'arbitrum',
    asset: 'ARB-ETH',
    apy: 35.2,
    tvl: 30_000_000,
    risk: 5,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Arbitrum native token liquidity'
  },
  {
    id: 'arb-camelot-arb-usdc',
    name: 'Camelot ARB/USDC LP',
    protocol: 'Camelot',
    chain: 'arbitrum',
    asset: 'ARB-USDC',
    apy: 28.5,
    tvl: 15_000_000,
    risk: 4,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Arbitrum-native DEX liquidity'
  },
  {
    id: 'arb-aave-weth',
    name: 'Aave WETH Pool',
    protocol: 'Aave',
    chain: 'arbitrum',
    asset: 'WETH',
    apy: 3.2,
    tvl: 35_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'ETH lending on Arbitrum L2'
  },

  // ============ OPTIMISM (Preview) ============
  {
    id: 'op-aave-usdc',
    name: 'Aave USDC Pool',
    protocol: 'Aave',
    chain: 'optimism',
    asset: 'USDC',
    apy: 7.5,
    tvl: 25_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Aave V3 on Optimism'
  },
  {
    id: 'op-velodrome-usdc-dai',
    name: 'Velodrome USDC/DAI LP',
    protocol: 'Velodrome',
    chain: 'optimism',
    asset: 'USDC-DAI',
    apy: 15.8,
    tvl: 20_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Optimism-native stablecoin DEX'
  },
  {
    id: 'op-uniswap-op-eth',
    name: 'Uniswap OP/ETH LP',
    protocol: 'Uniswap V3',
    chain: 'optimism',
    asset: 'OP-ETH',
    apy: 32.5,
    tvl: 18_000_000,
    risk: 5,
    available: false,
    address: '0x...',
    category: 'lp',
    description: 'Optimism token liquidity pool'
  },
  {
    id: 'op-beethoven-usdc-dai-usdt',
    name: 'Beethoven Stable Pool',
    protocol: 'Beethoven X',
    chain: 'optimism',
    asset: 'USDC-DAI-USDT',
    apy: 11.2,
    tvl: 15_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'stablecoin',
    description: 'Balancer-based stable pool'
  },
  {
    id: 'op-aave-weth',
    name: 'Aave WETH Pool',
    protocol: 'Aave',
    chain: 'optimism',
    asset: 'WETH',
    apy: 3.0,
    tvl: 22_000_000,
    risk: 2,
    available: false,
    address: '0x...',
    category: 'eth-derivative',
    description: 'ETH lending on Optimism L2'
  }
];

export const getPoolsByChain = (chain: string) => {
  return POOLS_DATA.filter(p => p.chain === chain);
};

export const getPoolsByCategory = (category: string) => {
  return POOLS_DATA.filter(p => p.category === category);
};

export const getPoolsByRisk = (minRisk: number, maxRisk: number) => {
  return POOLS_DATA.filter(p => p.risk >= minRisk && p.risk <= maxRisk);
};

export const getAvailablePools = () => {
  return POOLS_DATA.filter(p => p.available);
};

export const searchPools = (query: string) => {
  const q = query.toLowerCase();
  return POOLS_DATA.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.protocol.toLowerCase().includes(q) ||
    p.asset.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
};
