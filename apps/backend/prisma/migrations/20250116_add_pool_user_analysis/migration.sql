-- CreateTable
CREATE TABLE "PoolUserAnalysis" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "shouldAdd" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "detailedAnalysis" TEXT,
    "analysisType" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PoolUserAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PoolUserAnalysis_poolId_userAddress_idx" ON "PoolUserAnalysis"("poolId", "userAddress");

-- CreateIndex
CREATE INDEX "PoolUserAnalysis_validUntil_idx" ON "PoolUserAnalysis"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "PoolUserAnalysis_poolId_userAddress_analysisType_key" ON "PoolUserAnalysis"("poolId", "userAddress", "analysisType");
