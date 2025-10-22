export const DEMO_CORPORATE_ACCOUNT = '0xcccccccccccccccccccccccccccccccccccccccc'
export const DEMO_DELEGATE = '0xa11ce00000000000000000000000000000000001'
export const DEMO_OWNERS = ['0xOwner1', '0xOwner2', '0xOwner3']
export const DEMO_THRESHOLD = 2
// ✅ FIXED: Only real protocols available on Monad Testnet
// Monad currently has ONLY Uniswap V2 pools (no Aave, Yearn, Compound!)
export const DEMO_PROTOCOLS = ['Uniswap V2'] as const

// Virtual portfolio starting balance for demo mode
export const DEMO_VIRTUAL_BALANCE_USD = 100_000

// Configured daily limit for demo AI agent: same as virtual balance
export const DEMO_DAILY_LIMIT_USD = DEMO_VIRTUAL_BALANCE_USD
export const DEMO_INITIAL_SPENT_24H = 0
export const DEMO_MAX_RISK_SCORE = 4
