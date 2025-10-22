/**
 * Delegation API Routes
 * 
 * Endpoints for managing ERC-4337 delegations.
 */

import { Router } from 'express'
import { delegationHelperService } from '../../services/erc4337/delegation-helper.service'
import { generateAIAgentAddress } from '../../utils/ai-agent-address'
import { env } from '../../config/env'

const router = Router()

/**
 * GET /api/delegations/ai-agent/:userAddress
 * Get AI agent address for user (deterministic, no key)
 */
router.get('/ai-agent/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const aiAgentAddress = generateAIAgentAddress(userAddress, env.masterEncryptionPassword)
    
    res.json({
      userAddress,
      aiAgentAddress,
      message: 'AI agent address is deterministic from user address + master password'
    })
  } catch (error) {
    console.error('[Delegation API] Get AI agent error:', error)
    res.status(500).json({ 
      error: 'Failed to generate AI agent address',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * POST /api/delegations/setup
 * Setup delegation after user signs with MetaMask
 */
router.post('/setup', async (req, res) => {
  try {
    const { userAddress, corporateId, signedDelegation, smartAccountAddress } = req.body
    
    if (!userAddress || !corporateId || !signedDelegation || !smartAccountAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userAddress', 'corporateId', 'signedDelegation', 'smartAccountAddress']
      })
    }
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const result = await delegationHelperService.setupDelegation({
      userAddress,
      corporateId,
      signedDelegation,
      smartAccountAddress,
      masterPassword: env.masterEncryptionPassword
    })
    
    res.json({
      success: true,
      delegation: result,
      message: 'Delegation setup successful - AI can now execute within limits'
    })
  } catch (error) {
    console.error('[Delegation API] Setup error:', error)
    res.status(500).json({ 
      error: 'Failed to setup delegation',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * GET /api/delegations/active/:userAddress
 * Get active delegation for user
 */
router.get('/active/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword)
    
    if (!delegation) {
      return res.status(404).json({
        error: 'No active delegation found',
        userAddress
      })
    }
    
    res.json({
      delegation: {
        id: delegation.id,
        aiAgentAddress: delegation.aiAgentAddress,
        smartAccountAddress: delegation.smartAccountAddress,
        delegationHash: delegation.delegationHash,
        active: delegation.active,
        dailyLimitUsd: delegation.dailyLimitUsd,
        whitelist: delegation.whitelist
      }
    })
  } catch (error) {
    console.error('[Delegation API] Get active error:', error)
    res.status(500).json({ 
      error: 'Failed to get delegation',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * POST /api/delegations/revoke
 * Revoke delegation (user action)
 */
router.post('/revoke', async (req, res) => {
  try {
    const { userAddress } = req.body
    
    if (!userAddress) {
      return res.status(400).json({ error: 'userAddress required' })
    }
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    await delegationHelperService.revokeDelegation(userAddress, env.masterEncryptionPassword)
    
    res.json({
      success: true,
      message: 'Delegation revoked - AI can no longer execute'
    })
  } catch (error) {
    console.error('[Delegation API] Revoke error:', error)
    res.status(500).json({ 
      error: 'Failed to revoke delegation',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * POST /api/delegations/:userAddress/whitelist
 * Add pool to delegation whitelist
 */
router.post('/:userAddress/whitelist', async (req, res) => {
  try {
    const { userAddress } = req.params
    const { poolId } = req.body
    
    if (!poolId) {
      return res.status(400).json({ error: 'poolId required' })
    }
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword)
    
    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }
    
    // Check if pool already in whitelist
    if (delegation.whitelist.includes(poolId)) {
      return res.status(400).json({ error: 'Pool already in whitelist' })
    }
    
    // Update delegation whitelist
    const { prisma } = await import('../../db/prisma')
    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        whitelist: {
          push: poolId
        }
      }
    })
    
    res.json({
      success: true,
      poolId,
      whitelist: [...delegation.whitelist, poolId],
      message: 'Pool added to whitelist'
    })
  } catch (error) {
    console.error('[Delegation API] Add to whitelist error:', error)
    res.status(500).json({ 
      error: 'Failed to add to whitelist',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * DELETE /api/delegations/:userAddress/whitelist/:poolId
 * Remove pool from delegation whitelist
 */
router.delete('/:userAddress/whitelist/:poolId', async (req, res) => {
  try {
    const { userAddress, poolId } = req.params
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword)
    
    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }
    
    // Check if pool in whitelist
    if (!delegation.whitelist.includes(poolId)) {
      return res.status(404).json({ error: 'Pool not in whitelist' })
    }
    
    // Remove from whitelist
    const newWhitelist = delegation.whitelist.filter((id: string) => id !== poolId)
    
    const { prisma } = await import('../../db/prisma')
    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        whitelist: newWhitelist
      }
    })
    
    res.json({
      success: true,
      poolId,
      whitelist: newWhitelist,
      message: 'Pool removed from whitelist'
    })
  } catch (error) {
    console.error('[Delegation API] Remove from whitelist error:', error)
    res.status(500).json({ 
      error: 'Failed to remove from whitelist',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * GET /api/delegations/:userAddress/whitelist
 * Get delegation whitelist pools
 */
router.get('/:userAddress/whitelist', async (req, res) => {
  try {
    const { userAddress } = req.params
    
    if (!env.masterEncryptionPassword) {
      return res.status(500).json({ error: 'Master password not configured' })
    }
    
    const delegation = await delegationHelperService.getActiveDelegation(userAddress, env.masterEncryptionPassword)
    
    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }
    
    // Fetch pool details for whitelist
    const { prisma } = await import('../../db/prisma')
    const pools = await prisma.pool.findMany({
      where: {
        id: { in: delegation.whitelist }
      },
      select: {
        id: true,
        protocol: true,
        chain: true,
        asset: true,
        address: true,
        apy: true,
        tvl: true,
        riskScore: true,
        aiScore: true,
        category: true
      }
    })
    
    res.json({
      total: pools.length,
      whitelist: delegation.whitelist,
      pools
    })
  } catch (error) {
    console.error('[Delegation API] Get whitelist error:', error)
    res.status(500).json({ 
      error: 'Failed to get whitelist',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

export default router
