import { logger } from '../../config/logger'

interface TokenMetadata {
  address: string
  symbol: string
  decimals: number
  name?: string
}

/**
 * Get token metadata from Monad testnet via RPC
 * Uses standard ERC20 methods: decimals(), symbol(), name()
 */
export class TokenMetadataService {
  private readonly RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
  private cache: Map<string, TokenMetadata> = new Map()
  private lastRequestTime = 0
  private readonly MIN_REQUEST_INTERVAL = 50 // 50ms between requests to avoid rate limiting
  
  /**
   * Delay helper to avoid rate limiting
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  
  /**
   * Rate-limited RPC call with retry on 429
   */
  private async rateLimitedFetch(data: any, maxRetries = 3): Promise<any> {
    // Enforce minimum interval between requests
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await this.delay(this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.lastRequestTime = Date.now()
        
        const response = await fetch(this.RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (response.status === 429) {
          // Rate limited - exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000)
          logger.warn({ attempt, backoffMs }, '[TokenMetadata] Rate limited (429), retrying...')
          await this.delay(backoffMs)
          continue
        }
        
        return await response.json()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
        await this.delay(500 * attempt) // Progressive delay on errors
      }
    }
    
    throw new Error('Max retries exceeded')
  }
  
  /**
   * Get token decimals via RPC call
   */
  private async getDecimals(tokenAddress: string): Promise<number> {
    try {
      const data = await this.rateLimitedFetch({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: '0x313ce567' // decimals()
        }, 'latest'],
        id: 1
      })
      
      if (data.result && data.result !== '0x') {
        return parseInt(data.result, 16)
      }
      
      return 18 // Default fallback
    } catch (error) {
      logger.warn({ error, tokenAddress }, '[TokenMetadata] Failed to get decimals')
      return 18 // Default fallback
    }
  }
  
  /**
   * Get token symbol via RPC call
   */
  private async getSymbol(tokenAddress: string): Promise<string> {
    try {
      const data = await this.rateLimitedFetch({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: '0x95d89b41' // symbol()
        }, 'latest'],
        id: 1
      })
      
      if (data.result && data.result !== '0x') {
        try {
          // ABI encoded string format: 0x + [offset 32 bytes] + [length 32 bytes] + [data]
          // For short strings, data.result.length may be less than 130
          const hex = data.result.slice(2) // Remove 0x
          
          if (hex.length >= 128) {
            // Standard ABI encoding with offset and length
            const hexStr = hex.slice(128) // Skip offset (64 chars) and length (64 chars)
            const symbol = Buffer.from(hexStr, 'hex').toString('utf-8').replace(/\0/g, '').trim()
            if (symbol && symbol.length > 0) {
              return symbol
            }
          }
          
          // Fallback: Try to decode entire result as string (for non-standard implementations)
          const symbol = Buffer.from(hex, 'hex').toString('utf-8').replace(/\0/g, '').trim()
          if (symbol && symbol.length > 0 && /^[A-Za-z0-9]+$/.test(symbol)) {
            return symbol
          }
        } catch (decodeError) {
          logger.debug({ error: decodeError, tokenAddress }, '[TokenMetadata] Symbol decode error')
        }
      }
      
      return 'UNKNOWN'
    } catch (error) {
      logger.warn({ error, tokenAddress }, '[TokenMetadata] Failed to get symbol')
      return 'UNKNOWN'
    }
  }
  
  /**
   * Get complete token metadata
   * Results are cached in memory
   */
  async getMetadata(tokenAddress: string): Promise<TokenMetadata> {
    // Check cache
    const cached = this.cache.get(tokenAddress.toLowerCase())
    if (cached) {
      return cached
    }
    
    // Fetch from RPC (parallel calls for speed)
    const [decimals, symbol] = await Promise.all([
      this.getDecimals(tokenAddress),
      this.getSymbol(tokenAddress)
    ])
    
    const metadata: TokenMetadata = {
      address: tokenAddress,
      symbol,
      decimals
    }
    
    // Cache result
    this.cache.set(tokenAddress.toLowerCase(), metadata)
    
    logger.debug({ metadata }, '[TokenMetadata] Fetched metadata')
    
    return metadata
  }
  
  /**
   * Get metadata for multiple tokens (batch)
   */
  async getBatch(tokenAddresses: string[]): Promise<Map<string, TokenMetadata>> {
    const results = new Map<string, TokenMetadata>()
    
    // Fetch in parallel
    await Promise.all(
      tokenAddresses.map(async (address) => {
        try {
          const metadata = await this.getMetadata(address)
          results.set(address.toLowerCase(), metadata)
        } catch (error) {
          logger.warn({ error, address }, '[TokenMetadata] Batch fetch failed for token')
        }
      })
    )
    
    return results
  }
  
  /**
   * Check if token is a stablecoin by symbol
   */
  isStablecoin(symbol: string): boolean {
    const stables = ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'USDS']
    return stables.some(s => symbol.toUpperCase().includes(s))
  }
  
  /**
   * Check if token is ETH-equivalent by symbol
   */
  isEthEquivalent(symbol: string): boolean {
    const ethTokens = ['WETH', 'WMON', 'MON', 'ETH']
    return ethTokens.some(t => symbol.toUpperCase().includes(t))
  }
  
  /**
   * Clear cache (for testing)
   */
  clearCache() {
    this.cache.clear()
  }
}

export const tokenMetadataService = new TokenMetadataService()
