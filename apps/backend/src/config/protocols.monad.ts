export interface MonadProtocolPoolConfig {
  id: string
  address: `0x${string}`
  assetSymbol: string
  assetAddress?: `0x${string}`
  decimals?: number
  fallback: {
    currentApy: number
    tvlUsd: number
    volume24hUsd: number
    fees24hUsd: number
    riskScore: number
    isActive?: boolean
  }
}

export interface MonadProtocolPairConfig {
  id: string
  pairAddress: `0x${string}`
  token0: {
    symbol: string
    address: `0x${string}`
    decimals: number
  }
  token1: {
    symbol: string
    address: `0x${string}`
    decimals: number
  }
  fallback: {
    volume24hUsd: number
    fees24hUsd: number
    apr: number
    isActive?: boolean
  }
}

interface MonadProtocolsConfig {
  // Nabla removed - pools do not exist on Monad Testnet
  uniswapV2: {
    name: string
    factory: `0x${string}`
    pairs: MonadProtocolPairConfig[]
  }
}

export const MONAD_PROTOCOLS: MonadProtocolsConfig = {
  // NOTE: Nabla Finance pools were planned but never deployed on Monad Testnet
  // Real pools are indexed from Envio and stored in Pool table
  
  uniswapV2: {
    name: 'Uniswap V2',
    factory: '0x733e88f248b742db6c14c0b1713af5ad7fdd59d0',
    pairs: [
      {
        id: 'uniswap:usdc-usdt',
        pairAddress: '0x3D44D591C8FC89daE3bc5f312c67CA0b44497b86',
        token0: {
          symbol: 'USDC',
          address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
          decimals: 6
        },
        token1: {
          symbol: 'USDT',
          address: '0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149',
          decimals: 6
        },
        fallback: {
          volume24hUsd: 50000,
          fees24hUsd: 150,
          apr: 8.0,
          isActive: true
        }
      },
      {
        id: 'uniswap:wmon-usdc',
        pairAddress: '0x5323821dE342c56b80c99fbc7cD725f2da8eB87B',
        token0: {
          symbol: 'WMON',
          address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
          decimals: 18
        },
        token1: {
          symbol: 'USDC',
          address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
          decimals: 6
        },
        fallback: {
          volume24hUsd: 272586,  // Real data from Pool table
          fees24hUsd: 818,       // 0.3% of volume
          apr: 15.03,            // Real APY from Pool table
          isActive: true
        }
      }
    ]
  }
}
