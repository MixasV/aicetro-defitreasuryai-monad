import { beforeEach, describe, expect, it, vi } from 'vitest'

const writeContractMock = vi.hoisted(() => vi.fn())
const waitForReceiptMock = vi.hoisted(() => vi.fn())
const httpMock = vi.hoisted(() => vi.fn(() => ({}) as unknown))

vi.mock('viem', async () => {
  const actual = await vi.importActual<any>('viem')
  return {
    ...actual,
    createWalletClient: vi.fn(() => ({ writeContract: writeContractMock })),
    createPublicClient: vi.fn(() => ({ waitForTransactionReceipt: waitForReceiptMock })),
    http: httpMock
  }
})

const privateKeyToAccountMock = vi.hoisted(() => vi.fn(() => ({ address: '0xcontroller' })))

vi.mock('viem/accounts', () => ({
  privateKeyToAccount: privateKeyToAccountMock
}))

const envMock = vi.hoisted(() => ({
  monadRpcUrl: 'https://rpc.test',
  deployerPrivateKey: `0x${'1'.repeat(64)}`,
  emergencyControllerAddress: `0x${'a'.repeat(40)}`
}))

vi.mock('../../../config/env', () => ({ env: envMock }))

const loggerInfoMock = vi.hoisted(() => vi.fn())
const loggerWarnMock = vi.hoisted(() => vi.fn())
const loggerErrorMock = vi.hoisted(() => vi.fn())

vi.mock('../../../config/logger', () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock,
    error: loggerErrorMock
  }
}))

// eslint-disable-next-line import/first
import { emergencyControllerClient } from '../emergency.controller.client'
// eslint-disable-next-line import/first
import { createWalletClient, createPublicClient } from 'viem'

describe('emergencyControllerClient', () => {
  beforeEach(() => {
    writeContractMock.mockReset()
    waitForReceiptMock.mockReset()
    httpMock.mockClear()
    privateKeyToAccountMock.mockClear()
    loggerInfoMock.mockClear()
    loggerWarnMock.mockClear()
    loggerErrorMock.mockClear()
    Object.assign(envMock, {
      monadRpcUrl: 'https://rpc.test',
      deployerPrivateKey: `0x${'1'.repeat(64)}`,
      emergencyControllerAddress: `0x${'a'.repeat(40)}`
    })
    // reset cached clients
    ;(emergencyControllerClient as any).walletClient = null
    ;(emergencyControllerClient as any).publicClient = null
    ;(emergencyControllerClient as any).controllerAddress = null
    ;(emergencyControllerClient as any).signer = null
  })

  it('returns simulated result when configuration is incomplete', async () => {
    envMock.monadRpcUrl = ''

    const result = await emergencyControllerClient.pause('0xaccount')

    expect(result.mode).toBe('simulated')
    expect(result.simulated).toBe(true)
    expect(result.reason).toContain('Emergency controller not configured')
    expect(loggerWarnMock).toHaveBeenCalled()
    expect(writeContractMock).not.toHaveBeenCalled()
  })

  it('executes pause on-chain when configuration is valid', async () => {
    writeContractMock.mockResolvedValueOnce('0xhash')
    waitForReceiptMock.mockResolvedValueOnce({ status: 'success' })

    const result = await emergencyControllerClient.pause('0xaccount')

    expect(result).toMatchObject({ mode: 'executed', simulated: false, txHash: '0xhash' })
    expect(createWalletClient).toHaveBeenCalled()
    expect(createPublicClient).toHaveBeenCalled()
    expect(writeContractMock).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'pause' }))
    expect(waitForReceiptMock).toHaveBeenCalledWith({ hash: '0xhash' })
    expect(loggerInfoMock).toHaveBeenCalled()
  })

  it('executes resume on-chain when configuration is valid', async () => {
    writeContractMock.mockResolvedValueOnce('0xhash2')
    waitForReceiptMock.mockResolvedValueOnce({ status: 'success' })

    const result = await emergencyControllerClient.resume('0xaccount')

    expect(result).toMatchObject({ mode: 'executed', simulated: false, txHash: '0xhash2' })
    expect(writeContractMock).toHaveBeenCalledWith(expect.objectContaining({ functionName: 'resume' }))
    expect(waitForReceiptMock).toHaveBeenCalledWith({ hash: '0xhash2' })
  })

  it('возвращает режим skipped при ошибке RPC во время pause', async () => {
    writeContractMock.mockRejectedValueOnce(new Error('RPC unavailable'))

    const result = await emergencyControllerClient.pause('0xaccount')

    expect(result).toMatchObject({
      mode: 'skipped',
      simulated: true,
      reason: expect.stringContaining('RPC unavailable')
    })
    expect(waitForReceiptMock).not.toHaveBeenCalled()
  })
})
