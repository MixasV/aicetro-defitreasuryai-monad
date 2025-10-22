import { config as loadEnv } from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as crypto from 'crypto';

loadEnv();

// Decrypt deployer private key from .env
function decryptPrivateKey(encryptedData: string, masterPassword: string): string {
  const ALGORITHM = 'aes-256-cbc';
  const SALT = 'aicetro-ai-agent-salt-v1';
  
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(masterPassword, SALT, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return '0x' + decrypted;
}

// Get deployer private key (decrypted or plaintext fallback)
let deployerPrivateKey: string | undefined;

if (process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED && process.env.MASTER_ENCRYPTION_PASSWORD) {
  try {
    deployerPrivateKey = decryptPrivateKey(
      process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED,
      process.env.MASTER_ENCRYPTION_PASSWORD
    );
  } catch (error) {
    console.error('❌ Failed to decrypt deployer private key:', error);
  }
} else if (process.env.DEPLOYER_PRIVATE_KEY) {
  deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        settings: {
          optimizer: { enabled: true, runs: 200 }
        }
      },
      {
        version: '0.8.23', // For MetaMask Delegation Framework
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'paris'
        }
      }
    ]
  },
  paths: {
    sources: './src',
    remappings: [
      '@account-abstraction/interfaces/=node_modules/@account-abstraction/contracts/interfaces/',
      '@account-abstraction/contracts/=node_modules/@account-abstraction/contracts/',
      '@erc7579/lib/=lib/erc7579-implementation/src/lib/'
    ]
  },
  networks: {
    monadTestnet: {
      url: process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : []
    }
  }
};

export default config;
