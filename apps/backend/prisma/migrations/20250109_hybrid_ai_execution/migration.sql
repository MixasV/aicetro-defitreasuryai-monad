-- Add hybrid AI execution fields to Delegation
ALTER TABLE "Delegation" ADD COLUMN "autoExecutionEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Delegation" ADD COLUMN "portfolioPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Delegation" ADD COLUMN "autoExecutedUsd" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Delegation" ADD COLUMN "lastAutoExecutionAt" TIMESTAMP(3);

-- Add enhanced execution tracking to AIExecutionLog
ALTER TABLE "AIExecutionLog" ADD COLUMN "executionMode" TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE "AIExecutionLog" ADD COLUMN "txHashes" JSONB;
ALTER TABLE "AIExecutionLog" ADD COLUMN "profitLossUsd" DOUBLE PRECISION;
ALTER TABLE "AIExecutionLog" ADD COLUMN "reasoning" TEXT;
ALTER TABLE "AIExecutionLog" ADD COLUMN "userApproved" BOOLEAN NOT NULL DEFAULT false;

-- Create index for filtering by execution mode
CREATE INDEX "AIExecutionLog_accountAddress_executionMode_idx" ON "AIExecutionLog"("accountAddress", "executionMode");
