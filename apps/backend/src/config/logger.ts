/* eslint-disable @typescript-eslint/no-var-requires */
import pino, { type TransportSingleOptions } from 'pino'
import pinoHttp from 'pino-http'

const buildTransport = (): TransportSingleOptions | undefined => {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') return undefined

  try {
    require.resolve('pino-pretty')
    return { target: 'pino-pretty', options: { colorize: true } }
  } catch (error) {
    console.warn('[logger] pino-pretty не найден, используется JSON-логирование.', (error as Error).message)
    return undefined
  }
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: buildTransport()
})

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err != null || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  }
})
