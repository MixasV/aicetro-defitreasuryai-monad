import { Router } from 'express';
import { dashboardStatsService } from '../../services/dashboard/dashboard-stats.service';
import { quarantineService } from '../../services/dashboard/quarantine.service';
import { poolMonitoringService } from '../../services/dashboard/pool-monitoring.service';

export const dashboardRouter = Router();

// Dashboard stats endpoint (DEMO vs REAL data)
dashboardRouter.get('/stats/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    
    if (!accountAddress || !accountAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid account address'
      });
    }

    const stats = await dashboardStatsService.getStats(accountAddress);
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('[API] Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dashboard stats'
    });
  }
});

// Get quarantined pools
dashboardRouter.get('/quarantine/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const pools = await quarantineService.getQuarantinedPools(accountId);
    
    res.json({
      success: true,
      pools
    });
  } catch (error) {
    console.error('[API] Get quarantine error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get quarantined pools'
    });
  }
});

// Review quarantined pool
dashboardRouter.post('/quarantine/:quarantineId/review', async (req, res) => {
  try {
    const { quarantineId } = req.params;
    const pool = await quarantineService.reviewPool(quarantineId);
    
    res.json({
      success: true,
      pool
    });
  } catch (error) {
    console.error('[API] Review quarantine error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to review pool'
    });
  }
});

// Enable AI monitoring for pool
dashboardRouter.post('/pool/monitoring/enable', async (req, res) => {
  try {
    const { accountAddress, poolAddress, protocol, signature, message } = req.body;
    
    if (!accountAddress || !poolAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const permission = await poolMonitoringService.enableMonitoring({
      accountAddress,
      poolAddress,
      protocol,
      signature,
      message
    });
    
    res.json({
      success: true,
      permission
    });
  } catch (error) {
    console.error('[API] Enable monitoring error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enable monitoring'
    });
  }
});

// Disable AI monitoring for pool
dashboardRouter.post('/pool/monitoring/disable', async (req, res) => {
  try {
    const { accountAddress, poolAddress } = req.body;
    
    if (!accountAddress || !poolAddress) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const permission = await poolMonitoringService.disableMonitoring(
      accountAddress,
      poolAddress
    );
    
    res.json({
      success: true,
      permission
    });
  } catch (error) {
    console.error('[API] Disable monitoring error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disable monitoring'
    });
  }
});

// Get monitored pools
dashboardRouter.get('/pool/monitoring/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    const pools = await poolMonitoringService.getMonitoredPools(accountAddress);
    
    res.json({
      success: true,
      pools
    });
  } catch (error) {
    console.error('[API] Get monitored pools error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get monitored pools'
    });
  }
});

export default dashboardRouter;
