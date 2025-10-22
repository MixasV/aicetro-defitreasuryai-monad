/**
 * MetaMask Environment API
 * 
 * Returns Monad Testnet environment for frontend to use in delegation creation
 */

import { Router } from 'express'
import { metaMaskEnvironmentService } from '../../services/metamask/metamask-environment.service'

const router = Router()

/**
 * GET /api/metamask/environment
 * 
 * Returns DeleGatorEnvironment for Monad Testnet
 * Frontend MUST use this when calling createDelegation()
 */
router.get('/environment', (req, res) => {
  try {
    const environment = metaMaskEnvironmentService.getMonadTestnetEnvironment()
    
    res.json({
      success: true,
      chainId: 10143,
      environment
    })
  } catch (error: any) {
    console.error('[MetaMask Environment API] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get MetaMask environment',
      message: error.message
    })
  }
})

export default router
