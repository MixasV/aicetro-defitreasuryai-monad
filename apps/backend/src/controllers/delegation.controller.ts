import type { Request, Response } from 'express'
import { blockchainService } from '../services/blockchain/blockchain.service'
import { prisma } from '../lib/prisma'
import { logger } from '../config/logger'

export async function updateAutoExecutionHandler(req: Request, res: Response): Promise<void> {
  const { account } = req.params
  const { enabled, portfolioPercentage } = req.body

  try {
    // Validate input
    if (typeof enabled !== 'boolean') {
      res.status(400).json({ error: 'enabled must be a boolean' })
      return
    }

    if (typeof portfolioPercentage !== 'number' || portfolioPercentage < 0 || portfolioPercentage > 100) {
      res.status(400).json({ error: 'portfolioPercentage must be between 0 and 100' })
      return
    }

    const lowerAccount = account.toLowerCase()

    // Find corporate account
    const corporate = await prisma.corporateAccount.findUnique({
      where: { address: lowerAccount },
      include: { delegations: { take: 1 } }
    })

    if (corporate == null || corporate.delegations.length === 0) {
      res.status(404).json({ error: 'Delegation not found' })
      return
    }

    // Update delegation
    const delegation = await prisma.delegation.update({
      where: { id: corporate.delegations[0].id },
      data: {
        autoExecutionEnabled: enabled,
        portfolioPercentage: enabled ? portfolioPercentage : 0
      }
    })

    logger.info({
      account: lowerAccount,
      enabled,
      portfolioPercentage
    }, 'Auto-execution settings updated')

    res.json({
      success: true,
      delegation: {
        autoExecutionEnabled: delegation.autoExecutionEnabled,
        portfolioPercentage: delegation.portfolioPercentage,
        autoExecutedUsd: delegation.autoExecutedUsd,
        lastAutoExecutionAt: delegation.lastAutoExecutionAt?.toISOString()
      }
    })
  } catch (error) {
    logger.error({ err: error, account }, 'Failed to update auto-execution settings')
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getAutoExecutionStatusHandler(req: Request, res: Response): Promise<void> {
  const { account } = req.params

  try {
    const lowerAccount = account.toLowerCase()

    const delegation = await blockchainService.getDelegationWithDynamicLimits(lowerAccount)

    if (delegation == null) {
      res.status(404).json({ error: 'Delegation not found' })
      return
    }

    res.json({
      autoExecutionEnabled: delegation.autoExecutionEnabled ?? false,
      portfolioPercentage: delegation.portfolioPercentage ?? 0,
      autoExecutedUsd: delegation.autoExecutedUsd ?? 0,
      lastAutoExecutionAt: delegation.lastAutoExecutionAt
    })
  } catch (error) {
    logger.error({ err: error, account }, 'Failed to get auto-execution status')
    res.status(500).json({ error: 'Internal server error' })
  }
}
