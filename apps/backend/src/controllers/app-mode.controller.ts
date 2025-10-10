import type { Request, Response } from 'express'
import Joi from 'joi'
import type { ApplicationMode } from '@defitreasuryai/types'
import { appModeService } from '../services/app-mode/app-mode.service'

const modeSchema = Joi.object<{ mode: ApplicationMode, actor?: string, note?: string }>({
  mode: Joi.string().valid('real', 'preview').required(),
  actor: Joi.string().trim().max(120).optional(),
  note: Joi.string().trim().max(240).optional()
})

export const getAppModeHandler = (_req: Request, res: Response) => {
  res.json(appModeService.getState())
}

export const updateAppModeHandler = async (req: Request, res: Response) => {
  try {
    const payload = await modeSchema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    const state = appModeService.setMode(payload.mode, payload.actor, payload.note)
    res.status(200).json(state)
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      res.status(400).json({ message: 'Invalid application mode', details: error.details })
      return
    }
    console.error('[mode] Failed to update mode', error)
    res.status(500).json({ message: 'Failed to switch application mode' })
  }
}
