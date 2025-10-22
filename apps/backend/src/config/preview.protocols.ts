import type { PreviewProtocolCategory } from '@defitreasuryai/types'

export interface PreviewProtocolSourceConfig {
  id: string
  name: string
  category: PreviewProtocolCategory
  chain: string
  symbol?: string // Now used for Alchemy Prices API (was CoinGecko ID)
  url?: string
  riskScore: number
  fallbackApy: number
  fallbackTvlUsd: number
  fallbackVolume24hUsd?: number
  sources?: {
    defiLlamaPoolId?: string
    coinGeckoId?: string // Deprecated: Now using symbol with Alchemy API
    oneInchAddress?: string
  }
}

export const PREVIEW_PROTOCOL_CONFIG: PreviewProtocolSourceConfig[] = [
  {
    id: 'aave-v3-ethereum',
    name: 'Aave V3',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'AAVE',
    url: 'https://app.aave.com',
    riskScore: 2,
    fallbackApy: 4.2,
    fallbackTvlUsd: 5200000000,
    fallbackVolume24hUsd: 850000000,
    sources: {
      defiLlamaPoolId: 'aave-v3-ethereum'
    }
  },
  {
    id: 'compound-v3-usdc',
    name: 'Compound V3 USDC',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'COMP',
    url: 'https://app.compound.finance',
    riskScore: 2,
    fallbackApy: 3.6,
    fallbackTvlUsd: 2300000000,
    fallbackVolume24hUsd: 410000000,
    sources: {
      defiLlamaPoolId: 'compound-v3-usdc'
    }
  },
  {
    id: 'makerdao-dsr',
    name: 'MakerDAO DSR',
    category: 'stablecoin',
    chain: 'ethereum',
    symbol: 'DAI',
    url: 'https://oasis.app',
    riskScore: 1,
    fallbackApy: 5,
    fallbackTvlUsd: 3100000000,
    fallbackVolume24hUsd: 120000000,
    sources: {
      defiLlamaPoolId: 'makerdao-dsr'
    }
  },
  {
    id: 'curve-3pool',
    name: 'Curve 3pool',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'CRV',
    url: 'https://curve.fi',
    riskScore: 3,
    fallbackApy: 7.5,
    fallbackTvlUsd: 2100000000,
    fallbackVolume24hUsd: 600000000,
    sources: {
      defiLlamaPoolId: 'curve-3pool'
    }
  },
  {
    id: 'uniswap-v3-usdc-eth',
    name: 'Uniswap V3 USDC/ETH 0.05%',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'UNI',
    url: 'https://app.uniswap.org',
    riskScore: 3,
    fallbackApy: 12.4,
    fallbackTvlUsd: 1800000000,
    fallbackVolume24hUsd: 1500000000,
    sources: {
      defiLlamaPoolId: 'uniswap-v3-ethereum-usdc-eth-0.05'
    }
  },
  {
    id: 'balancer-boosted-aave',
    name: 'Balancer Boosted Aave',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'BAL',
    url: 'https://app.balancer.fi',
    riskScore: 3,
    fallbackApy: 8.1,
    fallbackTvlUsd: 920000000,
    fallbackVolume24hUsd: 250000000,
    sources: {
      defiLlamaPoolId: 'balancer-boosted-aave'
    }
  },
  {
    id: 'yearn-ycrv',
    name: 'Yearn yCRV Vault',
    category: 'yield',
    chain: 'ethereum',
    symbol: 'YFI',
    url: 'https://yearn.fi',
    riskScore: 3,
    fallbackApy: 9.4,
    fallbackTvlUsd: 480000000,
    fallbackVolume24hUsd: 96000000,
    sources: {
      defiLlamaPoolId: 'yearn-finance-ycrv'
    }
  },
  {
    id: 'lido-steth',
    name: 'Lido stETH',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'stETH',
    url: 'https://stake.lido.fi',
    riskScore: 2,
    fallbackApy: 3.7,
    fallbackTvlUsd: 16000000000,
    fallbackVolume24hUsd: 520000000,
    sources: {
      defiLlamaPoolId: 'lido-steth'
    }
  },
  {
    id: 'rocketpool-reth',
    name: 'Rocket Pool rETH',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'rETH',
    url: 'https://rocketpool.net',
    riskScore: 2,
    fallbackApy: 3.3,
    fallbackTvlUsd: 2200000000,
    fallbackVolume24hUsd: 78000000,
    sources: {
      defiLlamaPoolId: 'rocket-pool-reth'
    }
  },
  {
    id: 'frax-eth',
    name: 'Frax ETH',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'frxETH',
    url: 'https://app.frax.finance',
    riskScore: 3,
    fallbackApy: 6.1,
    fallbackTvlUsd: 970000000,
    fallbackVolume24hUsd: 120000000,
    sources: {
      defiLlamaPoolId: 'frax-eth-staking'
    }
  },
  {
    id: 'gmx-perps',
    name: 'GMX Perpetuals',
    category: 'derivatives',
    chain: 'arbitrum',
    symbol: 'GMX',
    url: 'https://gmx.io',
    riskScore: 4,
    fallbackApy: 18.5,
    fallbackTvlUsd: 620000000,
    fallbackVolume24hUsd: 450000000,
    sources: {
      defiLlamaPoolId: 'gmx-glp-arbitrum'
    }
  },
  {
    id: 'radiant-capital',
    name: 'Radiant Capital',
    category: 'lending',
    chain: 'arbitrum',
    symbol: 'RDNT',
    url: 'https://radiant.capital',
    riskScore: 4,
    fallbackApy: 11.2,
    fallbackTvlUsd: 450000000,
    fallbackVolume24hUsd: 67000000
  },
  {
    id: 'pendle-yield',
    name: 'Pendle Yield',
    category: 'derivatives',
    chain: 'ethereum',
    symbol: 'PENDLE',
    url: 'https://app.pendle.finance',
    riskScore: 4,
    fallbackApy: 24.6,
    fallbackTvlUsd: 520000000,
    fallbackVolume24hUsd: 89000000
  },
  {
    id: 'ribbon-finance',
    name: 'Ribbon Finance',
    category: 'yield',
    chain: 'ethereum',
    symbol: 'RBN',
    url: 'https://www.ribbon.finance',
    riskScore: 4,
    fallbackApy: 13.9,
    fallbackTvlUsd: 280000000,
    fallbackVolume24hUsd: 42000000
  },
  {
    id: 'synthetix-perps',
    name: 'Synthetix Perps',
    category: 'derivatives',
    chain: 'optimism',
    symbol: 'SNX',
    url: 'https://synthetix.io',
    riskScore: 3,
    fallbackApy: 16.7,
    fallbackTvlUsd: 510000000,
    fallbackVolume24hUsd: 380000000
  },
  {
    id: 'instadapp-lite',
    name: 'InstaDapp Lite',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'INST',
    url: 'https://instadapp.io',
    riskScore: 3,
    fallbackApy: 8.9,
    fallbackTvlUsd: 310000000,
    fallbackVolume24hUsd: 36000000
  },
  {
    id: 'morpho-aave',
    name: 'Morpho Optimizer',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'MORPHO',
    url: 'https://www.morpho.xyz',
    riskScore: 3,
    fallbackApy: 5.7,
    fallbackTvlUsd: 1900000000,
    fallbackVolume24hUsd: 210000000
  },
  {
    id: 'lybra-finance',
    name: 'Lybra Finance',
    category: 'stablecoin',
    chain: 'ethereum',
    symbol: 'LBR',
    url: 'https://lybra.finance',
    riskScore: 4,
    fallbackApy: 14.2,
    fallbackTvlUsd: 320000000,
    fallbackVolume24hUsd: 53000000
  },
  {
    id: 'angle-protocol',
    name: 'Angle Protocol',
    category: 'stablecoin',
    chain: 'ethereum',
    symbol: 'ANGLE',
    url: 'https://app.angle.money',
    riskScore: 3,
    fallbackApy: 7.3,
    fallbackTvlUsd: 270000000,
    fallbackVolume24hUsd: 48000000
  },
  {
    id: 'stakewise',
    name: 'StakeWise v3',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'osETH',
    url: 'https://stakewise.io',
    riskScore: 3,
    fallbackApy: 3.5,
    fallbackTvlUsd: 640000000,
    fallbackVolume24hUsd: 62000000
  },
  {
    id: 'beefy-finance',
    name: 'Beefy Finance',
    category: 'yield',
    chain: 'multichain',
    symbol: 'BIFI',
    url: 'https://app.beefy.finance',
    riskScore: 4,
    fallbackApy: 19.1,
    fallbackTvlUsd: 880000000,
    fallbackVolume24hUsd: 93000000
  },
  {
    id: 'maple-finance',
    name: 'Maple Finance',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'MPL',
    url: 'https://maple.finance',
    riskScore: 4,
    fallbackApy: 10.8,
    fallbackTvlUsd: 370000000,
    fallbackVolume24hUsd: 41000000
  },
  {
    id: 'mux-protocol',
    name: 'MUX Protocol',
    category: 'derivatives',
    chain: 'arbitrum',
    symbol: 'MCB',
    url: 'https://mux.network',
    riskScore: 4,
    fallbackApy: 21.4,
    fallbackTvlUsd: 260000000,
    fallbackVolume24hUsd: 270000000
  },
  {
    id: 'idle-finance',
    name: 'Idle Finance',
    category: 'yield',
    chain: 'ethereum',
    symbol: 'IDLE',
    url: 'https://idle.finance',
    riskScore: 3,
    fallbackApy: 6.7,
    fallbackTvlUsd: 150000000,
    fallbackVolume24hUsd: 19000000
  },
  {
    id: 'rari-fuse',
    name: 'Rari Fuse Pools',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'TRIBE',
    url: 'https://rari.capital',
    riskScore: 5,
    fallbackApy: 22.3,
    fallbackTvlUsd: 120000000,
    fallbackVolume24hUsd: 25000000
  },
  {
    id: 'maple-usdc-pool',
    name: 'Maple USDC Pool',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'USDC',
    url: 'https://maple.finance',
    riskScore: 4,
    fallbackApy: 9.5,
    fallbackTvlUsd: 210000000,
    fallbackVolume24hUsd: 32000000
  },
  {
    id: 'makerdao-sdai',
    name: 'MakerDAO sDAI',
    category: 'stablecoin',
    chain: 'ethereum',
    symbol: 'sDAI',
    url: 'https://spark.fi',
    riskScore: 2,
    fallbackApy: 5.2,
    fallbackTvlUsd: 1300000000,
    fallbackVolume24hUsd: 90000000
  },
  {
    id: 'spark-protocol',
    name: 'Spark Protocol',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'SPARK',
    url: 'https://spark.fi',
    riskScore: 3,
    fallbackApy: 6.9,
    fallbackTvlUsd: 980000000,
    fallbackVolume24hUsd: 150000000
  },
  {
    id: 'frax-lend',
    name: 'FraxLend',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'FXS',
    url: 'https://app.frax.finance',
    riskScore: 4,
    fallbackApy: 18.2,
    fallbackTvlUsd: 420000000,
    fallbackVolume24hUsd: 69000000
  },
  {
    id: 'velodrome-v2',
    name: 'Velodrome V2',
    category: 'dex',
    chain: 'optimism',
    symbol: 'VELO',
    url: 'https://app.velodrome.finance',
    riskScore: 4,
    fallbackApy: 26.5,
    fallbackTvlUsd: 360000000,
    fallbackVolume24hUsd: 290000000
  },
  {
    id: 'curve-tricrypto',
    name: 'Curve TriCrypto',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'CRV',
    url: 'https://curve.fi',
    riskScore: 4,
    fallbackApy: 15.9,
    fallbackTvlUsd: 870000000,
    fallbackVolume24hUsd: 410000000
  },
  {
    id: 'perpetual-protocol',
    name: 'Perpetual Protocol',
    category: 'derivatives',
    chain: 'optimism',
    symbol: 'PERP',
    url: 'https://app.perp.com',
    riskScore: 4,
    fallbackApy: 17.3,
    fallbackTvlUsd: 190000000,
    fallbackVolume24hUsd: 160000000
  },
  {
    id: 'dydx-v3',
    name: 'dYdX V3',
    category: 'derivatives',
    chain: 'ethereum',
    symbol: 'DYDX',
    url: 'https://dydx.exchange',
    riskScore: 3,
    fallbackApy: 9.8,
    fallbackTvlUsd: 720000000,
    fallbackVolume24hUsd: 980000000
  },
  {
    id: 'stargate-eth',
    name: 'Stargate ETH Pool',
    category: 'infrastructure',
    chain: 'ethereum',
    symbol: 'STG',
    url: 'https://stargate.finance',
    riskScore: 3,
    fallbackApy: 7.1,
    fallbackTvlUsd: 560000000,
    fallbackVolume24hUsd: 74000000
  },
  {
    id: 'synapse-bridge',
    name: 'Synapse Bridge Pool',
    category: 'infrastructure',
    chain: 'multichain',
    symbol: 'SYN',
    url: 'https://synapseprotocol.com',
    riskScore: 4,
    fallbackApy: 10.4,
    fallbackTvlUsd: 430000000,
    fallbackVolume24hUsd: 68000000
  },
  {
    id: 'origin-eth',
    name: 'Origin Ether',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'OETH',
    url: 'https://www.originprotocol.com/oeth',
    riskScore: 3,
    fallbackApy: 6.8,
    fallbackTvlUsd: 360000000,
    fallbackVolume24hUsd: 54000000
  },
  {
    id: 'coinbase-wrapped-staked-eth',
    name: 'Coinbase Wrapped Staked ETH',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'cbETH',
    url: 'https://www.coinbase.com/prime/staking',
    riskScore: 2,
    fallbackApy: 3.4,
    fallbackTvlUsd: 740000000,
    fallbackVolume24hUsd: 65000000
  },
  {
    id: 'notional-finance',
    name: 'Notional Finance',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'NOTE',
    url: 'https://notional.finance',
    riskScore: 4,
    fallbackApy: 14.8,
    fallbackTvlUsd: 250000000,
    fallbackVolume24hUsd: 28000000
  },
  {
    id: 'maple-senior-tranche',
    name: 'Maple Senior Tranche',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'USDC',
    url: 'https://maple.finance',
    riskScore: 4,
    fallbackApy: 8.2,
    fallbackTvlUsd: 140000000,
    fallbackVolume24hUsd: 19000000
  },
  {
    id: 'enso-finance',
    name: 'Enso Finance',
    category: 'yield',
    chain: 'ethereum',
    symbol: 'ENSO',
    url: 'https://enso.finance',
    riskScore: 4,
    fallbackApy: 17.5,
    fallbackTvlUsd: 160000000,
    fallbackVolume24hUsd: 24000000
  },
  {
    id: 'origin-usd',
    name: 'Origin Dollar',
    category: 'stablecoin',
    chain: 'ethereum',
    symbol: 'OUSD',
    url: 'https://www.ousd.com',
    riskScore: 3,
    fallbackApy: 7.9,
    fallbackTvlUsd: 320000000,
    fallbackVolume24hUsd: 50000000
  },
  {
    id: 'frax-basepool',
    name: 'Curve Frax Basepool',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'CRV',
    url: 'https://curve.fi',
    riskScore: 3,
    fallbackApy: 9.2,
    fallbackTvlUsd: 610000000,
    fallbackVolume24hUsd: 270000000
  },
  {
    id: 'liqee-eth',
    name: 'Liqee ETH Market',
    category: 'lending',
    chain: 'ethereum',
    symbol: 'LQE',
    url: 'https://liqee.io',
    riskScore: 4,
    fallbackApy: 12.6,
    fallbackTvlUsd: 180000000,
    fallbackVolume24hUsd: 22000000
  },
  {
    id: 'hashflow',
    name: 'Hashflow RFQ',
    category: 'dex',
    chain: 'multichain',
    symbol: 'HFT',
    url: 'https://www.hashflow.com',
    riskScore: 3,
    fallbackApy: 8.4,
    fallbackTvlUsd: 420000000,
    fallbackVolume24hUsd: 310000000
  },
  {
    id: '1inch-fusion',
    name: '1inch Fusion',
    category: 'dex',
    chain: 'multichain',
    symbol: '1INCH',
    url: 'https://app.1inch.io',
    riskScore: 3,
    fallbackApy: 5.6,
    fallbackTvlUsd: 510000000,
    fallbackVolume24hUsd: 450000000,
    sources: {
      oneInchAddress: '0x1111111254fb6c44bac0bed2854e76f90643097d'
    }
  },
  {
    id: 'paraswap-delta',
    name: 'ParaSwap Delta',
    category: 'dex',
    chain: 'multichain',
    symbol: 'PSP',
    url: 'https://app.paraswap.io',
    riskScore: 3,
    fallbackApy: 6.1,
    fallbackTvlUsd: 330000000,
    fallbackVolume24hUsd: 280000000
  },
  {
    id: 'arrakis-finance',
    name: 'Arrakis Finance',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'SPICE',
    url: 'https://www.arrakis.finance',
    riskScore: 3,
    fallbackApy: 10.7,
    fallbackTvlUsd: 290000000,
    fallbackVolume24hUsd: 110000000
  },
  {
    id: 'gelato-guni',
    name: 'Gelato G-Uni',
    category: 'dex',
    chain: 'ethereum',
    symbol: 'GEL',
    url: 'https://www.gelato.network',
    riskScore: 3,
    fallbackApy: 9.5,
    fallbackTvlUsd: 260000000,
    fallbackVolume24hUsd: 87000000
  },
  {
    id: 'akash-network',
    name: 'Akash Liquid Staking',
    category: 'infrastructure',
    chain: 'cosmos',
    symbol: 'AKT',
    url: 'https://akash.network',
    riskScore: 4,
    fallbackApy: 19.8,
    fallbackTvlUsd: 210000000,
    fallbackVolume24hUsd: 26000000
  },
  {
    id: 'quickswap-v3',
    name: 'QuickSwap V3',
    category: 'dex',
    chain: 'polygon',
    symbol: 'QUICK',
    url: 'https://quickswap.exchange',
    riskScore: 3,
    fallbackApy: 14.6,
    fallbackTvlUsd: 380000000,
    fallbackVolume24hUsd: 240000000
  },
  {
    id: 'stader-ethx',
    name: 'Stader ETHx',
    category: 'lsd',
    chain: 'ethereum',
    symbol: 'ETHx',
    url: 'https://www.staderlabs.com/eth',
    riskScore: 3,
    fallbackApy: 4.1,
    fallbackTvlUsd: 330000000,
    fallbackVolume24hUsd: 45000000
  },
  {
    id: 'metalend',
    name: 'MetaLend',
    category: 'lending',
    chain: 'polygon',
    symbol: 'MLT',
    url: 'https://metalend.fi',
    riskScore: 4,
    fallbackApy: 16.3,
    fallbackTvlUsd: 150000000,
    fallbackVolume24hUsd: 20000000
  },
  {
    id: 'benqi-lending',
    name: 'Benqi Lending',
    category: 'lending',
    chain: 'avalanche',
    symbol: 'QI',
    url: 'https://benqi.fi',
    riskScore: 3,
    fallbackApy: 8.5,
    fallbackTvlUsd: 410000000,
    fallbackVolume24hUsd: 76000000
  },
  {
    id: 'trader-joe-v2',
    name: 'Trader Joe Liquidity Book',
    category: 'dex',
    chain: 'avalanche',
    symbol: 'JOE',
    url: 'https://traderjoexyz.com',
    riskScore: 3,
    fallbackApy: 18.9,
    fallbackTvlUsd: 390000000,
    fallbackVolume24hUsd: 210000000
  },
  {
    id: 'vector-finance',
    name: 'Vector Finance',
    category: 'yield',
    chain: 'avalanche',
    symbol: 'VTX',
    url: 'https://vectorfinance.io',
    riskScore: 4,
    fallbackApy: 20.4,
    fallbackTvlUsd: 170000000,
    fallbackVolume24hUsd: 23000000
  },
  {
    id: 'midas-capital',
    name: 'Midas Capital',
    category: 'lending',
    chain: 'polygon',
    symbol: 'MIDAS',
    url: 'https://midascapital.xyz',
    riskScore: 4,
    fallbackApy: 14.1,
    fallbackTvlUsd: 120000000,
    fallbackVolume24hUsd: 18000000
  },
  {
    id: 'granary-finance',
    name: 'Granary Finance',
    category: 'lending',
    chain: 'optimism',
    symbol: 'GRAIN',
    url: 'https://granary.finance',
    riskScore: 4,
    fallbackApy: 12.2,
    fallbackTvlUsd: 140000000,
    fallbackVolume24hUsd: 21000000
  },
  {
    id: 'origin-degen',
    name: 'Origin DeFi Index',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'DEGEN',
    url: 'https://www.originprotocol.com',
    riskScore: 4,
    fallbackApy: 18.8,
    fallbackTvlUsd: 110000000,
    fallbackVolume24hUsd: 15000000
  },
  {
    id: 'metastreet',
    name: 'MetaStreet Vault',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'MST',
    url: 'https://metastreet.xyz',
    riskScore: 4,
    fallbackApy: 15.4,
    fallbackTvlUsd: 90000000,
    fallbackVolume24hUsd: 12000000
  },
  {
    id: 'maple-crypto-credit',
    name: 'Maple Crypto Credit',
    category: 'treasury',
    chain: 'ethereum',
    symbol: 'USDC',
    url: 'https://maple.finance',
    riskScore: 5,
    fallbackApy: 11.6,
    fallbackTvlUsd: 80000000,
    fallbackVolume24hUsd: 10000000
  }
]
