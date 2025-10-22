/**
 * Deploy MetaMask Delegation Framework on Monad Testnet
 * 
 * This script deploys:
 * - DelegationManager
 * - HybridDeleGator implementation
 * - Essential caveat enforcers
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // Standard ERC-4337 EntryPoint

async function main() {
  console.log("🚀 Deploying MetaMask Delegation Framework on Monad Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "MON\n");

  if (balance < ethers.parseEther("1")) {
    throw new Error("Insufficient balance! Need at least 1 MON for deployment");
  }

  // 1. Deploy DelegationManager
  console.log("📝 Deploying DelegationManager...");
  const DelegationManager = await ethers.getContractFactory("DelegationManager");
  const delegationManager = await DelegationManager.deploy(deployer.address);
  await delegationManager.waitForDeployment();
  const delegationManagerAddress = await delegationManager.getAddress();
  console.log("✅ DelegationManager deployed at:", delegationManagerAddress);

  // 2. Deploy HybridDeleGator Implementation
  console.log("\n📝 Deploying HybridDeleGator implementation...");
  const HybridDeleGator = await ethers.getContractFactory("HybridDeleGator");
  const hybridDeleGator = await HybridDeleGator.deploy(
    delegationManagerAddress,
    ENTRY_POINT_ADDRESS
  );
  await hybridDeleGator.waitForDeployment();
  const hybridDeleGatorAddress = await hybridDeleGator.getAddress();
  console.log("✅ HybridDeleGator deployed at:", hybridDeleGatorAddress);

  // 3. Deploy MultiSigDeleGator Implementation (optional but recommended)
  console.log("\n📝 Deploying MultiSigDeleGator implementation...");
  const MultiSigDeleGator = await ethers.getContractFactory("MultiSigDeleGator");
  const multiSigDeleGator = await MultiSigDeleGator.deploy(
    delegationManagerAddress,
    ENTRY_POINT_ADDRESS
  );
  await multiSigDeleGator.waitForDeployment();
  const multiSigDeleGatorAddress = await multiSigDeleGator.getAddress();
  console.log("✅ MultiSigDeleGator deployed at:", multiSigDeleGatorAddress);

  // Save addresses
  const deploymentInfo = {
    network: "monad-testnet",
    chainId: 10143,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DelegationManager: delegationManagerAddress,
      HybridDeleGator: hybridDeleGatorAddress,
      MultiSigDeleGator: multiSigDeleGatorAddress,
      EntryPoint: ENTRY_POINT_ADDRESS,
    },
  };

  const outputPath = path.join(__dirname, "../deployed-metamask-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n✅ Deployment complete!");
  console.log("\n📄 Deployment info saved to:", outputPath);
  console.log("\n🎯 Summary:");
  console.log("  DelegationManager:", delegationManagerAddress);
  console.log("  HybridDeleGator:", hybridDeleGatorAddress);
  console.log("  MultiSigDeleGator:", multiSigDeleGatorAddress);
  console.log("  EntryPoint:", ENTRY_POINT_ADDRESS);

  console.log("\n📝 Add these to your .env:");
  console.log(`METAMASK_DELEGATION_MANAGER=${delegationManagerAddress}`);
  console.log(`METAMASK_HYBRID_DELEGATOR=${hybridDeleGatorAddress}`);
  console.log(`METAMASK_MULTISIG_DELEGATOR=${multiSigDeleGatorAddress}`);
  console.log(`METAMASK_ENTRY_POINT=${ENTRY_POINT_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
