-- CreateTable
CREATE TABLE IF NOT EXISTS "QuarantinedPool" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "withdrawnUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "QuarantinedPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PoolMonitoringPermission" (
    "id" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "signature" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "PoolMonitoringPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FeeTransaction" (
    "id" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amountUSD" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuarantinedPool_accountId_idx" ON "QuarantinedPool"("accountId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuarantinedPool_reviewed_idx" ON "QuarantinedPool"("reviewed");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PoolMonitoringPermission_accountAddress_poolAddress_key" ON "PoolMonitoringPermission"("accountAddress", "poolAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PoolMonitoringPermission_accountAddress_idx" ON "PoolMonitoringPermission"("accountAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FeeTransaction_accountAddress_idx" ON "FeeTransaction"("accountAddress");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FeeTransaction_timestamp_idx" ON "FeeTransaction"("timestamp");
