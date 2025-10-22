import { ethers } from 'hardhat';

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('🚀 Deploying ERC-4337 contracts with:', deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'MON');

  // Check if EntryPoint exists
  console.log('\n📍 Checking EntryPoint at:', ENTRY_POINT_ADDRESS);
  const entryPointCode = await ethers.provider.getCode(ENTRY_POINT_ADDRESS);
  
  if (entryPointCode === '0x') {
    console.log('❌ EntryPoint not found on Monad testnet');
    console.log('⚠️  EntryPoint needs to be deployed first');
    console.log('    This is a standard ERC-4337 contract');
    // For now, we'll continue and deploy factory anyway
  } else {
    console.log('✅ EntryPoint exists');
  }

  // Deploy AISmartAccountFactory
  console.log('\n📦 Deploying AISmartAccountFactory...');
  const AISmartAccountFactory = await ethers.getContractFactory('AISmartAccountFactory');
  const factory = await AISmartAccountFactory.deploy(ENTRY_POINT_ADDRESS);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log('✅ AISmartAccountFactory deployed:', factoryAddress);

  // Create a test Smart Account
  console.log('\n🧪 Creating test Smart Account...');
  const salt = ethers.randomBytes(32);
  const createTx = await factory.createAccount(deployer.address, ethers.toBigInt(ethers.hexlify(salt)));
  const receipt = await createTx.wait();
  
  // Get account address from event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === 'AccountCreated';
    } catch {
      return false;
    }
  });
  
  let testAccountAddress = '';
  if (event) {
    const parsed = factory.interface.parseLog(event);
    testAccountAddress = parsed?.args?.account;
    console.log('✅ Test Smart Account created:', testAccountAddress);
  }

  // Verify test account
  if (testAccountAddress) {
    const accountCode = await ethers.provider.getCode(testAccountAddress);
    console.log('✅ Account has code:', accountCode.length > 2 ? 'YES' : 'NO');
    
    // Get account interface
    const AITreasurySmartAccount = await ethers.getContractFactory('AITreasurySmartAccount');
    const testAccount = AITreasurySmartAccount.attach(testAccountAddress);
    
    const owner = await testAccount.owner();
    console.log('✅ Account owner:', owner);
    console.log('✅ Owner matches deployer:', owner.toLowerCase() === deployer.address.toLowerCase());
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📝 DEPLOYMENT SUMMARY');
  console.log('═'.repeat(60));
  console.log('EntryPoint:              ', ENTRY_POINT_ADDRESS);
  console.log('AISmartAccountFactory:   ', factoryAddress);
  console.log('Test Smart Account:      ', testAccountAddress);
  console.log('═'.repeat(60));

  console.log('\n💾 Save these addresses to .env:');
  console.log(`ENTRY_POINT_ADDRESS=${ENTRY_POINT_ADDRESS}`);
  console.log(`SMART_ACCOUNT_FACTORY_ADDRESS=${factoryAddress}`);
  
  // Estimate gas costs
  console.log('\n💸 Gas Costs:');
  console.log('Factory deployment:      ~2-3 MON');
  console.log('Account creation:        ~0.5-1 MON per user');
  console.log('UserOperation:           ~0.1-0.2 MON per tx');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
