-- Add encrypted AI agent private key storage
-- MVP Solution: AES-256-CBC with master password
-- For production: migrate to KMS (AWS KMS, Google Cloud KMS) or HSM

ALTER TABLE "Delegation" 
ADD COLUMN "aiAgentPrivateKeyEncrypted" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Delegation"."aiAgentPrivateKeyEncrypted" IS 
'Encrypted AI agent private key (AES-256-CBC). Format: iv:encrypted. Each user has unique key. Master password in ENV.';
