import { beforeEach, describe, expect, it, vi } from 'vitest'

const getConfigurationStatusMock = vi.hoisted(() => vi.fn())
const getControllerStatusMock = vi.hoisted(() => vi.fn())
const emitMock = vi.hoisted(() => vi.fn())
const loggerWarnMock = vi.hoisted(() => vi.fn())

vi.mock('../../config/logger', () => ({
  logger: {
    warn: loggerWarnMock,
    info: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../emergency.controller.client', () => ({
  emergencyControllerClient: {
    getConfigurationStatus: getConfigurationStatusMock,
    getStatus: getControllerStatusMock
  }
}))

vi.mock('../emergency.events', () => ({
  emergencyEventBus: {
    emit: emitMock,
    on: vi.fn(),
    off: vi.fn()
  }
}))

// eslint-disable-next-line import/first
import { emergencyStateService } from '../emergency.state'

const ACCOUNT = '0xAABBCCDD'

describe('emergencyStateService', () => {
  beforeEach(() => {
    emitMock.mockReset()
    loggerWarnMock.mockReset()
    getConfigurationStatusMock.mockReset()
    getControllerStatusMock.mockReset()
    getConfigurationStatusMock.mockReturnValue({
      configured: true,
      issues: [],
      controllerAddress: '0xcontroller000000000000000000000000000000000000'
    })
    getControllerStatusMock.mockResolvedValue({ paused: false })
    const stateMap = (emergencyStateService as unknown as { states: Map<string, unknown> }).states
    stateMap.clear()
  })

  it('синхронизирует paused состояние при включенном контроллере', async () => {
    getControllerStatusMock.mockResolvedValueOnce({ paused: true })

    const status = await emergencyStateService.syncWithController(ACCOUNT)

    expect(status.state).toBe('paused')
    expect(emitMock).toHaveBeenCalledWith('status', expect.objectContaining({ state: 'paused' }))
  })

  it('сохраняет активное состояние, если контроллер не в паузе', async () => {
    getControllerStatusMock.mockResolvedValueOnce({ paused: false })

    const status = await emergencyStateService.syncWithController(ACCOUNT)

    expect(status.state).toBe('active')
    expect(emitMock).toHaveBeenCalledWith('status', expect.objectContaining({ state: 'active' }))
  })

  it('возвращает локальный статус, когда конфигурация отсутствует', async () => {
    getConfigurationStatusMock.mockReturnValueOnce({ configured: false, issues: ['missing env'] })

    const status = await emergencyStateService.syncWithController(ACCOUNT)

    expect(status.state).toBe('active')
    expect(getControllerStatusMock).not.toHaveBeenCalled()
  })

  it('не переизлучает событие, если статус не изменился', () => {
    emergencyStateService.setPaused(ACCOUNT, { action: 'stop' })
    expect(emitMock).toHaveBeenCalledTimes(1)

    emitMock.mockClear()
    const status = emergencyStateService.setPaused(ACCOUNT)

    expect(status.state).toBe('paused')
    expect(emitMock).not.toHaveBeenCalled()
  })

  it('возвращает локальный статус при ошибке контроллера', async () => {
    getControllerStatusMock.mockRejectedValueOnce(new Error('rpc error'))

    const status = await emergencyStateService.syncWithController(ACCOUNT)

    expect(status.state).toBe('active')
  })
})
