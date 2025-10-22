/**
 * AI Agent Deploy Routes
 * 
 * Manual deployment endpoint for AI Agent Smart Account
 */

import { Router } from 'express'
import { aiAgentSmartAccountService } from '../../services/erc4337/ai-agent-smart-account.service'

const router = Router()

/**
 * GET /api/ai-agent/status
 * Get AI Agent Smart Account status
 */
router.get('/status', async (req, res) => {
  try {
    const config = await aiAgentSmartAccountService.initialize()
    
    res.json({
      address: config.address,
      isDeployed: config.isDeployed,
      hasInitCode: !!config.initCode,
      initCodeLength: config.initCode?.length || 0
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to get AI Agent status',
      message: error.message
    })
  }
})

/**
 * POST /api/ai-agent/deploy
 * Force deploy AI Agent Smart Account
 * 
 * WARNING: Requires DEPLOYER_PRIVATE_KEY with MON balance!
 */
router.post('/deploy', async (req, res) => {
  try {
    console.log('[AI Agent Deploy] Manual deployment requested')
    
    const result = await aiAgentSmartAccountService.deploy()
    
    if (result.success) {
      res.json({
        success: true,
        message: 'AI Agent Smart Account deployed successfully!',
        txHash: result.txHash,
        address: aiAgentSmartAccountService.getAddress()
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Deployment failed. See error for details.'
      })
    }
    
  } catch (error: any) {
    console.error('[AI Agent Deploy] Error:', error)
    res.status(500).json({
      success: false,
      error: 'Deployment failed',
      message: error.message
    })
  }
})

/**
 * POST /api/ai-agent/refresh
 * Refresh deployment status from blockchain
 */
router.post('/refresh', async (req, res) => {
  try {
    await aiAgentSmartAccountService.refresh()
    
    const isDeployed = await aiAgentSmartAccountService.isDeployed()
    const address = aiAgentSmartAccountService.getAddress()
    
    res.json({
      success: true,
      address,
      isDeployed,
      message: isDeployed 
        ? 'AI Agent Smart Account is deployed ✅' 
        : 'AI Agent Smart Account NOT deployed yet ⚠️'
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to refresh status',
      message: error.message
    })
  }
})

export default router
