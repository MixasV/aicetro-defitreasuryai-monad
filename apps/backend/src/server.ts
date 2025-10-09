import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { httpLogger } from './config/logger'
import { registerRoutes } from './routes'

export const createServer = () => {
  const app = express()

  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cors({ origin: '*', credentials: true }))
  app.use(helmet())
  app.use(httpLogger)
  app.use(morgan('combined'))

  registerRoutes(app)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
