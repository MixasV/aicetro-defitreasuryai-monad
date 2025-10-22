import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy DeFiTreasuryVault contract for Monad Testnet
 */
async function main() {
  console.log("🚀 Deploying DeFiTreasuryVault to Monad Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MON\n");

  // WMON address on Monad Testnet (native token wrapper)
  // You can change this to USDC or any other token address
  const WMON_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual WMON address
  
  console.log("Asset token address:", WMON_ADDRESS);
  console.log("Deploying DeFiTreasuryVault...\n");

  // Deploy DeFiTreasuryVault
  const DeFiTreasuryVault = await ethers.getContractFactory("DeFiTreasuryVault");
  const vault = await DeFiTreasuryVault.deploy(WMON_ADDRESS);

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ DeFiTreasuryVault deployed to:", vaultAddress);

  // Get AI Agent Executor address (if exists)
  const aiAgentAddress = process.env.AI_AGENT_EXECUTOR_ADDRESS || ethers.ZeroAddress;
  
  if (aiAgentAddress !== ethers.ZeroAddress) {
    console.log("\nSetting AI Agent Executor:", aiAgentAddress);
    const tx = await vault.setAgentExecutor(aiAgentAddress);
    await tx.wait();
    console.log("✅ AI Agent Executor set");
  } else {
    console.log("\n⚠️  No AI_AGENT_EXECUTOR_ADDRESS found in env");
    console.log("   Set it later with: vault.setAgentExecutor(address)");
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
        assetToken: WMON_ADDRESS,
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
  console.log("Asset Token:       ", WMON_ADDRESS);
  console.log("Agent Executor:    ", aiAgentAddress);
  console.log("Deployer:          ", deployer.address);
  console.log("=".repeat(60));

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Update .env with VAULT_ADDRESS=" + vaultAddress);
  console.log("2. Set AI Agent Executor if not set: vault.setAgentExecutor(address)");
  console.log("3. Update frontend to use vault.deposit() instead of simple transfer");
  console.log("4. Test deposit flow with real tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
