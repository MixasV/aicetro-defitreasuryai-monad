export interface GasData {
  current: number
  average24h: number
  history: number[]
}

export interface LowGasPeriod {
  estimatedHours: number
  estimatedGasPrice: number
}

export interface MarketSentiment {
  fearGreedIndex: number
  sentiment: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed'
  btcDominance?: number
  totalMarketCap?: number
}

export interface ProtocolMetric {
  id: string
  chain: 'monad'
  tvl: number
  apy: number
  apyTrend7d: number
  volume24h: number
  riskScore: number
  liquidityDepth: number
}

export interface MarketContext {
  network: {
    name: 'monad-testnet'
    currentGasPrice: number
    averageGasPrice24h: number
    gasPriceTrend: 'rising' | 'falling' | 'stable'
    nextLowGasPeriod?: LowGasPeriod
  }
  market: MarketSentiment
  protocols: ProtocolMetric[]
  timestamp: string
}

export interface TransactionCostParams {
  action: 'deposit' | 'withdraw' | 'swap'
  protocol: string
  amountUSD: number
  expectedAPY: number
  portfolioTotalUSD: number
  aiManagedCapitalUSD: number
  accountAddress: string
  isEmergency?: boolean // Bypass fee limits for emergency operations
}

export interface FeeLimitStatus {
  monthlyLimit: number
  spent30Days: number
  remaining: number
  withinLimit: boolean
  percentUsed: number
  bypassedDueToEmergency?: boolean
}

export interface TransactionCost {
  estimatedGasUnits: number
  currentGasPriceGwei: number
  estimatedCostUSD: number
  optimizedGasPriceGwei?: number
  optimizedCostUSD?: number
  potentialSavingsUSD?: number
  hoursToWait?: number
  dailyYieldUSD: number
  daysToBreakEven: number
  worthExecuting: boolean
  feeLimitStatus: FeeLimitStatus
}

export interface ImpactAnalysisParams {
  protocol: string
  amountUSD: number
}

export interface ImpactAnalysis {
  poolLiquidity: number
  tradeSize: number
  impactPercent: number
  estimatedSlippageUSD: number
  recommendation: 'safe' | 'caution' | 'risky'
  suggestedMaxSize?: number
  reasoning: string
}
