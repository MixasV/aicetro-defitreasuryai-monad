import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { ethers } from 'hardhat';

const envPath = path.resolve(__dirname, '../../.env');
loadEnv({ path: envPath });
loadEnv();

async function main() {
  const treasuryAddress = process.env.TRUSTLESS_TREASURY_ADDRESS;
  if (!treasuryAddress) {
    throw new Error('TRUSTLESS_TREASURY_ADDRESS is not set in environment');
  }

  const protocol = process.env.DELEGATION_TEST_PROTOCOL ?? '0x000000000000000000000000000000000000dEaD';
  const dailyLimit = BigInt(process.env.DELEGATION_TEST_DAILY_LIMIT ?? '100000');
  const executionAmount = BigInt(process.env.DELEGATION_TEST_EXECUTE_AMOUNT ?? '5000');
  const validSeconds = BigInt(process.env.DELEGATION_TEST_VALID_SECONDS ?? (60 * 60 * 24).toString());

  const [user] = await ethers.getSigners();
  console.log('Using delegator account:', user.address);

  const treasury = await ethers.getContractAt('TrustlessDeFiTreasury', treasuryAddress);
  const whitelist = [protocol];
  const validUntil = BigInt(Math.floor(Date.now() / 1000)) + validSeconds;

  console.log('Granting delegation...');
  const grantTx = await treasury
    .connect(user)
    .grantDelegation(user.address, dailyLimit, whitelist, validUntil);
  await grantTx.wait();

  const granted = await treasury.getDelegation(user.address);
  console.log('Delegation granted:', granted);

  console.log('Executing delegated action...');
  const executeTx = await treasury
    .connect(user)
    .executeForUser(user.address, protocol, '0x', executionAmount);
  await executeTx.wait();

  const afterExecution = await treasury.getDelegation(user.address);
  console.log('Delegation after execution:', afterExecution);

  console.log('Triggering emergency stop...');
  const pauseTx = await treasury.connect(user).emergencyStop();
  await pauseTx.wait();

  const paused = await treasury.getDelegation(user.address);
  console.log('Delegation after emergency stop:', paused);

  console.log('Revoking delegation...');
  const revokeTx = await treasury.connect(user).revokeDelegation();
  await revokeTx.wait();

  console.log('Delegation revoked successfully.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
