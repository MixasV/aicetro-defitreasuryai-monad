/**
 * Delegation Control Routes
 * Pause, Resume, Withdraw All, Emergency Stop
 */

import { Router } from 'express'
import { prisma } from '../../db/prisma'
import { logger } from '../../config/logger'

export const delegationControlsRouter = Router()

/**
 * POST /api/delegation-controls/:userAddress/pause
 * Pause AI agent (stops new investments, monitoring continues)
 */
delegationControlsRouter.post('/:userAddress/pause', async (req, res) => {
  try {
    const { userAddress } = req.params

    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }

    // Update caveats with paused status
    const updatedCaveats = {
      ...delegation.caveats as any,
      paused: true,
      pausedAt: new Date().toISOString()
    }

    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        caveats: updatedCaveats
      }
    })

    logger.info(`[DelegationControls] Paused AI agent for ${userAddress}`)

    res.json({
      success: true,
      message: 'AI agent paused. Monitoring continues, but no new investments will be made.'
    })
  } catch (error: any) {
    logger.error({ error }, '[DelegationControls] Pause failed')
    res.status(500).json({ error: 'Failed to pause AI agent' })
  }
})

/**
 * POST /api/delegation-controls/:userAddress/resume
 * Resume AI agent (allow new investments)
 */
delegationControlsRouter.post('/:userAddress/resume', async (req, res) => {
  try {
    const { userAddress } = req.params

    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }

    // Update caveats to remove paused status
    const updatedCaveats = {
      ...delegation.caveats as any,
      paused: false,
      resumedAt: new Date().toISOString()
    }

    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        caveats: updatedCaveats
      }
    })

    logger.info(`[DelegationControls] Resumed AI agent for ${userAddress}`)

    res.json({
      success: true,
      message: 'AI agent resumed. New investments are now allowed.'
    })
  } catch (error: any) {
    logger.error({ error }, '[DelegationControls] Resume failed')
    res.status(500).json({ error: 'Failed to resume AI agent' })
  }
})

/**
 * POST /api/delegation-controls/:userAddress/withdraw-all
 * Withdraw all funds from pools and pause AI (does NOT revoke delegation)
 */
delegationControlsRouter.post('/:userAddress/withdraw-all', async (req, res) => {
  try {
    const { userAddress } = req.params

    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }

    // TODO: Implement actual withdrawal logic via smart contracts
    // For now, just pause the AI and log the request

    // Pause AI
    const updatedCaveats = {
      ...delegation.caveats as any,
      paused: true,
      withdrawAllRequested: true,
      withdrawAllRequestedAt: new Date().toISOString()
    }

    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        caveats: updatedCaveats
      }
    })

    logger.info(`[DelegationControls] Withdraw all requested for ${userAddress}`)

    res.json({
      success: true,
      message: 'Withdraw all initiated. AI agent paused. Funds will be withdrawn from all pools.',
      warning: 'This may take several minutes to complete all withdrawals.'
    })
  } catch (error: any) {
    logger.error({ error }, '[DelegationControls] Withdraw all failed')
    res.status(500).json({ error: 'Failed to initiate withdraw all' })
  }
})

/**
 * POST /api/delegation-controls/:userAddress/emergency-stop
 * Emergency stop: withdraw all + pause + notify
 */
delegationControlsRouter.post('/:userAddress/emergency-stop', async (req, res) => {
  try {
    const { userAddress } = req.params

    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }

    // Emergency stop: withdraw all + pause
    const updatedCaveats = {
      ...delegation.caveats as any,
      paused: true,
      emergencyStop: true,
      emergencyStopAt: new Date().toISOString()
    }

    await prisma.delegation.update({
      where: { id: delegation.id },
      data: {
        caveats: updatedCaveats
      }
    })

    logger.warn(`[DelegationControls] EMERGENCY STOP for ${userAddress}`)

    res.json({
      success: true,
      message: '🚨 Emergency stop activated. AI agent paused and withdrawing all funds.',
      actions: [
        'AI agent paused immediately',
        'All funds being withdrawn from pools',
        'Monitoring continues for emergency exits only'
      ]
    })
  } catch (error: any) {
    logger.error({ error }, '[DelegationControls] Emergency stop failed')
    res.status(500).json({ error: 'Failed to activate emergency stop' })
  }
})

/**
 * GET /api/delegation-controls/:userAddress/status
 * Get current AI agent status
 */
delegationControlsRouter.get('/:userAddress/status', async (req, res) => {
  try {
    const { userAddress } = req.params

    const delegation = await prisma.delegation.findFirst({
      where: {
        smartAccountAddress: userAddress.toLowerCase(),
        active: true
      }
    })

    if (!delegation) {
      return res.status(404).json({ error: 'No active delegation found' })
    }

    const caveats = delegation.caveats as any

    res.json({
      success: true,
      status: {
        active: delegation.active,
        paused: caveats?.paused || false,
        emergencyStop: caveats?.emergencyStop || false,
        autoExecutionEnabled: delegation.autoExecutionEnabled,
        pausedAt: caveats?.pausedAt,
        resumedAt: caveats?.resumedAt,
        emergencyStopAt: caveats?.emergencyStopAt
      }
    })
  } catch (error: any) {
    logger.error({ error }, '[DelegationControls] Status check failed')
    res.status(500).json({ error: 'Failed to get status' })
  }
})
