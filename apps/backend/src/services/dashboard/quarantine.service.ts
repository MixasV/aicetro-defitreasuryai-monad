import { prisma } from '../../db/prisma';

interface QuarantinePoolInput {
  accountId: string;
  poolAddress: string;
  protocol: string;
  reason: string;
  withdrawnUsd: number;
}

export class QuarantineService {
  async addToQuarantine(input: QuarantinePoolInput) {
    const quarantined = await prisma.quarantinedPool.create({
      data: input
    });

    console.log(`[Quarantine] Added pool ${input.protocol} to quarantine:`, input.reason);
    return quarantined;
  }

  async getQuarantinedPools(accountId: string) {
    const pools = await prisma.quarantinedPool.findMany({
      where: { accountId, reviewed: false },
      orderBy: { createdAt: 'desc' }
    });

    return pools;
  }

  async reviewPool(quarantineId: string) {
    const pool = await prisma.quarantinedPool.update({
      where: { id: quarantineId },
      data: {
        reviewed: true,
        reviewedAt: new Date()
      }
    });

    console.log(`[Quarantine] Pool ${pool.protocol} reviewed`);
    return pool;
  }

  async getEligibleForAnalysis(accountId: string): Promise<string[]> {
    // Pools in quarantine for 24+ hours can be analyzed but NOT invested
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const pools = await prisma.quarantinedPool.findMany({
      where: {
        accountId,
        reviewed: false,
        createdAt: { lte: cutoff }
      },
      select: { poolAddress: true }
    });

    return pools.map(p => p.poolAddress);
  }
}

export const quarantineService = new QuarantineService();
