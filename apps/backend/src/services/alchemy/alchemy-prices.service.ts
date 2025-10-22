/**
 * Alchemy Prices API Service
 * 
 * Get real-time and historical token prices across chains
 * Supports: CEX prices (by symbol), DEX prices (by address), historical data
 */

import { env } from '../../config/env'

interface TokenPriceBySymbol {
  symbol: string
  prices: Array<{
    currency: string
    value: string
    lastUpdatedAt: number
  }>
}

interface TokenPriceByAddress {
  network: string
  address: string
  prices: Array<{
    currency: string
    value: string
    lastUpdatedAt: number
  }>
}

interface HistoricalPrice {
  timestamp: number
  value: string
}

interface TokenMetadata {
  symbol: string
  name: string
  decimals: number
  logo?: string
}

export class AlchemyPricesService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = env.alchemyApiKey
    // Prices API is separate from chain-specific endpoints
    this.baseUrl = 'https://api.g.alchemy.com/prices/v1'
    
    console.log('[AlchemyPrices] Initialized')
  }

  /**
   * Get token price by symbol (e.g., "ETH", "BTC", "USDC")
   * 
   * Uses CEX + DEX aggregated data
   * Best for major tokens with tickers
   */
  async getTokenPriceBySymbol(
    symbol: string,
    currency: string = 'USD'
  ): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/tokens/by-symbol?symbols=${symbol}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Prices API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Find USD price
      const tokenData = data.data.find((t: TokenPriceBySymbol) => 
        t.symbol.toLowerCase() === symbol.toLowerCase()
      )
      
      if (!tokenData) {
        throw new Error(`Price not found for symbol: ${symbol}`)
      }
      
      const usdPrice = tokenData.prices.find((p: any) => p.currency === currency)
      
      if (!usdPrice) {
        throw new Error(`${currency} price not found for ${symbol}`)
      }
      
      return parseFloat(usdPrice.value)
    } catch (error) {
      console.error(`[AlchemyPrices] Error fetching price for ${symbol}:`, error)
      throw error
    }
  }

  /**
   * Get token price by contract address
   * 
   * Uses DEX data (Uniswap, etc.)
   * Best for custom tokens without tickers
   */
  async getTokenPriceByAddress(
    network: string,
    address: string,
    currency: string = 'USD'
  ): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/tokens/by-address?addresses=${network}:${address}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Prices API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        throw new Error(`Price not found for address: ${address}`)
      }
      
      const tokenData = data.data[0]
      const usdPrice = tokenData.prices.find((p: any) => p.currency === currency)
      
      if (!usdPrice) {
        throw new Error(`${currency} price not found for ${address}`)
      }
      
      return parseFloat(usdPrice.value)
    } catch (error) {
      console.error(`[AlchemyPrices] Error fetching price for ${address}:`, error)
      throw error
    }
  }

  /**
   * Get historical prices for a token
   * 
   * @param symbol - Token symbol (e.g., "ETH")
   * @param startTime - Start timestamp (seconds)
   * @param endTime - End timestamp (seconds)
   * @param interval - Data interval ("5m", "1h", "1d")
   */
  async getHistoricalPrices(
    symbol: string,
    startTime: number,
    endTime: number,
    interval: string = '1h'
  ): Promise<HistoricalPrice[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/tokens/historical?` +
        `symbol=${symbol}&startTime=${startTime}&endTime=${endTime}&interval=${interval}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Historical prices error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error(`[AlchemyPrices] Error fetching historical prices:`, error)
      throw error
    }
  }

  /**
   * Get multiple token prices at once (batch)
   */
  async getBatchPrices(
    symbols: string[],
    currency: string = 'USD'
  ): Promise<Map<string, number>> {
    try {
      const symbolsParam = symbols.join(',')
      const response = await fetch(
        `${this.baseUrl}/${this.apiKey}/tokens/by-symbol?symbols=${symbolsParam}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Batch prices error: ${response.statusText}`)
      }

      const data = await response.json()
      const priceMap = new Map<string, number>()
      
      for (const tokenData of data.data) {
        const usdPrice = tokenData.prices.find((p: any) => p.currency === currency)
        if (usdPrice) {
          priceMap.set(tokenData.symbol, parseFloat(usdPrice.value))
        }
      }
      
      return priceMap
    } catch (error) {
      console.error('[AlchemyPrices] Error fetching batch prices:', error)
      throw error
    }
  }

  /**
   * Get token metadata (name, symbol, decimals, logo)
   * 
   * Useful for UI display
   */
  async getTokenMetadata(
    network: string,
    address: string
  ): Promise<TokenMetadata> {
    try {
      // Use Token API (not Prices API) for metadata
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${this.apiKey}`
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [address],
          id: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Metadata error: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Metadata error: ${data.error.message}`)
      }
      
      return {
        symbol: data.result.symbol,
        name: data.result.name,
        decimals: data.result.decimals,
        logo: data.result.logo,
      }
    } catch (error) {
      console.error(`[AlchemyPrices] Error fetching metadata:`, error)
      throw error
    }
  }

  /**
   * Helper: Get price with fallback
   * 
   * Try by symbol first, then by address
   */
  async getPriceWithFallback(
    symbol: string,
    network: string,
    address: string
  ): Promise<number> {
    try {
      // Try by symbol (faster, more reliable for major tokens)
      return await this.getTokenPriceBySymbol(symbol)
    } catch {
      // Fallback to address-based (for custom tokens)
      try {
        return await this.getTokenPriceByAddress(network, address)
      } catch (error) {
        console.error(`[AlchemyPrices] Failed to get price for ${symbol}/${address}`)
        throw new Error(`Price not available for ${symbol}`)
      }
    }
  }

  /**
   * Calculate portfolio value in USD
   */
  async calculatePortfolioValue(
    tokens: Array<{
      symbol: string
      balance: bigint
      decimals: number
    }>
  ): Promise<{
    totalValueUsd: number
    breakdown: Array<{
      symbol: string
      balance: string
      priceUsd: number
      valueUsd: number
    }>
  }> {
    try {
      // Get all prices in batch
      const symbols = tokens.map(t => t.symbol)
      const prices = await this.getBatchPrices(symbols)
      
      let totalValue = 0
      const breakdown = []
      
      for (const token of tokens) {
        const price = prices.get(token.symbol) || 0
        const balance = Number(token.balance) / Math.pow(10, token.decimals)
        const value = balance * price
        
        totalValue += value
        
        breakdown.push({
          symbol: token.symbol,
          balance: balance.toFixed(4),
          priceUsd: price,
          valueUsd: value,
        })
      }
      
      return {
        totalValueUsd: totalValue,
        breakdown,
      }
    } catch (error) {
      console.error('[AlchemyPrices] Error calculating portfolio value:', error)
      throw error
    }
  }

  /**
   * Get price change (24h)
   * 
   * Compare current price vs 24h ago
   */
  async getPriceChange24h(symbol: string): Promise<{
    currentPrice: number
    price24hAgo: number
    changePercent: number
  }> {
    try {
      const now = Math.floor(Date.now() / 1000)
      const dayAgo = now - 86400 // 24 hours in seconds
      
      // Get current price
      const currentPrice = await this.getTokenPriceBySymbol(symbol)
      
      // Get historical price (24h ago)
      const historicalPrices = await this.getHistoricalPrices(
        symbol,
        dayAgo,
        dayAgo + 3600, // 1 hour window
        '1h'
      )
      
      if (historicalPrices.length === 0) {
        throw new Error('Historical data not available')
      }
      
      const price24hAgo = parseFloat(historicalPrices[0].value)
      const changePercent = ((currentPrice - price24hAgo) / price24hAgo) * 100
      
      return {
        currentPrice,
        price24hAgo,
        changePercent,
      }
    } catch (error) {
      console.error(`[AlchemyPrices] Error calculating price change:`, error)
      throw error
    }
  }
}

export const alchemyPricesService = new AlchemyPricesService()
