/**
 * Deploy AI Agent Smart Account
 * 
 * This script deploys the ONE AI Agent Smart Account used by ALL users.
 * Run this ONCE before starting the backend.
 * 
 * Usage:
 *   pnpm tsx scripts/deploy-ai-agent-sa.ts
 */

import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet } from '../src/chains'
import { Implementation, toMetaMaskSmartAccount } from '@metamask/delegation-toolkit'
import type { Hex } from 'viem'

const MONAD_RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY

async function main() {
  console.log('🚀 Deploying AI Agent Smart Account...')
  console.log('')

  if (!DEPLOYER_PRIVATE_KEY) {
    console.error('❌ DEPLOYER_PRIVATE_KEY not set in environment')
    process.exit(1)
  }

  // Setup clients
  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(MONAD_RPC_URL)
  })

  const ownerAccount = privateKeyToAccount(DEPLOYER_PRIVATE_KEY as Hex)
  const walletClient = createWalletClient({
    account: ownerAccount,
    chain: monadTestnet,
    transport: http(MONAD_RPC_URL)
  })

  console.log('📋 Deployer address:', ownerAccount.address)
  
  // Check deployer balance
  const balance = await publicClient.getBalance({ address: ownerAccount.address })
  console.log('💰 Deployer balance:', balance.toString(), 'wei')
  
  if (balance === 0n) {
    console.error('❌ Deployer has 0 balance! Get MON tokens from faucet:')
    console.error('   https://discord.gg/monad')
    process.exit(1)
  }

  console.log('')
  console.log('🔨 Creating MetaMask Smart Account (Hybrid)...')

  // Create Smart Account
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [ownerAccount.address, [], [], []],
    deploySalt: '0x',
    signer: { account: ownerAccount }
  })

  const aiAgentAddress = smartAccount.address

  console.log('✅ AI Agent SA address:', aiAgentAddress)
  console.log('')

  // Check if already deployed
  const code = await publicClient.getBytecode({ address: aiAgentAddress })
  const isDeployed = code && code !== '0x'

  if (isDeployed) {
    console.log('✅ AI Agent SA already deployed!')
    console.log('   No action needed.')
    console.log('')
    console.log('📋 Summary:')
    console.log('   Address:', aiAgentAddress)
    console.log('   Status: DEPLOYED ✅')
    return
  }

  console.log('⚠️  AI Agent SA NOT deployed yet')
  console.log('   Deploying now...')
  console.log('')

  // Deploy by sending 0 MON to the address
  // This will trigger CREATE2 deployment via Factory
  try {
    console.log('📤 Sending deployment transaction...')
    
    // Get factory args for deployment
    const factoryArgs = await smartAccount.getFactoryArgs()
    if (!factoryArgs) {
      throw new Error('Failed to get factory args')
    }

    console.log('   Factory:', factoryArgs.factory)
    console.log('   Factory data length:', factoryArgs.factoryData?.length || 0)

    // Send 0.001 MON to trigger deployment via UserOp
    // (Alternative: send direct transaction to factory)
    const hash = await walletClient.sendTransaction({
      to: aiAgentAddress,
      value: parseEther('0.001'), // Small amount to fund SA
      data: '0x' // Empty data
    })

    console.log('   TX hash:', hash)
    console.log('   Waiting for confirmation...')

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    if (receipt.status === 'success') {
      console.log('✅ Deployment successful!')
      console.log('   Block:', receipt.blockNumber)
      console.log('   Gas used:', receipt.gasUsed.toString())
    } else {
      console.error('❌ Deployment failed!')
      console.error('   Receipt:', receipt)
      process.exit(1)
    }

  } catch (error: any) {
    console.error('❌ Deployment error:', error.message)
    console.error('')
    console.error('💡 Alternative: Deploy via Factory contract directly')
    console.error('   Or: First UserOp will auto-deploy (if initCode is correct)')
    process.exit(1)
  }

  console.log('')
  console.log('📋 Deployment Summary:')
  console.log('   AI Agent SA:', aiAgentAddress)
  console.log('   Owner:', ownerAccount.address)
  console.log('   Status: DEPLOYED ✅')
  console.log('')
  console.log('🎯 Next steps:')
  console.log('   1. Add this address to .env:')
  console.log(`      AI_AGENT_ADDRESS=${aiAgentAddress}`)
  console.log('   2. Start backend: docker-compose up -d backend')
  console.log('   3. Users can now create delegations!')
}

main()
  .then(() => {
    console.log('')
    console.log('✅ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('')
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
