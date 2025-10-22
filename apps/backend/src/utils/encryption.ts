/**
 * Encryption Utilities for AI Agent Private Keys
 * 
 * MVP Solution: AES-256-CBC with master password
 * 
 * ⚠️ TEMPORARY: For production, use KMS (AWS KMS, Google Cloud KMS) or HSM
 * 
 * Security guarantees:
 * - User can ALWAYS withdraw funds via Smart Account owner (no AI agent needed)
 * - Admin has NO access to encrypted keys without master password
 * - Master password stored in ENV (runtime only)
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const SALT = 'aicetro-ai-agent-salt-v1' // Static salt for key derivation

/**
 * Generate DETERMINISTIC private key for AI agent
 * 
 * Based on user address + master password.
 * Same user = same AI agent key = same AI agent address.
 * 
 * @param userAddress - User's EOA address
 * @param masterPassword - Master password from ENV
 * @returns Deterministic private key (0x-prefixed hex string)
 */
export function generateAIAgentPrivateKey(userAddress: string, masterPassword: string): string {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error('Master password is required for AI agent key generation')
  }

  // Normalize user address
  const normalized = userAddress.toLowerCase().replace('0x', '')

  // Derive deterministic key using scrypt (user address as salt)
  // This ensures: same user + same master password = same private key
  const key = crypto.scryptSync(masterPassword, normalized + SALT, 32)

  return '0x' + key.toString('hex')
}

/**
 * Encrypt AI agent private key with master password
 * 
 * Format: iv:encrypted
 * - iv: 16 bytes (hex)
 * - encrypted: AES-256-CBC ciphertext (hex)
 * 
 * @param privateKey - Private key to encrypt (0x-prefixed)
 * @param masterPassword - Master password from ENV
 * @returns Encrypted string (iv:encrypted)
 */
export function encryptPrivateKey(privateKey: string, masterPassword: string): string {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error('Master password is required for encryption')
  }

  // Remove 0x prefix if present
  const keyToEncrypt = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey

  // Derive 32-byte key from master password using scrypt
  const key = crypto.scryptSync(masterPassword, SALT, 32)

  // Generate random IV
  const iv = crypto.randomBytes(16)

  // Encrypt
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(keyToEncrypt, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Return format: iv:encrypted
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt AI agent private key with master password
 * 
 * @param encryptedData - Encrypted string (iv:encrypted format)
 * @param masterPassword - Master password from ENV
 * @returns Decrypted private key (0x-prefixed)
 */
export function decryptPrivateKey(encryptedData: string, masterPassword: string): string {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error('Master password is required for decryption')
  }

  if (!encryptedData || !encryptedData.includes(':')) {
    throw new Error('Invalid encrypted data format (expected iv:encrypted)')
  }

  // Parse iv and encrypted data
  const [ivHex, encrypted] = encryptedData.split(':')
  
  if (!ivHex || !encrypted) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const key = crypto.scryptSync(masterPassword, SALT, 32)

  // Decrypt
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  // Add 0x prefix
  return '0x' + decrypted
}

/**
 * Verify encryption/decryption works correctly
 * 
 * @param masterPassword - Master password to test
 * @returns true if encryption is working
 */
export function testEncryption(masterPassword: string): boolean {
  try {
    // Use test user address for deterministic key generation
    const testUserAddress = '0x0000000000000000000000000000000000000001'
    const testKey = generateAIAgentPrivateKey(testUserAddress, masterPassword)
    const encrypted = encryptPrivateKey(testKey, masterPassword)
    const decrypted = decryptPrivateKey(encrypted, masterPassword)
    return testKey === decrypted
  } catch (error) {
    console.error('[Encryption] Test failed:', error)
    return false
  }
}
