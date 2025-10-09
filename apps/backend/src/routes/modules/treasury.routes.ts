import { Router } from 'express'
import {
  createCorporateAccountHandler,
  getDelegationsHandler,
  triggerEmergencyStopHandler,
  resumeEmergencyStopHandler,
  configureDelegationHandler,
  getEmergencyLogHandler,
  getEmergencyStatusHandler,
  getEmergencyControlSnapshotHandler,
  emergencyEventsStreamHandler,
  getSecurityDashboardHandler
} from '../../controllers/treasury.controller'

const router = Router()

router.post('/accounts', (req, res) => {
  void createCorporateAccountHandler(req, res)
})
router.get('/delegations/:account', (req, res) => {
  void getDelegationsHandler(req, res)
})
router.post('/emergency-stop/:account', (req, res) => {
  void triggerEmergencyStopHandler(req, res)
})
router.post('/emergency-resume/:account', (req, res) => {
  void resumeEmergencyStopHandler(req, res)
})
router.get('/emergency-status/:account', (req, res) => {
  void getEmergencyStatusHandler(req, res)
})
router.get('/emergency-control/:account', (req, res) => {
  void getEmergencyControlSnapshotHandler(req, res)
})
router.get('/emergency-log', (req, res) => {
  void getEmergencyLogHandler(req, res)
})
router.get('/emergency-log/:account', (req, res) => {
  void getEmergencyLogHandler(req, res)
})
router.get('/emergency-stream/:account?', (req, res) => {
  void emergencyEventsStreamHandler(req, res)
})
router.post('/delegations', (req, res) => {
  void configureDelegationHandler(req, res)
})
router.get('/security/:account', (req, res) => {
  void getSecurityDashboardHandler(req, res)
})

export default router
