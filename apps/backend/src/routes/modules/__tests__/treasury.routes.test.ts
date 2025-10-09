import type { Request, Response } from 'express'
import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const createCorporateAccountMock = vi.hoisted(() => vi.fn())
const getDelegationsMock = vi.hoisted(() => vi.fn())
const emergencyStopMock = vi.hoisted(() => vi.fn())
const emergencyResumeMock = vi.hoisted(() => vi.fn())
const configureDelegationMock = vi.hoisted(() => vi.fn())
const recordSuccessMock = vi.hoisted(() => vi.fn())
const recordFailureMock = vi.hoisted(() => vi.fn())
const getEmergencyLogMock = vi.hoisted(() => vi.fn().mockReturnValue([]))
const setPausedMock = vi.hoisted(() => vi.fn())
const setActiveMock = vi.hoisted(() => vi.fn())
const syncWithControllerMock = vi.hoisted(() => vi.fn())
const eventBusOnMock = vi.hoisted(() => vi.fn())
const eventBusOffMock = vi.hoisted(() => vi.fn())
const getSecuritySummaryMock = vi.hoisted(() => vi.fn())

const ACCOUNT_ADDRESS = '0x12345678'
const DELEGATE_ADDRESS = '0x87654321'
const OWNER_ADDRESSES = ['0x11111111', '0x22222222', '0x33333333']

vi.mock('../../../services/blockchain/blockchain.service', () => ({
  blockchainService: {
    createCorporateAccount: createCorporateAccountMock,
    getDelegations: getDelegationsMock,
    emergencyStop: emergencyStopMock,
    emergencyResume: emergencyResumeMock,
    configureDelegation: configureDelegationMock
  }
}))

vi.mock('../../../services/emergency/emergency.service', () => ({
  emergencyLogService: {
    recordSuccess: recordSuccessMock,
    recordFailure: recordFailureMock,
    list: getEmergencyLogMock
  }
}))

vi.mock('../../../services/emergency/emergency.state', () => ({
  emergencyStateService: {
    setPaused: setPausedMock,
    setActive: setActiveMock,
    getStatus: vi.fn(),
    syncWithController: syncWithControllerMock
  }
}))

vi.mock('../../../services/security/security-dashboard.service', () => ({
  securityDashboardService: {
    getSummary: getSecuritySummaryMock
  }
}))

vi.mock('../../../services/emergency/emergency.events', () => {
  const bus = {
    on: eventBusOnMock,
    off: eventBusOffMock
  }
  return {
    emergencyEventBus: bus
  }
})

const { createServer } = await import('../../../server')
const { emergencyEventsStreamHandler } = await import('../../../controllers/treasury.controller')

let app: ReturnType<typeof createServer>

const buildCorporateAccount = () => ({
  address: ACCOUNT_ADDRESS,
  owners: OWNER_ADDRESSES,
  threshold: 2,
  createdAt: new Date().toISOString()
})

const buildDelegation = () => ({
  delegate: DELEGATE_ADDRESS,
  dailyLimit: '10000',
  spent24h: '1000',
  allowedProtocols: ['Aave Monad'],
  maxRiskScore: 3,
  updatedAt: new Date().toISOString()
})

describe('treasury routes', () => {
  beforeAll(() => {
    app = createServer()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    syncWithControllerMock.mockImplementation(async (account: string) => ({
      account: account.toLowerCase(),
      state: 'active',
      updatedAt: new Date().toISOString()
    }))
  })

  describe('POST /api/treasury/accounts', () => {
    it('создаёт корпоративный аккаунт', async () => {
      const account = buildCorporateAccount()
      createCorporateAccountMock.mockResolvedValueOnce(account)

      const res = await request(app)
        .post('/api/treasury/accounts')
        .send({
          owners: OWNER_ADDRESSES,
          threshold: 2
        })

      expect(res.status).toBe(201)
      expect(res.body).toEqual(account)
      expect(createCorporateAccountMock).toHaveBeenCalledWith(
        OWNER_ADDRESSES,
        2
      )
    })

    it('возвращает 400 при неверных данных', async () => {
      const res = await request(app)
        .post('/api/treasury/accounts')
        .send({ owners: ['0xowner1'] })

      expect(res.status).toBe(400)
      expect(createCorporateAccountMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      createCorporateAccountMock.mockRejectedValueOnce(new Error('db down'))

      const res = await request(app)
        .post('/api/treasury/accounts')
        .send({
          owners: OWNER_ADDRESSES,
          threshold: 2
        })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось создать корпоративный аккаунт' })
    })
  })

  describe('GET /api/treasury/delegations/:account', () => {
    it('возвращает список делегирований', async () => {
      const delegations = [buildDelegation()]
      getDelegationsMock.mockResolvedValueOnce(delegations)

      const res = await request(app).get(`/api/treasury/delegations/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(delegations)
      expect(getDelegationsMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 500 при сбое сервиса', async () => {
      getDelegationsMock.mockRejectedValueOnce(new Error('oops'))

      const res = await request(app).get(`/api/treasury/delegations/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить делегирования' })
    })
  })

  describe('GET /api/treasury/security/:account', () => {
    it('возвращает сводку по безопасности', async () => {
      const summary = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        generatedAt: new Date().toISOString(),
        mode: 'real',
        delegation: null,
        emergency: {
          state: 'active',
          updatedAt: new Date().toISOString()
        },
        trustlessGuarantees: [],
        checks: []
      }

      getSecuritySummaryMock.mockResolvedValueOnce(summary)

      const res = await request(app).get(`/api/treasury/security/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body.account).toBe(ACCOUNT_ADDRESS.toLowerCase())
      expect(getSecuritySummaryMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS.toLowerCase())
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getSecuritySummaryMock.mockRejectedValueOnce(new Error('boom'))

      const res = await request(app).get(`/api/treasury/security/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body.message).toBe('Не удалось собрать trustless security сводку')
    })
  })

  describe('POST /api/treasury/delegations', () => {
    it('обновляет делегирование', async () => {
      const delegation = buildDelegation()
      configureDelegationMock.mockResolvedValueOnce(delegation)

      const res = await request(app)
        .post('/api/treasury/delegations')
        .send({
          account: ACCOUNT_ADDRESS,
          delegate: DELEGATE_ADDRESS,
          dailyLimitUsd: 10000,
          whitelist: ['Aave Monad'],
          maxRiskScore: 3
        })

      expect(res.status).toBe(200)
      expect(res.body).toEqual(delegation)
      expect(configureDelegationMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, {
        delegate: DELEGATE_ADDRESS,
        dailyLimitUsd: 10000,
        whitelist: ['Aave Monad'],
        maxRiskScore: 3
      })
    })

    it('возвращает 400 при некорректном payload', async () => {
      const res = await request(app)
        .post('/api/treasury/delegations')
        .send({})

      expect(res.status).toBe(400)
      expect(configureDelegationMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке обновления', async () => {
      configureDelegationMock.mockRejectedValueOnce(new Error('db fail'))

      const res = await request(app)
        .post('/api/treasury/delegations')
        .send({
          account: ACCOUNT_ADDRESS,
          delegate: DELEGATE_ADDRESS,
          dailyLimitUsd: 10000,
          whitelist: ['Aave Monad'],
          maxRiskScore: 3
        })

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось обновить делегирование' })
    })
  })

  describe('POST /api/treasury/emergency-stop/:account', () => {
    it('инициирует emergency stop', async () => {
      const result = { mode: 'executed', simulated: false, txHash: '0xdeadbeef', reason: undefined }
      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'paused',
        updatedAt: new Date().toISOString(),
        metadata: { txHash: result.txHash, simulated: false, action: 'stop', mode: result.mode }
      }
      emergencyStopMock.mockResolvedValueOnce(result)
      setPausedMock.mockReturnValueOnce(status)
      const logEntry = {
        id: 'log-stop-1',
        account: ACCOUNT_ADDRESS.toLowerCase(),
        status: 'success' as const,
        message: 'Emergency stop выполнен успешно',
        metadata: {
          mode: result.mode,
          txHash: result.txHash,
          simulated: result.simulated,
          reason: result.reason,
          action: 'stop'
        },
        createdAt: '2025-10-05T00:00:00.000Z'
      }
      recordSuccessMock.mockReturnValueOnce(logEntry)

      const res = await request(app).post(`/api/treasury/emergency-stop/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        operation: 'stop',
        status,
        mode: result.mode,
        message: 'Emergency stop выполнен успешно',
        completedAt: logEntry.createdAt,
        simulated: result.simulated,
        txHash: result.txHash,
        reason: result.reason,
        logEntry
      })
      expect(emergencyStopMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
      expect(setPausedMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, {
        txHash: result.txHash,
        simulated: result.simulated,
        reason: undefined,
        action: 'stop',
        mode: result.mode
      })
      expect(recordSuccessMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, 'Emergency stop выполнен успешно', {
        mode: result.mode,
        txHash: result.txHash,
        simulated: result.simulated,
        reason: undefined,
        action: 'stop'
      })
      expect(recordFailureMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 если операция завершилась ошибкой', async () => {
      emergencyStopMock.mockRejectedValueOnce(new Error('tx failed'))

      const res = await request(app).post(`/api/treasury/emergency-stop/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Emergency stop завершился с ошибкой' })
      expect(recordFailureMock).toHaveBeenCalledWith(
        ACCOUNT_ADDRESS,
        'Emergency stop завершился ошибкой',
        expect.objectContaining({ action: 'stop', mode: 'skipped', simulated: false })
      )
      expect(setActiveMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ action: 'auto' }))
      expect(setPausedMock).not.toHaveBeenCalled()
      expect(recordSuccessMock).not.toHaveBeenCalled()
    })

    it('возвращает 400 при некорректном адресе', async () => {
      const res = await request(app).post('/api/treasury/emergency-stop/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес аккаунта')
      expect(emergencyStopMock).not.toHaveBeenCalled()
      expect(recordSuccessMock).not.toHaveBeenCalled()
      expect(recordFailureMock).not.toHaveBeenCalled()
    })
  })

  describe('POST /api/treasury/emergency-resume/:account', () => {
    it('возобновляет операции после emergency stop', async () => {
      const result = { mode: 'executed', simulated: false, txHash: '0xbeefcafe', reason: undefined }
      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'active',
        updatedAt: new Date().toISOString(),
        metadata: { txHash: result.txHash, simulated: false, action: 'resume', mode: result.mode }
      }
      emergencyResumeMock.mockResolvedValueOnce(result)
      setActiveMock.mockReturnValueOnce(status)
      const logEntry = {
        id: 'log-resume-1',
        account: ACCOUNT_ADDRESS.toLowerCase(),
        status: 'success' as const,
        message: 'Emergency resume выполнен успешно',
        metadata: {
          mode: result.mode,
          txHash: result.txHash,
          simulated: result.simulated,
          reason: result.reason,
          action: 'resume'
        },
        createdAt: '2025-10-05T00:00:01.000Z'
      }
      recordSuccessMock.mockReturnValueOnce(logEntry)

      const res = await request(app).post(`/api/treasury/emergency-resume/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        operation: 'resume',
        status,
        mode: result.mode,
        message: 'Emergency resume выполнен успешно',
        completedAt: logEntry.createdAt,
        simulated: result.simulated,
        txHash: result.txHash,
        reason: result.reason,
        logEntry
      })
      expect(emergencyResumeMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
      expect(setActiveMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, {
        txHash: result.txHash,
        simulated: result.simulated,
        reason: undefined,
        action: 'resume',
        mode: result.mode
      })
      expect(recordSuccessMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, 'Emergency resume выполнен успешно', {
        mode: result.mode,
        txHash: result.txHash,
        simulated: result.simulated,
        reason: undefined,
        action: 'resume'
      })
      expect(setPausedMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке возобновления', async () => {
      emergencyResumeMock.mockRejectedValueOnce(new Error('resume failed'))

      const res = await request(app).post(`/api/treasury/emergency-resume/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Emergency resume завершился с ошибкой' })
      expect(setPausedMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS, expect.objectContaining({ action: 'auto' }))
      expect(recordFailureMock).toHaveBeenCalledWith(
        ACCOUNT_ADDRESS,
        'Emergency resume завершился ошибкой',
        expect.objectContaining({ action: 'resume', mode: 'skipped', simulated: false })
      )
      expect(recordSuccessMock).not.toHaveBeenCalled()
    })

    it('возвращает 400 при некорректном адресе', async () => {
      const res = await request(app).post('/api/treasury/emergency-resume/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес аккаунта')
      expect(emergencyResumeMock).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/treasury/emergency-status/:account', () => {
    it('возвращает статус emergency stop', async () => {
      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'paused',
        updatedAt: new Date().toISOString(),
        metadata: { simulated: false }
      }
      syncWithControllerMock.mockResolvedValueOnce(status)

      const res = await request(app).get(`/api/treasury/emergency-status/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(status)
      expect(syncWithControllerMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 при неверном адресе', async () => {
      const res = await request(app).get('/api/treasury/emergency-status/invalid')

      expect(res.status).toBe(400)
      expect(syncWithControllerMock).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/treasury/emergency-control/:account', () => {
    it('возвращает snapshot контроля с последним действием', async () => {
      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'paused',
        updatedAt: '2025-10-05T00:00:10.000Z',
        metadata: { simulated: false, txHash: '0xstatus', mode: 'executed', action: 'stop' }
      }
      const logEntry = {
        id: 'log-1',
        account: ACCOUNT_ADDRESS.toLowerCase(),
        status: 'success' as const,
        message: 'Emergency stop выполнен успешно',
        metadata: {
          action: 'stop',
          mode: 'executed',
          txHash: '0xstatus',
          simulated: false
        },
        createdAt: '2025-10-05T00:00:11.000Z'
      }

      syncWithControllerMock.mockResolvedValueOnce(status)
      getEmergencyLogMock.mockReturnValueOnce([logEntry])

      const res = await request(app).get(`/api/treasury/emergency-control/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        account: status.account,
        status,
        isPaused: true,
        updatedAt: status.updatedAt,
        lastAction: {
          operation: 'stop',
          status,
          mode: 'executed',
          simulated: false,
          txHash: '0xstatus',
          reason: undefined,
          message: logEntry.message,
          completedAt: logEntry.createdAt,
          logEntry
        }
      })
      expect(syncWithControllerMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
      expect(getEmergencyLogMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS.toLowerCase())
    })

    it('возвращает snapshot без действия, если журнал пуст', async () => {
      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'active',
        updatedAt: '2025-10-05T00:00:20.000Z'
      }
      syncWithControllerMock.mockResolvedValueOnce(status)
      getEmergencyLogMock.mockReturnValueOnce([])

      const res = await request(app).get(`/api/treasury/emergency-control/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        account: status.account,
        status,
        isPaused: false,
        updatedAt: status.updatedAt,
        lastAction: null
      })
    })

    it('возвращает 400 при неверном адресе', async () => {
      const res = await request(app).get('/api/treasury/emergency-control/not-an-account')

      expect(res.status).toBe(400)
      expect(syncWithControllerMock).not.toHaveBeenCalled()
      expect(getEmergencyLogMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      syncWithControllerMock.mockRejectedValueOnce(new Error('state unavailable'))

      const res = await request(app).get(`/api/treasury/emergency-control/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить текущее состояние emergency контроля' })
    })
  })

  describe('GET /api/treasury/emergency-log', () => {
    it('возвращает общий журнал', async () => {
      const entries = [{
        id: 'entry-1',
        account: ACCOUNT_ADDRESS,
        status: 'success',
        message: 'ok',
        createdAt: new Date().toISOString()
      }]
      getEmergencyLogMock.mockReturnValueOnce(entries)

      const res = await request(app).get('/api/treasury/emergency-log')

      expect(res.status).toBe(200)
      expect(res.body).toEqual(entries)
      expect(getEmergencyLogMock).toHaveBeenCalledWith(undefined)
    })

    it('возвращает журнал конкретного аккаунта', async () => {
      const entries = [{
        id: 'entry-2',
        account: ACCOUNT_ADDRESS,
        status: 'error',
        message: 'failed',
        createdAt: new Date().toISOString()
      }]
      getEmergencyLogMock.mockReturnValueOnce(entries)

      const res = await request(app).get(`/api/treasury/emergency-log/${ACCOUNT_ADDRESS}`)

      expect(res.status).toBe(200)
      expect(res.body).toEqual(entries)
      expect(getEmergencyLogMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS)
    })

    it('возвращает 400 при некорректном адресе', async () => {
      const res = await request(app).get('/api/treasury/emergency-log/not-an-address')

      expect(res.status).toBe(400)
      expect(res.body.message).toBe('Некорректный адрес аккаунта')
      expect(getEmergencyLogMock).not.toHaveBeenCalled()
    })

    it('возвращает 500 при ошибке сервиса', async () => {
      getEmergencyLogMock.mockImplementationOnce(() => {
        throw new Error('store unavailable')
      })

      const res = await request(app).get('/api/treasury/emergency-log')

      expect(res.status).toBe(500)
      expect(res.body).toEqual({ message: 'Не удалось получить журнал emergency событий' })
    })
  })

  describe('emergency events stream handler', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('отправляет начальные данные и подписывается на события', async () => {
      vi.useFakeTimers()

      const listeners = new Map<string, (payload: any) => void>()
      const busMock = { on: eventBusOnMock, off: eventBusOffMock }
      eventBusOnMock.mockImplementation((event: string, listener: (payload: any) => void) => {
        listeners.set(event, listener)
        return busMock
      })
      eventBusOffMock.mockImplementation((event: string) => {
        listeners.delete(event)
        return busMock
      })

      const status = {
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'paused',
        updatedAt: new Date().toISOString(),
        metadata: { action: 'stop' }
      }
      const logEntries = [{
        id: 'log-1',
        account: ACCOUNT_ADDRESS.toLowerCase(),
        status: 'success',
        message: 'ok',
        createdAt: new Date().toISOString()
      }]

      syncWithControllerMock.mockResolvedValueOnce(status)
      getEmergencyLogMock.mockReturnValueOnce(logEntries)

      const requestListeners: Record<string, () => void> = {}
      const req = {
        params: { account: ACCOUNT_ADDRESS },
        on: vi.fn((event: string, handler: () => void) => {
          requestListeners[event] = handler
          return req
        })
      } as unknown as Request

      const writes: string[] = []
      const setHeader = vi.fn()
      const flushHeaders = vi.fn()
      const write = vi.fn((chunk: string) => {
        writes.push(chunk)
        return true
      })
      const end = vi.fn()
      const res = {
        setHeader,
        flushHeaders,
        write,
        end
      } as unknown as Response

      await emergencyEventsStreamHandler(req, res)

      expect(setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream')
      expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache')
      expect(setHeader).toHaveBeenCalledWith('Connection', 'keep-alive')
      expect(flushHeaders).toHaveBeenCalled()
      expect(eventBusOnMock).toHaveBeenCalledWith('status', expect.any(Function))
      expect(eventBusOnMock).toHaveBeenCalledWith('log', expect.any(Function))

      expect(writes.some(chunk => chunk.includes('event: status'))).toBe(true)
      expect(writes.some(chunk => chunk.includes(JSON.stringify(status)))).toBe(true)
      expect(writes.some(chunk => chunk.includes('event: log-batch'))).toBe(true)
      expect(writes.some(chunk => chunk.includes(JSON.stringify(logEntries)))).toBe(true)

      vi.advanceTimersByTime(25_000)
      expect(writes.some(chunk => chunk.includes('event: heartbeat'))).toBe(true)

      listeners.get('status')?.({
        account: ACCOUNT_ADDRESS.toLowerCase(),
        state: 'active',
        updatedAt: new Date().toISOString()
      })
      expect(writes.filter(chunk => chunk.includes('event: status')).length).toBeGreaterThan(1)

      requestListeners.close?.()
      expect(eventBusOffMock).toHaveBeenCalledWith('status', expect.any(Function))
      expect(eventBusOffMock).toHaveBeenCalledWith('log', expect.any(Function))
      expect(end).toHaveBeenCalled()
      expect(syncWithControllerMock).toHaveBeenCalledWith(ACCOUNT_ADDRESS.toLowerCase())
    })

    it('возвращает 400 при некорректном адресе', async () => {
      const req = {
        params: { account: 'not-an-address' },
        on: vi.fn()
      } as unknown as Request

      const status = vi.fn().mockReturnThis()
      const json = vi.fn()
      const res = {
        status,
        json
      } as unknown as Response

      await emergencyEventsStreamHandler(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Некорректный адрес аккаунта' }))
      expect(eventBusOnMock).not.toHaveBeenCalled()
    })
  })
})
