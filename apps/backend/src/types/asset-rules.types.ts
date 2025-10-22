export interface AssetRule {
  token: string
  symbol: string
  maxAllocationPercent: number
  currentAllocation: number
  allowedChains: string[]
  canSwap: boolean
  swapPairs?: string[]
  canBridge: boolean
}

export interface AssetManagementRules {
  id: string
  accountAddress: string
  aiManagedCapital: number
  totalCapital: number
  assets: AssetRule[]
  maxFeesMonthly: number
  autoReinvest: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateAssetRulesParams {
  accountAddress: string
  aiManagedCapital: number
  totalCapital: number
  assets: AssetRule[]
}

export interface UpdateAllocationParams {
  accountAddress: string
  asset: string
  deltaUSD: number
}

export interface ValidateActionParams {
  accountAddress: string
  action: 'deposit' | 'withdraw' | 'swap'
  asset: string
  amountUSD: number
  toAsset?: string
}

export interface CapitalTransactionParams {
  accountAddress: string
  type: 'allocate_to_ai' | 'withdraw_from_ai' | 'profit' | 'loss'
  amount: number
  reason?: string
  txHash?: string
}
