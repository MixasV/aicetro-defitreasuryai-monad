/**
 * Smart Account Routes (ERC-4337)
 */

import { Router, type Request, type Response } from 'express';
import { ethers } from 'ethers';
import { prisma } from '../../db/prisma';
import { logger } from '../../config/logger';
import { monadTestnet } from '../../chains';

const router = Router();

const FACTORY_ADDRESS = process.env.SMART_ACCOUNT_FACTORY_ADDRESS || '';

const FACTORY_ABI = [
  'function createAccount(address owner, uint256 salt) returns (address)',
  'function getAddress(address owner, uint256 salt) view returns (address)'
];

/**
 * POST /api/smart-account/create
 * Create a new Smart Account
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const { ownerAddress } = req.body;
    
    if (!ownerAddress || !ethers.isAddress(ownerAddress)) {
      return res.status(400).json({ error: 'Valid owner address required' });
    }
    
    if (!FACTORY_ADDRESS) {
      return res.status(500).json({ error: 'Factory address not configured' });
    }
    
    logger.info({ ownerAddress }, '[SmartAccount] Creating Smart Account');
    
    // Deterministic salt
    const salt = ethers.keccak256(ethers.toUtf8Bytes(ownerAddress));
    
    // Provider and signer
    const provider = new ethers.JsonRpcProvider(monadTestnet.rpcUrls.default.http[0]);
    const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY || '', provider);
    
    // Factory contract
    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, deployer);
    
    // Get predicted address
    const predictedAddress = await (factory as any).getAddress(ownerAddress, salt);
    
    // Check if exists
    const code = await provider.getCode(predictedAddress);
    if (code && code !== '0x') {
      logger.info({ predictedAddress }, '[SmartAccount] Already exists');
      return res.json({
        success: true,
        smartAccount: predictedAddress,
        owner: ownerAddress,
        alreadyExists: true
      });
    }
    
    // Deploy
    logger.info('[SmartAccount] Deploying...');
    const tx = await (factory as any).createAccount(ownerAddress, salt);
    const receipt = await tx.wait();
    
    logger.info({ txHash: receipt?.hash, smartAccount: predictedAddress }, '[SmartAccount] Created');
    
    // Save to database
    await prisma.corporateAccount.create({
      data: {
        address: predictedAddress.toLowerCase(),
        owners: [ownerAddress.toLowerCase()],
        threshold: 1,
        aiAgentName: 'AI Treasury Agent'
      }
    });
    
    res.json({
      success: true,
      smartAccount: predictedAddress,
      owner: ownerAddress,
      txHash: receipt?.hash,
      alreadyExists: false
    });
    
  } catch (error: any) {
    logger.error({ err: error }, '[SmartAccount] Create failed');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/smart-account/:address/operations
 * Get operations history
 */
router.get('/:address/operations', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    const operations = await prisma.aIOperation.findMany({
      where: { smartAccount: address.toLowerCase() },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    res.json({
      smartAccount: address,
      operations,
      count: operations.length
    });
    
  } catch (error: any) {
    logger.error({ err: error }, '[SmartAccount] Get operations failed');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/smart-account/:address/daily-limit
 * Get daily limit status
 */
router.get('/:address/daily-limit', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    // Get today's tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tracking = await prisma.dailyLimitTracking.findUnique({
      where: {
        smartAccount_date: {
          smartAccount: address.toLowerCase(),
          date: today
        }
      }
    });
    
    const spentToday = tracking?.spentToday || 0;
    const limit = tracking?.limit || 1000;
    const remaining = limit - spentToday;
    const percentUsed = (spentToday / limit) * 100;
    
    res.json({
      smartAccount: address,
      spentToday,
      limit,
      remaining,
      percentUsed: parseFloat(percentUsed.toFixed(2))
    });
    
  } catch (error: any) {
    logger.error({ err: error }, '[SmartAccount] Get daily limit failed');
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/smart-account/:address/info
 * Get Smart Account info
 */
router.get('/:address/info', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    const account = await prisma.corporateAccount.findUnique({
      where: { address: address.toLowerCase() },
      include: { delegations: true }
    });
    
    if (!account) {
      return res.status(404).json({ error: 'Smart Account not found' });
    }
    
    res.json({
      exists: true,
      address: account.address,
      owners: account.owners,
      threshold: account.threshold,
      delegations: account.delegations
    });
    
  } catch (error: any) {
    logger.error({ err: error }, '[SmartAccount] Get info failed');
    res.status(500).json({ error: error.message });
  }
});

export default router;
