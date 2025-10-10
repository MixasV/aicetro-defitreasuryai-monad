import { blockchainService } from '../services/blockchain/blockchain.service'
import { monitoringService } from '../services/monitoring/monitoring.service'
import { aiService } from '../services/ai/ai.service'
import { normalizeProtocolId } from '../services/ai/protocol.registry'

async function main () {
  console.log('Setting up MockCorp demo environment...')

  const account = await blockchainService.createCorporateAccount(
    ['0xOwner1', '0xOwner2', '0xOwner3'],
    2,
    'MockCorp Copilot'
  )
  console.log('Corporate account prepared:', account)

  const portfolio = await monitoringService.getPortfolioSnapshot(account.address)
  console.log('Portfolio snapshot:', portfolio)

  const protocolMetrics = await monitoringService.getProtocolMetrics()
  const allowedProtocols = ['nabla:usdc', 'nabla:usdt', 'uniswap:usdc-usdt']

  const recommendation = await aiService.generateRecommendations({
    portfolio,
    riskTolerance: 'balanced',
    protocols: allowedProtocols,
    constraints: {
      dailyLimitUsd: portfolio.totalValueUSD,
      remainingDailyLimitUsd: portfolio.totalValueUSD,
      maxRiskScore: 4,
      whitelist: allowedProtocols.map(normalizeProtocolId)
    },
    protocolMetrics,
    context: {
      account: account.address.toLowerCase(),
      delegate: account.aiAgentAddress.toLowerCase(),
      chainId: 10143,
      scenario: 'demo-setup'
    }
  })
  console.log('AI recommendation:', recommendation)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
