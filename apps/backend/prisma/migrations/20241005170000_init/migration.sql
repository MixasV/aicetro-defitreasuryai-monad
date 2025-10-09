-- CreateTable
CREATE TABLE "CorporateAccount" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "owners" JSONB NOT NULL,
    "threshold" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delegation" (
    "id" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "delegate" TEXT NOT NULL,
    "dailyLimitUsd" DOUBLE PRECISION NOT NULL,
    "whitelist" TEXT[],
    "caveats" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delegation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioSnapshot" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortfolioSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIExecutionLog" (
    "id" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "delegateAddress" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "totalExecutedUsd" DOUBLE PRECISION NOT NULL,
    "remainingDailyLimitUsd" DOUBLE PRECISION NOT NULL,
    "actions" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorporateAccount_address_key" ON "CorporateAccount"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Delegation_corporateId_delegate_key" ON "Delegation"("corporateId", "delegate");

-- CreateIndex
CREATE INDEX "AIExecutionLog_accountAddress_generatedAt_idx" ON "AIExecutionLog"("accountAddress", "generatedAt" DESC);

-- AddForeignKey
ALTER TABLE "Delegation"
    ADD CONSTRAINT "Delegation_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "CorporateAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
