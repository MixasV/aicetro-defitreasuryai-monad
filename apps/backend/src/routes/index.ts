import type { Express } from 'express'
import aiRouter from './modules/ai.routes'
import aiManualRouter from './modules/ai-manual.routes'
import aiAgentDeployRouter from './modules/ai-agent-deploy.routes'
import userSmartAccountRouter from './modules/user-smart-account.routes'
import userSmartAccountWithdrawRouter from './modules/user-smart-account-withdraw.routes'
import healthRouter from './modules/health.routes'
import monitoringRouter from './modules/monitoring.routes'
import treasuryRouter from './modules/treasury.routes'
import demoRouter from './modules/demo.routes'
import previewRouter from './modules/preview.routes'
import modeRouter from './modules/mode.routes'
import delegationRouter from './modules/delegation.routes'
import delegationSimpleRouter from './modules/delegation-simple.routes'
import delegationMetaMaskRouter from './modules/delegation-metamask.routes'
import { delegationControlsRouter } from './modules/delegation-controls.routes'
import delegationChainRouter from './modules/delegation-chain.routes'
import smartAccountRouter from './modules/smart-account.routes'
import eip7702Router from './modules/eip7702.routes'
import poolsRouter from './modules/pools.routes'
import { poolUserAnalysisRouter } from './modules/pool-user-analysis.routes'
import { assetManagementRouter } from './modules/asset-management.routes'
import deferredRouter from './modules/deferred.routes'
import alchemyRouter from './modules/alchemy.routes'
import balanceRouter from './modules/balance.routes'
import dashboardRouter from './modules/dashboard.routes'
import feeLimitsRouter from './modules/fee-limits.routes'
import whitelistRouter from './modules/whitelist.routes'
import pendingRebalanceRouter from './modules/pending-rebalance.routes'
import metamaskEnvironmentRouter from './modules/metamask-environment.routes'

export const registerRoutes = (app: Express) => {
  app.use('/api/health', healthRouter)
  app.use('/api/ai', aiRouter)
  app.use('/api/ai', aiManualRouter)  // Manual AI execution endpoints
  app.use('/api/ai-agent', aiAgentDeployRouter)  // AI Agent deployment & status
  app.use('/api/user-smart-account', userSmartAccountRouter)  // User Smart Account management
  app.use('/api/user-smart-account', userSmartAccountWithdrawRouter)  // Withdraw all funds
  app.use('/api/monitoring', monitoringRouter)
  app.use('/api/treasury', treasuryRouter)
  app.use('/api/demo', demoRouter)
  app.use('/api/mode', modeRouter)
  app.use('/api/preview', previewRouter)
  app.use('/api/delegation', delegationSimpleRouter)  // Register simple routes first
  app.use('/api/delegations', delegationSimpleRouter) // ALSO register at /api/delegations for frontend compatibility
  app.use('/api/delegation', delegationMetaMaskRouter) // MetaMask delegation routes
  app.use('/api/delegation', delegationRouter)
  app.use('/api/delegation-controls', delegationControlsRouter)
  app.use('/api/delegation-chain', delegationChainRouter) // Delegation chain operations
  app.use('/api/smart-account', smartAccountRouter)
  app.use('/api/pools', poolsRouter)
  app.use('/api/pools', poolUserAnalysisRouter)  // AI pool analysis for users
  app.use('/api/asset-management', assetManagementRouter)
  app.use('/api/deferred', deferredRouter)
  app.use('/api/alchemy', alchemyRouter)
  app.use('/api/balance', balanceRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/fee-limits', feeLimitsRouter)
  app.use('/api/whitelist', whitelistRouter)
  app.use('/api/pending-rebalance', pendingRebalanceRouter)
  app.use('/api/eip7702', eip7702Router)
  app.use('/api/metamask', metamaskEnvironmentRouter) // MetaMask environment API
  
  // Alias for deferred transactions to match frontend expectations
  app.get('/api/deferred-transactions', (req, res) => {
    res.json({
      success: true,
      transactions: []
    })
  })
}
