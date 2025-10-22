/**
 * Deploy EIP7702StatelessDeleGator Implementation
 * 
 * This contract is deployed ONCE and used by ALL users who want EIP-7702 based delegation.
 * User EOAs delegate to this contract via EIP-7702 authorization (tx type 0x04).
 * 
 * After authorization, User EOA gets code: 0xef0100 + this_contract_address
 * User EOA = User Smart Account (same address!)
 * 
 * Prerequisites:
 * - DelegationManager already deployed
 * - EntryPoint (0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789)
 * - Deployer has >= 1 MON balance
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Decrypt deployer private key from DEPLOYER_PRIVATE_KEY_ENCRYPTED
function decryptDeployerKey(): string {
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  const masterPassword = process.env.MASTER_ENCRYPTION_PASSWORD;

  if (!encryptedKey || !masterPassword) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY_ENCRYPTED or MASTER_ENCRYPTION_PASSWORD");
  }

  const ALGORITHM = "aes-256-cbc";
  const SALT = "aicetro-ai-agent-salt-v1";

  const [ivHex, encrypted] = encryptedKey.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted key format (expected iv:encrypted)");
  }

  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(masterPassword, SALT, 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return "0x" + decrypted;
}

async function main() {
  console.log("🚀 Deploying EIP7702StatelessDeleGator on Monad Testnet...\n");

  // Get contract addresses from ENV
  const delegationManagerAddress = process.env.METAMASK_DELEGATION_MANAGER;
  const entryPointAddress = process.env.METAMASK_ENTRY_POINT;

  if (!delegationManagerAddress || !entryPointAddress) {
    throw new Error("Missing METAMASK_DELEGATION_MANAGER or METAMASK_ENTRY_POINT in .env");
  }

  console.log("📋 Using addresses:");
  console.log("  DelegationManager:", delegationManagerAddress);
  console.log("  EntryPoint:", entryPointAddress);

  // Get deployer from encrypted key
  console.log("\n🔐 Decrypting deployer key...");
  const deployerPrivateKey = decryptDeployerKey();
  const wallet = new ethers.Wallet(deployerPrivateKey, ethers.provider);
  
  console.log("✅ Deployer address:", wallet.address);
  
  const balance = await ethers.provider.getBalance(wallet.address);
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "MON");

  if (balance < ethers.parseEther("0.5")) {
    throw new Error("Insufficient balance! Need at least 0.5 MON for deployment");
  }

  // Deploy EIP7702StatelessDeleGator
  console.log("\n📝 Deploying EIP7702StatelessDeleGator...");
  const EIP7702StatelessDeleGator = await ethers.getContractFactory(
    "EIP7702StatelessDeleGator",
    wallet
  );

  const statelessDeleGator = await EIP7702StatelessDeleGator.deploy(
    delegationManagerAddress,
    entryPointAddress
  );

  await statelessDeleGator.waitForDeployment();
  const statelessAddress = await statelessDeleGator.getAddress();
  
  console.log("✅ EIP7702StatelessDeleGator deployed at:", statelessAddress);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const name = await statelessDeleGator.NAME();
  const version = await statelessDeleGator.VERSION();
  console.log("  Contract name:", name);
  console.log("  Contract version:", version);

  // Save deployment info
  const deploymentInfo = {
    network: "monad-testnet",
    chainId: 10143,
    timestamp: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      EIP7702StatelessDeleGator: statelessAddress,
      DelegationManager: delegationManagerAddress,
      EntryPoint: entryPointAddress,
    },
    notes: [
      "EIP7702StatelessDeleGator is deployed ONCE and used by ALL users",
      "Users delegate to this contract via EIP-7702 authorization (tx type 0x04)",
      "After authorization: User EOA = User Smart Account (same address!)",
      "User funds stay on User EOA (no need to transfer)",
    ],
  };

  const outputPath = path.join(__dirname, "../deployed-eip7702-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("\n📄 Deployment info saved to:", outputPath);
  console.log("\n🎯 Summary:");
  console.log("  EIP7702StatelessDeleGator:", statelessAddress);
  console.log("  DelegationManager:", delegationManagerAddress);
  console.log("  EntryPoint:", entryPointAddress);

  console.log("\n📝 Add this to your .env files:");
  console.log(`METAMASK_STATELESS_7702=${statelessAddress}`);
  console.log(`NEXT_PUBLIC_METAMASK_STATELESS_7702=${statelessAddress}`);

  console.log("\n🔧 Next steps:");
  console.log("1. Update .env with METAMASK_STATELESS_7702");
  console.log("2. Update apps/backend/.env.production");
  console.log("3. Update metamask-environment.service.ts");
  console.log("4. Rebuild backend: docker-compose build backend");
  console.log("5. Test EIP-7702 flow with user");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
