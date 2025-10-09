import type { Request, Response } from 'express'
import Joi from 'joi'
import { demoService } from '../services/demo/demo.service'
import { DEMO_CORPORATE_ACCOUNT } from '../config/demo'

const accountSchema = Joi.string().lowercase().trim().pattern(/^0x[a-f0-9]{4,}$/).required()

const resolveAccountInput = (req: Request): string => {
  const param = req.params.account ?? req.query.account
  if (typeof param === 'string' && param.trim() !== '') {
    return param
  }
  return DEMO_CORPORATE_ACCOUNT
}

export const getDemoSummaryHandler = async (req: Request, res: Response) => {
  try {
    const rawAccount = resolveAccountInput(req)
    const account = await accountSchema.validateAsync(rawAccount, { abortEarly: false })
    const summary = await demoService.getSummary(account)
    res.json(summary)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Некорректный адрес аккаунта', details: error.details })
      return
    }
    console.error('[demo] Не удалось получить сводку демо-сценария', error)
    res.status(500).json({ message: 'Не удалось загрузить демо-сценарий' })
  }
}

export const runDemoScenarioHandler = async (_req: Request, res: Response) => {
  try {
    const result = await demoService.runScenario()
    res.status(200).json(result)
  } catch (error) {
    console.error('[demo] Ошибка запуска демо-сценария', error)
    res.status(500).json({ message: 'Не удалось выполнить демо-сценарий' })
  }
}
