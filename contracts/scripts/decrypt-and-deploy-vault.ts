import hre from "hardhat";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const { ethers } = hre;

const ALGORITHM = "aes-256-cbc";
const SALT = "aicetro-ai-agent-salt-v1";

/**
 * Decrypt deployer private key from .env
 */
function decryptPrivateKey(encryptedData: string, masterPassword: string): string {
  if (!masterPassword || masterPassword.length === 0) {
    throw new Error("Master password is required for decryption");
  }

  if (!encryptedData || !encryptedData.includes(":")) {
    throw new Error("Invalid encrypted data format (expected iv:encrypted)");
  }

  const [ivHex, encrypted] = encryptedData.split(":");
  
  if (!ivHex || !encrypted) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const key = crypto.scryptSync(masterPassword, SALT, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return "0x" + decrypted;
}

async function main() {
  console.log("🚀 Deploying DeFiTreasuryVault to Monad Testnet...\n");

  // Get encrypted deployer key and master password
  const encryptedKey = process.env.DEPLOYER_PRIVATE_KEY_ENCRYPTED;
  const masterPassword = process.env.MASTER_ENCRYPTION_PASSWORD;

  if (!encryptedKey || !masterPassword) {
    throw new Error("Missing DEPLOYER_PRIVATE_KEY_ENCRYPTED or MASTER_ENCRYPTION_PASSWORD in .env");
  }

  // Decrypt deployer private key
  console.log("🔓 Decrypting deployer private key...");
  const deployerPrivateKey = decryptPrivateKey(encryptedKey, masterPassword);

  // Create wallet from decrypted key
  const deployer = new ethers.Wallet(deployerPrivateKey, ethers.provider);

  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MON\n");

  if (balance === 0n) {
    throw new Error("⚠️  Deployer has 0 MON! Get testnet tokens first.");
  }

  // WMON or USDC address on Monad Testnet
  // Using zero address as placeholder for now (will be updated after deployment)
  const assetAddress = "0x0000000000000000000000000000000000000000";
  
  console.log("Asset token address:", assetAddress);
  console.log("⚠️  Note: Using placeholder token address. Update after finding WMON/USDC address.\n");
  console.log("Deploying DeFiTreasuryVault...\n");

  // Deploy DeFiTreasuryVault
  const DeFiTreasuryVault = await ethers.getContractFactory("DeFiTreasuryVault", deployer);
  const vault = await DeFiTreasuryVault.deploy(assetAddress);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ DeFiTreasuryVault deployed to:", vaultAddress);

  // Set AI Agent Executor if exists
  const aiAgentAddress = process.env.AI_AGENT_EXECUTOR_ADDRESS || ethers.ZeroAddress;
  
  if (aiAgentAddress !== ethers.ZeroAddress) {
    console.log("\nSetting AI Agent Executor:", aiAgentAddress);
    const tx = await vault.setAgentExecutor(aiAgentAddress);
    await tx.wait();
    console.log("✅ AI Agent Executor set");
  } else {
    console.log("\n⚠️  No AI_AGENT_EXECUTOR_ADDRESS found in env");
    console.log("   You can set it later with: vault.setAgentExecutor(address)");
  }

  // Save deployment info
  const deploymentInfo = {
    network: "monad-testnet",
    chainId: 10143,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      DeFiTreasuryVault: {
        address: vaultAddress,
        assetToken: assetAddress,
        agentExecutor: aiAgentAddress
      }
    }
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = path.join(deploymentsDir, "defitreasuryai-vault-monad.json");
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📝 Deployment info saved to:", filename);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("DeFiTreasuryVault: ", vaultAddress);
  console.log("Asset Token:       ", assetAddress, "(PLACEHOLDER)");
  console.log("Agent Executor:    ", aiAgentAddress);
  console.log("Deployer:          ", deployer.address);
  console.log("=".repeat(60));

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Find WMON/USDC token address on Monad Testnet");
  console.log("2. Deploy new vault with correct token address");
  console.log("3. Update .env: VAULT_ADDRESS=" + vaultAddress);
  console.log("4. Update frontend to use vault.deposit() instead of transfer");
  console.log("5. Test deposit flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
