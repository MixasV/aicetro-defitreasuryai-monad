import { env } from './config/env'
import { logger } from './config/logger'
import { createServer } from './server'
import { initializeScheduler, shutdownScheduler } from './services/ai/scheduler.manager'
import { initializeMonitoringPoller, shutdownMonitoringPoller } from './services/monitoring/monitoring.poller.manager'
import { initializeMonitoringStream, shutdownMonitoringStream } from './services/monitoring/monitoring.stream.manager'
import { initializeAIPoolAnalysis, shutdownAIPoolAnalysis } from './services/pools/ai-pool-analysis.manager'
import { initializeMonadPoolMonitor, shutdownMonadPoolMonitor } from './jobs/monad-pool-monitor.manager'
import { poolDiscoveryService } from './services/pools/pool-discovery.service'
import { deferredExecutionService } from './services/ai/deferred-execution.service'
import { snapshotScheduler } from './jobs/snapshot.scheduler'
import { aiAgentSmartAccountService } from './services/erc4337/ai-agent-smart-account.service'
import { metaMaskEnvironmentService } from './services/metamask/metamask-environment.service'

const app = createServer()

// CRITICAL: Initialize Monad Testnet environment for MetaMask SDK
// This ensures delegations use authority = 0x0000... (root delegation)
logger.info('Initializing Monad Testnet environment for MetaMask Delegation Toolkit...')
const monadEnvironment = metaMaskEnvironmentService.getMonadTestnetEnvironment()
logger.info({ 
  DelegationManager: monadEnvironment.DelegationManager 
}, 'MetaMask environment ready - delegations will use correct authority')

// Initialize AI Agent Smart Account (counterfactual)
logger.info('Initializing AI Agent Smart Account...')
void aiAgentSmartAccountService.initialize().then((config) => {
  logger.info({ 
    address: config.address,
    isDeployed: config.isDeployed 
  }, 'AI Agent Smart Account ready (counterfactual)')
  if (!config.isDeployed) {
    logger.info('AI Agent SA will auto-deploy on first redemption (Gas Manager sponsors)')
  }
}).catch((error) => {
  logger.error({ error }, 'Failed to initialize AI Agent Smart Account')
})
initializeScheduler()
initializeMonitoringPoller()
void initializeMonitoringStream()
// ⚠️ DISABLED: AIPoolAnalysis eats ALL OpenRouter free tier quota (297 rate limit errors!)
// This scheduler makes massive batch analysis of 80 pools on startup
// For free tier models, this exhausts quota and blocks main AI execution
// Re-enable when using paid model or when rate limits are increased
// initializeAIPoolAnalysis()
initializeMonadPoolMonitor() // Monad pool monitor (5 min interval)
deferredExecutionService.start()
snapshotScheduler.start() // Hourly snapshots + daily cleanup

// Start pool discovery cron jobs
setInterval(() => {
  void poolDiscoveryService.syncDefiLlamaPools()
}, 15 * 60 * 1000) // Every 15 minutes

setInterval(() => {
  void poolDiscoveryService.syncEnvioPools()
}, 60 * 60 * 1000) // Every 1 hour

setInterval(() => {
  void poolDiscoveryService.markUserPools()
}, 5 * 60 * 1000) // Every 5 minutes

// Run initial sync (don't await to not block startup)
void poolDiscoveryService.syncDefiLlamaPools()
void poolDiscoveryService.syncEnvioPools()

const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info({ port: env.port, host: '0.0.0.0' }, 'Backend API started (all interfaces - protected by firewall)')
})

const gracefulShutdown = () => {
  logger.info('Received termination signal, stopping services...')
  shutdownScheduler()
  shutdownMonitoringPoller()
  void shutdownMonitoringStream()
  // shutdownAIPoolAnalysis() // Disabled (see above)
  shutdownMonadPoolMonitor() // Stop Monad monitor
  deferredExecutionService.stop()
  snapshotScheduler.stop()
  server.close(() => {
    logger.info('HTTP server stopped. Exiting process.')
    process.exit(0)
  })
}

process.once('SIGINT', gracefulShutdown)
process.once('SIGTERM', gracefulShutdown)
