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
  nabla: {
    name: string
    pools: MonadProtocolPoolConfig[]
  }
  uniswapV2: {
    name: string
    factory: `0x${string}`
    pairs: MonadProtocolPairConfig[]
  }
}

export const MONAD_PROTOCOLS: MonadProtocolsConfig = {
  nabla: {
    name: 'Nabla Finance',
    pools: [
      {
        id: 'nabla:usdc',
        address: '0x01B0932F609caE2Ac96DaF6f2319c7dd7cEb4426',
        assetSymbol: 'USDC',
        assetAddress: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
        decimals: 6,
        fallback: {
          currentApy: 31.6,
          tvlUsd: 2_500_000,
          volume24hUsd: 150_000,
          fees24hUsd: 450,
          riskScore: 6,
          isActive: true
        }
      },
      {
        id: 'nabla:usdt',
        address: '0x356Fa6Db41717eccE81e7732A42eB4E99AE0D7D9',
        assetSymbol: 'USDT',
        assetAddress: '0xfBC2D240A5eD44231AcA3A9e9066bc4b33f01149',
        decimals: 6,
        fallback: {
          currentApy: 33.0,
          tvlUsd: 1_800_000,
          volume24hUsd: 120_000,
          fees24hUsd: 360,
          riskScore: 6,
          isActive: true
        }
      },
      {
        id: 'nabla:wbtc',
        address: '0x5b90901818F0d92825F8b19409323C82ABe911FC',
        assetSymbol: 'WBTC',
        fallback: {
          currentApy: 31.0,
          tvlUsd: 890_000,
          volume24hUsd: 80_000,
          fees24hUsd: 240,
          riskScore: 7,
          isActive: true
        }
      }
    ]
  },
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
          volume24hUsd: 150_000,
          fees24hUsd: 450,
          apr: 9.8,
          isActive: true
        }
      },
      {
        id: 'uniswap:usdc-wmon',
        pairAddress: '0x5323821dE342c56b80c99fbc7cD725f2da8eB87B',
        token0: {
          symbol: 'USDC',
          address: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
          decimals: 6
        },
        token1: {
          symbol: 'WMON',
          address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
          decimals: 18
        },
        fallback: {
          volume24hUsd: 95_000,
          fees24hUsd: 285,
          apr: 7.5,
          isActive: true
        }
      }
    ]
  }
}
