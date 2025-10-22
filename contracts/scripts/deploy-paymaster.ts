/**
 * Deploy SimplePaymaster Contract
 * 
 * Usage:
 * npx hardhat run scripts/deploy-paymaster.ts --network monad-testnet
 */

import { ethers } from 'hardhat'

const ENTRY_POINT_ADDRESS = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
const INITIAL_DEPOSIT = ethers.parseEther('15') // 15 MON (adjusted for current balance, ethers v6)

async function main() {
  console.log('🚀 Deploying SimplePaymaster...\n')
  
  // Get deployer from DEPLOYER_PRIVATE_KEY
  const [deployer] = await ethers.getSigners()
  
  console.log('Deployer address:', deployer.address)
  const balance = await deployer.provider.getBalance(deployer.address)
  console.log('Deployer balance:', ethers.formatEther(balance), 'MON\n')
  
  // Check balance is sufficient
  if (balance < INITIAL_DEPOSIT) {
    throw new Error(`Insufficient balance. Need at least ${ethers.formatEther(INITIAL_DEPOSIT)} MON`)
  }
  
  // Deploy Paymaster
  console.log('📝 Deploying Paymaster contract...')
  const Paymaster = await ethers.getContractFactory('SimplePaymaster')
  const paymaster = await Paymaster.deploy(ENTRY_POINT_ADDRESS)
  await paymaster.deployed()
  
  console.log('✅ Paymaster deployed to:', paymaster.address)
  console.log('   EntryPoint:', ENTRY_POINT_ADDRESS, '\n')
  
  // Deposit initial MON
  console.log('💰 Depositing initial balance...')
  const depositTx = await paymaster.deposit({ value: INITIAL_DEPOSIT })
  await depositTx.wait()
  
  console.log('✅ Deposited:', ethers.formatEther(INITIAL_DEPOSIT), 'MON')
  console.log('   Transaction:', depositTx.hash, '\n')
  
  // Check Paymaster balance
  const paymasterBalance = await paymaster.getDeposit()
  console.log('📊 Paymaster balance in EntryPoint:', ethers.formatEther(paymasterBalance), 'MON\n')
  
  // Summary
  console.log('=' .repeat(60))
  console.log('✅ DEPLOYMENT COMPLETE!')
  console.log('=' .repeat(60))
  console.log('\n📋 Copy these to your .env file:\n')
  console.log(`PAYMASTER_ADDRESS=${paymaster.address}`)
  console.log(`ENTRY_POINT_ADDRESS=${ENTRY_POINT_ADDRESS}\n`)
  
  console.log('📖 Next steps:')
  console.log('1. Add PAYMASTER_ADDRESS to .env')
  console.log('2. Update backend config to use this paymaster')
  console.log('3. Monitor balance with paymasterManager.startMonitoring()')
  console.log('4. Top up when balance < 10 MON\n')
  
  console.log('💡 To check balance:')
  console.log(`   npx hardhat run scripts/check-paymaster-balance.ts --network monad-testnet\n`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
