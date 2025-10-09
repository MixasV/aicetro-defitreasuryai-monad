import { Router } from 'express'
import {
  getPortfolioSnapshotHandler,
  getRiskAlertsHandler,
  getRiskInsightsHandler,
  getPortfolioProjectionHandler,
  getProtocolMetricsHandler,
  monitoringStreamHandler,
  getMonitoringPollerStatusHandler,
  getMonitoringPollerHistoryHandler,
  getMonitoringPollerMetricsHandler,
  startMonitoringPollerHandler,
  stopMonitoringPollerHandler,
  runMonitoringPollerOnceHandler,
  getMonitoringStreamStatusHandler,
  startMonitoringStreamHandler,
  stopMonitoringStreamHandler
} from '../../controllers/monitoring.controller'

const router = Router()

router.get('/stream/:account?', (req, res) => {
  void monitoringStreamHandler(req, res)
})

router.get('/protocols/monad', (req, res) => {
  void getProtocolMetricsHandler(req, res)
})

router.get('/poller/status', (req, res) => {
  getMonitoringPollerStatusHandler(req, res)
})

router.get('/poller/history', (req, res) => {
  getMonitoringPollerHistoryHandler(req, res)
})

router.get('/poller/metrics', (req, res) => {
  getMonitoringPollerMetricsHandler(req, res)
})

router.post('/poller/start', (req, res) => {
  startMonitoringPollerHandler(req, res)
})

router.post('/poller/stop', (req, res) => {
  stopMonitoringPollerHandler(req, res)
})

router.post('/poller/run', (req, res) => {
  void runMonitoringPollerOnceHandler(req, res)
})

router.get('/stream/control/status', (req, res) => {
  getMonitoringStreamStatusHandler(req, res)
})

router.post('/stream/control/start', (req, res) => {
  void startMonitoringStreamHandler(req, res)
})

router.post('/stream/control/stop', (req, res) => {
  void stopMonitoringStreamHandler(req, res)
})

router.get('/portfolio/:address/projection', (req, res) => {
  void getPortfolioProjectionHandler(req, res)
})

router.get('/portfolio/:address', (req, res) => {
  void getPortfolioSnapshotHandler(req, res)
})
router.get('/alerts/:address', (req, res) => {
  void getRiskAlertsHandler(req, res)
})
router.get('/risk/:address', (req, res) => {
  void getRiskInsightsHandler(req, res)
})

export default router
