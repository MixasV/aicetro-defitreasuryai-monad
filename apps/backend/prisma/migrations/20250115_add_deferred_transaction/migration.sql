-- CreateTable for DeferredTransaction
CREATE TABLE "DeferredTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountAddress" TEXT NOT NULL,
    "recommendation" JSONB NOT NULL,
    "deferredUntil" TIMESTAMP(3) NOT NULL,
    "originalGasPrice" DOUBLE PRECISION NOT NULL,
    "targetGasPrice" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "executedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE INDEX "DeferredTransaction_accountAddress_idx" ON "DeferredTransaction"("accountAddress");
CREATE INDEX "DeferredTransaction_status_idx" ON "DeferredTransaction"("status");
CREATE INDEX "DeferredTransaction_deferredUntil_idx" ON "DeferredTransaction"("deferredUntil");
