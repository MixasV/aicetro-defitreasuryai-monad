/**
 * Alchemy Integration Routes
 * 
 * Endpoints for:
 * - Gas Manager (sponsorship status, policy stats)
 * - Prices API (token prices, portfolio valuation)
 */

import express, { type Request, type Response } from 'express'
import { alchemyGasManager } from '../../services/alchemy/alchemy-gas-manager.service'
import { alchemyPricesService } from '../../services/alchemy/alchemy-prices.service'

const router = express.Router()

/**
 * GET /api/alchemy/gas-manager/policy
 * 
 * Get Gas Policy statistics (spending, limits, status)
 */
router.get('/gas-manager/policy', async (req: Request, res: Response) => {
  try {
    const stats = await alchemyGasManager.getPolicyStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Policy stats error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch policy stats'
    })
  }
})

/**
 * POST /api/alchemy/gas-manager/allowlist
 * 
 * Add Smart Account to allowlist
 * 
 * Body: { smartAccountAddress: string }
 */
router.post('/gas-manager/allowlist', async (req: Request, res: Response) => {
  try {
    const { smartAccountAddress } = req.body
    
    if (!smartAccountAddress) {
      return res.status(400).json({
        success: false,
        error: 'smartAccountAddress required'
      })
    }
    
    await alchemyGasManager.addToAllowlist(smartAccountAddress)
    
    res.json({
      success: true,
      message: `Added ${smartAccountAddress} to allowlist`
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Allowlist error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add to allowlist'
    })
  }
})

/**
 * DELETE /api/alchemy/gas-manager/allowlist/:address
 * 
 * Remove Smart Account from allowlist
 */
router.delete('/gas-manager/allowlist/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params
    
    await alchemyGasManager.removeFromAllowlist(address)
    
    res.json({
      success: true,
      message: `Removed ${address} from allowlist`
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Remove allowlist error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove from allowlist'
    })
  }
})

/**
 * GET /api/alchemy/gas-manager/allowlist/:address
 * 
 * Check if address is in allowlist
 */
router.get('/gas-manager/allowlist/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params
    
    const isAllowed = await alchemyGasManager.isInAllowlist(address)
    
    res.json({
      success: true,
      data: {
        address,
        isInAllowlist: isAllowed
      }
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Check allowlist error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check allowlist'
    })
  }
})

/**
 * GET /api/alchemy/prices/token/:symbol
 * 
 * Get token price by symbol (e.g., ETH, BTC, USDC)
 */
router.get('/prices/token/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    const { currency = 'USD' } = req.query
    
    const price = await alchemyPricesService.getTokenPriceBySymbol(
      symbol.toUpperCase(),
      currency as string
    )
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price,
        currency
      }
    })
  } catch (error: any) {
    console.error(`[AlchemyRoutes] Price error for ${req.params.symbol}:`, error)
    res.status(404).json({
      success: false,
      error: error.message || 'Price not found'
    })
  }
})

/**
 * GET /api/alchemy/prices/token-address/:network/:address
 * 
 * Get token price by contract address
 */
router.get('/prices/token-address/:network/:address', async (req: Request, res: Response) => {
  try {
    const { network, address } = req.params
    const { currency = 'USD' } = req.query
    
    const price = await alchemyPricesService.getTokenPriceByAddress(
      network,
      address,
      currency as string
    )
    
    res.json({
      success: true,
      data: {
        network,
        address,
        price,
        currency
      }
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Price by address error:', error)
    res.status(404).json({
      success: false,
      error: error.message || 'Price not found'
    })
  }
})

/**
 * POST /api/alchemy/prices/batch
 * 
 * Get multiple token prices at once
 * 
 * Body: { symbols: string[], currency?: string }
 */
router.post('/prices/batch', async (req: Request, res: Response) => {
  try {
    const { symbols, currency = 'USD' } = req.body
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'symbols array required'
      })
    }
    
    const pricesMap = await alchemyPricesService.getBatchPrices(symbols, currency)
    
    // Convert Map to object for JSON
    const prices: Record<string, number> = {}
    pricesMap.forEach((price, symbol) => {
      prices[symbol] = price
    })
    
    res.json({
      success: true,
      data: {
        prices,
        currency
      }
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Batch prices error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch batch prices'
    })
  }
})

/**
 * GET /api/alchemy/prices/portfolio
 * 
 * Calculate portfolio value in USD
 * 
 * Query: tokens=[{symbol, balance, decimals}, ...]
 */
router.post('/prices/portfolio', async (req: Request, res: Response) => {
  try {
    const { tokens } = req.body
    
    if (!tokens || !Array.isArray(tokens)) {
      return res.status(400).json({
        success: false,
        error: 'tokens array required'
      })
    }
    
    const portfolio = await alchemyPricesService.calculatePortfolioValue(tokens)
    
    res.json({
      success: true,
      data: portfolio
    })
  } catch (error: any) {
    console.error('[AlchemyRoutes] Portfolio valuation error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate portfolio value'
    })
  }
})

/**
 * GET /api/alchemy/prices/change/:symbol
 * 
 * Get price change (24h) for a token
 */
router.get('/prices/change/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params
    
    const change = await alchemyPricesService.getPriceChange24h(symbol.toUpperCase())
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        ...change
      }
    })
  } catch (error: any) {
    console.error(`[AlchemyRoutes] Price change error for ${req.params.symbol}:`, error)
    res.status(404).json({
      success: false,
      error: error.message || 'Price change data not available'
    })
  }
})

/**
 * GET /api/alchemy/health
 * 
 * Health check for Alchemy integration
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test Gas Manager
    let gasManagerStatus = 'unknown'
    try {
      await alchemyGasManager.getPolicyStats()
      gasManagerStatus = 'ok'
    } catch {
      gasManagerStatus = 'error'
    }
    
    // Test Prices API
    let pricesStatus = 'unknown'
    try {
      await alchemyPricesService.getTokenPriceBySymbol('ETH')
      pricesStatus = 'ok'
    } catch {
      pricesStatus = 'error'
    }
    
    res.json({
      success: true,
      data: {
        gasManager: gasManagerStatus,
        prices: pricesStatus,
        overall: gasManagerStatus === 'ok' && pricesStatus === 'ok' ? 'healthy' : 'degraded'
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Health check failed'
    })
  }
})

export default router
