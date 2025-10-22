import { prisma } from '../../db/prisma';
import { verifyMessage } from 'ethers';

interface EnableMonitoringInput {
  accountAddress: string;
  poolAddress: string;
  protocol: string;
  signature: string;
  message: string;
}

export class PoolMonitoringService {
  async enableMonitoring(input: EnableMonitoringInput) {
    // Verify signature
    const recoveredAddress = verifyMessage(input.message, input.signature);
    
    if (recoveredAddress.toLowerCase() !== input.accountAddress.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    // Check if permission already exists
    const existing = await prisma.poolMonitoringPermission.findUnique({
      where: {
        accountAddress_poolAddress: {
          accountAddress: input.accountAddress.toLowerCase(),
          poolAddress: input.poolAddress.toLowerCase()
        }
      }
    });

    if (existing) {
      // Update existing
      return prisma.poolMonitoringPermission.update({
        where: { id: existing.id },
        data: {
          enabled: true,
          signature: input.signature,
          signedAt: new Date(),
          revokedAt: null
        }
      });
    }

    // Create new permission
    return prisma.poolMonitoringPermission.create({
      data: {
        accountAddress: input.accountAddress.toLowerCase(),
        poolAddress: input.poolAddress.toLowerCase(),
        protocol: input.protocol,
        enabled: true,
        signature: input.signature
      }
    });
  }

  async disableMonitoring(accountAddress: string, poolAddress: string) {
    const permission = await prisma.poolMonitoringPermission.findUnique({
      where: {
        accountAddress_poolAddress: {
          accountAddress: accountAddress.toLowerCase(),
          poolAddress: poolAddress.toLowerCase()
        }
      }
    });

    if (!permission) {
      throw new Error('Permission not found');
    }

    return prisma.poolMonitoringPermission.update({
      where: { id: permission.id },
      data: {
        enabled: false,
        revokedAt: new Date()
      }
    });
  }

  async getMonitoredPools(accountAddress: string) {
    return prisma.poolMonitoringPermission.findMany({
      where: {
        accountAddress: accountAddress.toLowerCase(),
        enabled: true
      }
    });
  }

  async canEmergencyWithdraw(accountAddress: string, poolAddress: string): Promise<boolean> {
    const permission = await prisma.poolMonitoringPermission.findUnique({
      where: {
        accountAddress_poolAddress: {
          accountAddress: accountAddress.toLowerCase(),
          poolAddress: poolAddress.toLowerCase()
        }
      }
    });

    return permission?.enabled === true;
  }
}

export const poolMonitoringService = new PoolMonitoringService();
