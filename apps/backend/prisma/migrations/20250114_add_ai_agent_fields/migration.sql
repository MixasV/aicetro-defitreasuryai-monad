-- Add AI Agent fields to CorporateAccount
-- These fields store the deterministic AI agent address for MetaMask delegations

-- Add aiAgentAddress column (unique, indexed)
ALTER TABLE "CorporateAccount" ADD COLUMN IF NOT EXISTS "aiAgentAddress" TEXT UNIQUE;

-- Add aiAgentName column (optional label)
ALTER TABLE "CorporateAccount" ADD COLUMN IF NOT EXISTS "aiAgentName" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "CorporateAccount_aiAgentAddress_idx" ON "CorporateAccount"("aiAgentAddress");
