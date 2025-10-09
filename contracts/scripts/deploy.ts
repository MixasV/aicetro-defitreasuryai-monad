import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with', deployer.address);

  const CorporateTreasuryManager = await ethers.getContractFactory('CorporateTreasuryManager');
  const corporateTreasuryManager = await CorporateTreasuryManager.deploy();
  await corporateTreasuryManager.waitForDeployment();

  const TrustlessTreasury = await ethers.getContractFactory('TrustlessDeFiTreasury');
  const trustlessTreasury = await TrustlessTreasury.deploy();
  await trustlessTreasury.waitForDeployment();

  const EmergencyController = await ethers.getContractFactory('EmergencyController');
  const emergencyController = await EmergencyController.deploy(await trustlessTreasury.getAddress());
  await emergencyController.waitForDeployment();

  console.log('CorporateTreasuryManager:', await corporateTreasuryManager.getAddress());
  console.log('TrustlessDeFiTreasury:', await trustlessTreasury.getAddress());
  console.log('EmergencyController:', await emergencyController.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
