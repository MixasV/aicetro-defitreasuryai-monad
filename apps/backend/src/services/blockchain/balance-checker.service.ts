/**
 * Balance Checker Service
 * 
 * Checks user's total capital across ALL CHAINS using Alchemy Portfolio API
 * to determine if multi-sig is required (>$100,000 threshold)
 */

import axios from 'axios'
import { env } from '../../config/env'

const SUPPORTED_NETWORKS = [
  'eth-mainnet',
  'polygon-mainnet',
  'arb-mainnet',
  'opt-mainnet',
  'base-mainnet',
] as const

// Monad Testnet Uniswap V2 WMON/USDC pair address
const WMON_USDC_PAIR = '0x5323821dE342c56b80c99fbc7cD725f2da8eB87B'

interface TokenBalance {
  symbol: string
  network: string
  address: string
  balance: string
  valueUSD: number
  decimals: number
}

interface CapitalCheckResult {
  totalUSD: number
  tokens: TokenBalance[]
  requiresMultisig: boolean
  recommendedMode: 'simple' | 'corporate'
  networksScanned: string[]
  checkedAt: Date
}

class BalanceCheckerService {
  private apiKey: string | undefined
  private cache = new Map<string, { data: CapitalCheckResult; expiresAt: number }>()
  private CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.apiKey = env.alchemyApiKey
    if (!this.apiKey) {
      console.warn('[BalanceChecker] Alchemy API key not configured')
    }
  }

  async checkTotalCapital(userAddress: string): Promise<CapitalCheckResult> {
    const cached = this.cache.get(userAddress.toLowerCase())
    if (cached && Date.now() < cached.expiresAt) {
      console.log('[BalanceChecker] Using cached data for:', userAddress)
      return cached.data
    }

    console.log('[BalanceChecker] Checking total capital across all chains for:', userAddress)

    if (!this.apiKey) {
      console.warn('[BalanceChecker] No Alchemy API key - returning zero balance')
      return this.getFallbackResult()
    }

    try {
      const networkResults = await Promise.allSettled(
        SUPPORTED_NETWORKS.map((network) => this.scanNetwork(userAddress, network))
      )

      const allTokens: TokenBalance[] = []
      const networksScanned: string[] = []

      for (let i = 0; i < networkResults.length; i++) {
        const result = networkResults[i]
        const network = SUPPORTED_NETWORKS[i]

        if (result.status === 'fulfilled' && result.value.length > 0) {
          allTokens.push(...result.value)
          networksScanned.push(network)
          console.log(`[BalanceChecker] ${network}: Found ${result.value.length} tokens`)
        } else if (result.status === 'rejected') {
          console.warn(`[BalanceChecker] ${network}: Scan failed:`, result.reason)
        }
      }

      // ✅ CRITICAL FIX: Alchemy doesn't support Monad Testnet yet!
      // Check MON balance directly via ethers.js
      try {
        const monadBalance = await this.getMonadBalance(userAddress)
        if (monadBalance && monadBalance.valueUSD > 0) {
          allTokens.push(monadBalance)
          networksScanned.push('monad-testnet')
          console.log(`[BalanceChecker] monad-testnet: Found MON balance: $${monadBalance.valueUSD.toFixed(2)}`)
        }
      } catch (error) {
        console.error('[BalanceChecker] Failed to check Monad balance:', error)
      }

      const totalUSD = allTokens.reduce((sum, token) => sum + token.valueUSD, 0)
      const requiresMultisig = totalUSD > 100000
      const recommendedMode = totalUSD > 100000 ? 'corporate' : 'simple'

      const capitalResult: CapitalCheckResult = {
        totalUSD,
        tokens: allTokens,
        requiresMultisig,
        recommendedMode,
        networksScanned,
        checkedAt: new Date(),
      }

      this.cache.set(userAddress.toLowerCase(), {
        data: capitalResult,
        expiresAt: Date.now() + this.CACHE_TTL,
      })

      console.log('[BalanceChecker] Multi-chain scan complete:', {
        user: userAddress,
        totalUSD: totalUSD.toFixed(2),
        tokensFound: allTokens.length,
        networksScanned: networksScanned.length,
        requiresMultisig,
        recommendedMode,
      })

      return capitalResult
    } catch (error: any) {
      console.error('[BalanceChecker] Error checking balance:', error)
      return this.getFallbackResult()
    }
  }

  private async scanNetwork(userAddress: string, network: string): Promise<TokenBalance[]> {
    try {
      const url = `https://${network}.g.alchemy.com/v2/${this.apiKey}`
      
      const response = await axios.post(
        url,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenBalances',
          params: [userAddress, 'erc20'],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      )

      if (!response.data.result || !response.data.result.tokenBalances) {
        return []
      }

      const tokenBalances = response.data.result.tokenBalances

      const tokensWithMetadata = await Promise.all(
        tokenBalances
          .filter((t: any) => t.tokenBalance && t.tokenBalance !== '0x0' && !t.error)
          .slice(0, 20)
          .map((t: any) => this.enrichTokenData(userAddress, t, network))
      )

      return tokensWithMetadata.filter((t): t is TokenBalance => t !== null)
    } catch (error: any) {
      console.warn(`[BalanceChecker] ${network} scan failed:`, error.message)
      return []
    }
  }

  private async enrichTokenData(
    userAddress: string,
    token: any,
    network: string
  ): Promise<TokenBalance | null> {
    try {
      const url = `https://${network}.g.alchemy.com/v2/${this.apiKey}`
      
      const metadataResponse = await axios.post(
        url,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getTokenMetadata',
          params: [token.contractAddress],
        },
        { timeout: 5000 }
      )

      const metadata = metadataResponse.data.result

      if (!metadata || !metadata.symbol) {
        return null
      }

      const decimals = metadata.decimals || 18
      const balanceHex = token.tokenBalance
      const balanceBigInt = BigInt(balanceHex)
      const balanceFormatted = this.formatBalance(balanceBigInt, decimals)

      let valueUSD = 0
      try {
        const priceResponse = await axios.get(
          `https://api.g.alchemy.com/prices/v1/${this.apiKey}/tokens/by-address`,
          {
            params: {
              network: network.replace('-mainnet', ''),
              addresses: token.contractAddress,
            },
            timeout: 3000,
          }
        )

        const priceData = priceResponse.data?.data?.[0]
        if (priceData?.prices?.[0]?.value) {
          const pricePerToken = priceData.prices[0].value
          valueUSD = parseFloat(balanceFormatted) * pricePerToken
        }
      } catch (priceError) {
        console.debug(`[BalanceChecker] No price for ${metadata.symbol} on ${network}`)
      }

      return {
        symbol: metadata.symbol,
        network,
        address: token.contractAddress,
        balance: balanceFormatted,
        valueUSD,
        decimals,
      }
    } catch (error) {
      return null
    }
  }

  private formatBalance(balance: bigint, decimals: number): string {
    if (balance === 0n) return '0'

    const divisor = BigInt(10 ** decimals)
    const integerPart = balance / divisor
    const fractionalPart = balance % divisor

    if (fractionalPart === 0n) {
      return integerPart.toString()
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    const trimmed = fractionalStr.replace(/0+$/, '')

    if (trimmed === '') {
      return integerPart.toString()
    }

    return `${integerPart}.${trimmed}`
  }

  private getFallbackResult(): CapitalCheckResult {
    return {
      totalUSD: 0,
      tokens: [],
      requiresMultisig: false,
      recommendedMode: 'simple',
      networksScanned: [],
      checkedAt: new Date(),
    }
  }

  clearCache(userAddress: string): void {
    this.cache.delete(userAddress.toLowerCase())
    console.log('[BalanceChecker] Cache cleared for:', userAddress)
  }

  async hasSufficientBalance(userAddress: string, requiredUSD: number): Promise<boolean> {
    const capital = await this.checkTotalCapital(userAddress)
    return capital.totalUSD >= requiredUSD
  }

  /**
   * Get WMON price in USD from Uniswap V2 WMON/USDC pair
   * Uses real on-chain reserves: price = reserveUSDC / reserveWMON
   */
  private async getWMONPriceFromUniswapPair(): Promise<number> {
    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.JsonRpcProvider(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      
      // Uniswap V2 Pair ABI (minimal - only getReserves)
      const pairABI = [
        'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
        'function token0() external view returns (address)',
        'function token1() external view returns (address)'
      ]
      
      const pairContract = new ethers.Contract(WMON_USDC_PAIR, pairABI, provider)
      
      // Get reserves
      const [reserve0, reserve1] = await pairContract.getReserves()
      
      // Get token addresses to determine which is WMON and which is USDC
      const token0 = await pairContract.token0()
      const token1 = await pairContract.token1()
      
      // Get token symbols via ERC20 interface
      const erc20ABI = ['function symbol() external view returns (string)']
      const token0Contract = new ethers.Contract(token0, erc20ABI, provider)
      const token1Contract = new ethers.Contract(token1, erc20ABI, provider)
      
      const symbol0 = await token0Contract.symbol()
      const symbol1 = await token1Contract.symbol()
      
      let reserveUSDC: bigint
      let reserveWMON: bigint
      
      if (symbol0 === 'USDC') {
        reserveUSDC = reserve0
        reserveWMON = reserve1
      } else {
        reserveUSDC = reserve1
        reserveWMON = reserve0
      }
      
      // Calculate price: WMON price in USDC
      // USDC has 6 decimals, WMON has 18 decimals
      const priceWMON = parseFloat(ethers.formatUnits(reserveUSDC, 6)) / parseFloat(ethers.formatUnits(reserveWMON, 18))
      
      console.log('[BalanceChecker] WMON/USDC price from Uniswap:', {
        pair: WMON_USDC_PAIR,
        reserveUSDC: ethers.formatUnits(reserveUSDC, 6),
        reserveWMON: ethers.formatUnits(reserveWMON, 18),
        priceWMON: priceWMON.toFixed(4)
      })
      
      return priceWMON
    } catch (error) {
      console.error('[BalanceChecker] Failed to get WMON price from Uniswap:', error)
      // Fallback price
      return 5.0
    }
  }

  /**
   * Get MON balance on Monad Testnet via direct RPC call
   * Calculates USD value using WMON/USDC Uniswap V2 pair price
   * Logic: 1 MON = 1 WMON, WMON price from WMON/USDC pool, USDC = $1
   */
  private async getMonadBalance(userAddress: string): Promise<TokenBalance | null> {
    try {
      const { ethers } = await import('ethers')
      const provider = new ethers.JsonRpcProvider(env.monadRpcUrl || 'https://testnet-rpc.monad.xyz')
      
      const balance = await provider.getBalance(userAddress)
      const balanceMON = parseFloat(ethers.formatEther(balance))
      
      if (balanceMON === 0) {
        return null
      }
      
      // Get real WMON price from Uniswap V2 WMON/USDC pair
      const wmonPriceUSD = await this.getWMONPriceFromUniswapPair()
      
      // 1 MON = 1 WMON (per user's requirement)
      const valueUSD = balanceMON * wmonPriceUSD
      
      console.log('[BalanceChecker] Monad balance calculated:', {
        address: userAddress,
        balanceMON: balanceMON.toFixed(4),
        wmonPriceUSD: wmonPriceUSD.toFixed(4),
        valueUSD: valueUSD.toFixed(2)
      })
      
      return {
        symbol: 'MON',
        network: 'monad-testnet',
        address: '0x0000000000000000000000000000000000000000', // Native token
        balance: balanceMON.toString(),
        valueUSD,
        decimals: 18
      }
    } catch (error) {
      console.error('[BalanceChecker] Failed to get Monad balance:', error)
      return null
    }
  }
}

export const balanceCheckerService = new BalanceCheckerService()
