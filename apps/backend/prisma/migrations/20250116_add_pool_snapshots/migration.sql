-- Add additional DeFi Llama metrics to Pool table
ALTER TABLE "Pool" ADD COLUMN "apyPct1D" DOUBLE PRECISION;
ALTER TABLE "Pool" ADD COLUMN "apyPct7D" DOUBLE PRECISION;
ALTER TABLE "Pool" ADD COLUMN "apyPct30D" DOUBLE PRECISION;
ALTER TABLE "Pool" ADD COLUMN "volumeUsd7d" DOUBLE PRECISION;

-- Create PoolSnapshot table for historical data
CREATE TABLE "PoolSnapshot" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "tvl" DOUBLE PRECISION NOT NULL,
    "apy" DOUBLE PRECISION NOT NULL,
    "volume24h" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolSnapshot_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "PoolSnapshot_poolId_idx" ON "PoolSnapshot"("poolId");
CREATE INDEX "PoolSnapshot_timestamp_idx" ON "PoolSnapshot"("timestamp");
CREATE INDEX "PoolSnapshot_poolId_timestamp_idx" ON "PoolSnapshot"("poolId", "timestamp");

-- Add foreign key
ALTER TABLE "PoolSnapshot" ADD CONSTRAINT "PoolSnapshot_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
