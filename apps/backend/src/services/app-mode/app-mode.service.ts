import type { ApplicationMode, ApplicationModeState } from '@defitreasuryai/types'

class AppModeService {
  private state: ApplicationModeState = {
    mode: 'real',
    updatedAt: new Date().toISOString()
  }

  getState (): ApplicationModeState {
    return this.state
  }

  setMode (mode: ApplicationMode, actor?: string, note?: string): ApplicationModeState {
    this.state = {
      mode,
      updatedAt: new Date().toISOString(),
      lastActor: actor,
      note
    }
    return this.state
  }
}

export const appModeService = new AppModeService()
