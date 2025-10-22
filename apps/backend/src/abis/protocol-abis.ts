/**
 * Protocol ABIs for DeFi interactions
 * 
 * Standard ABIs for common DeFi protocols on Monad:
 * - Aave V3 Pool
 * - Yearn V2 Vault
 * - Uniswap V2 Router
 * - ERC20 Token
 */

import type { Abi } from 'viem'

/**
 * Aave V3 Pool ABI (minimal for deposit/withdraw)
 */
export const AAVE_POOL_ABI: Abi = [
  {
    name: 'supply',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'onBehalfOf', type: 'address' },
      { name: 'referralCode', type: 'uint16' }
    ],
    outputs: []
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'asset', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'to', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

/**
 * Yearn V2 Vault ABI (minimal for deposit/withdraw)
 */
export const YEARN_VAULT_ABI: Abi = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_amount', type: 'uint256' },
      { name: '_recipient', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: '_shares', type: 'uint256' },
      { name: '_recipient', type: 'address' },
      { name: '_maxLoss', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

/**
 * Nabla Pool ABI (minimal for addLiquidity/removeLiquidity)
 */
export const NABLA_POOL_ABI: Abi = [
  {
    name: 'addLiquidity',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'shares', type: 'uint256' }]
  },
  {
    name: 'removeLiquidity',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'shares', type: 'uint256' },
      { name: 'minAmount', type: 'uint256' }
    ],
    outputs: [{ name: 'amount', type: 'uint256' }]
  }
] as const

/**
 * Uniswap V2 Router ABI (minimal for swaps)
 */
export const UNISWAP_V2_ROUTER_ABI: Abi = [
  {
    name: 'swapExactTokensForTokens',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [{ name: 'amounts', type: 'uint256[]' }]
  }
] as const

/**
 * ERC20 Token ABI (approve for spending)
 */
export const ERC20_ABI: Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

/**
 * Get protocol ABI by name
 */
export function getProtocolABI(protocol: string): Abi {
  const normalized = protocol.toLowerCase()
  
  if (normalized.includes('aave')) return AAVE_POOL_ABI
  if (normalized.includes('yearn')) return YEARN_VAULT_ABI
  if (normalized.includes('nabla')) return NABLA_POOL_ABI
  if (normalized.includes('uniswap')) return UNISWAP_V2_ROUTER_ABI
  
  throw new Error(`Unknown protocol: ${protocol}`)
}
