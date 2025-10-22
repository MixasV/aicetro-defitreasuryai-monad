-- Add ERC-4337 / MetaMask Delegation fields to Delegation table
-- These fields support Smart Account delegation flow

-- Add signedDelegation column (stores full MetaMask signature)
ALTER TABLE "Delegation" ADD COLUMN IF NOT EXISTS "signedDelegation" JSONB;

-- Add delegationHash column (for verification)
ALTER TABLE "Delegation" ADD COLUMN IF NOT EXISTS "delegationHash" TEXT;

-- Add aiAgentAddress column (deterministic AI agent per user)
ALTER TABLE "Delegation" ADD COLUMN IF NOT EXISTS "aiAgentAddress" TEXT;

-- Add smartAccountAddress column (user's Smart Account)
ALTER TABLE "Delegation" ADD COLUMN IF NOT EXISTS "smartAccountAddress" TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS "Delegation_aiAgentAddress_idx" ON "Delegation"("aiAgentAddress");
CREATE INDEX IF NOT EXISTS "Delegation_delegationHash_idx" ON "Delegation"("delegationHash");
CREATE INDEX IF NOT EXISTS "Delegation_smartAccountAddress_idx" ON "Delegation"("smartAccountAddress");
