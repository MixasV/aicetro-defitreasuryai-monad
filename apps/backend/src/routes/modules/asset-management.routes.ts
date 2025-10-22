import { Router } from 'express'
import { assetRulesService } from '../../services/asset-management/asset-rules.service'
import { capitalManagementService } from '../../services/asset-management/capital-management.service'

export const assetManagementRouter = Router()

assetManagementRouter.get('/rules/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params
    
    const rules = await assetRulesService.getRules(accountAddress)
    
    if (!rules) {
      const defaultRules = await assetRulesService.getDefaultRules(accountAddress, 100000)
      return res.json({
        success: true,
        data: defaultRules,
        isDefault: true
      })
    }
    
    res.json({
      success: true,
      data: rules,
      isDefault: false
    })
  } catch (error) {
    console.error('[API] Get asset rules error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get asset rules'
    })
  }
})

assetManagementRouter.post('/rules', async (req, res) => {
  try {
    const { accountAddress, aiManagedCapital, totalCapital, assets } = req.body
    
    if (!accountAddress || !aiManagedCapital || !totalCapital || !assets) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: accountAddress, aiManagedCapital, totalCapital, assets'
      })
    }
    
    const rules = await assetRulesService.setRules({
      accountAddress,
      aiManagedCapital,
      totalCapital,
      assets
    })
    
    res.json({
      success: true,
      data: rules
    })
  } catch (error) {
    console.error('[API] Set asset rules error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set asset rules'
    })
  }
})

assetManagementRouter.post('/validate-action', async (req, res) => {
  try {
    const { accountAddress, action, asset, amountUSD, toAsset } = req.body
    
    if (!accountAddress || !action || !asset || !amountUSD) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: accountAddress, action, asset, amountUSD'
      })
    }
    
    const result = await assetRulesService.validateAction({
      accountAddress,
      action,
      asset,
      amountUSD,
      toAsset
    })
    
    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('[API] Validate action error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate action'
    })
  }
})

assetManagementRouter.get('/capital/history/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    
    const history = await capitalManagementService.getCapitalHistory(accountAddress, limit)
    
    res.json({
      success: true,
      data: history,
      total: history.length
    })
  } catch (error) {
    console.error('[API] Get capital history error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get capital history'
    })
  }
})

assetManagementRouter.get('/capital/balance/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params
    
    const balance = await capitalManagementService.getCurrentBalance(accountAddress)
    
    res.json({
      success: true,
      data: {
        accountAddress,
        aiManagedCapital: balance
      }
    })
  } catch (error) {
    console.error('[API] Get capital balance error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get capital balance'
    })
  }
})

assetManagementRouter.post('/capital/transaction', async (req, res) => {
  try {
    const { accountAddress, type, amount, reason, txHash } = req.body
    
    if (!accountAddress || !type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: accountAddress, type, amount'
      })
    }
    
    await capitalManagementService.recordTransaction({
      accountAddress,
      type,
      amount,
      reason,
      txHash
    })
    
    res.json({
      success: true,
      message: 'Capital transaction recorded'
    })
  } catch (error) {
    console.error('[API] Record capital transaction error:', error)
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record transaction'
    })
  }
})
