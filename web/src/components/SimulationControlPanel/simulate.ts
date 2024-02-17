import _ from 'lodash'
import type { GameSession } from '../../lib/GameSession'
import { callAdvanceTurnsApi } from '../../lib/api/advanceTurnsApi'
import type { FetchCallbacks } from '../../lib/api/genericApiUtils'

type SimulateParams = {
  readonly gameSession: GameSession
  readonly startTurn: number
  readonly targetTurn: number
  readonly delegateToAi: boolean
} & FetchCallbacks

export async function simulate(params: SimulateParams): Promise<void> {
  params.setLoading(true)
  params.setError('')

  const newGameStates = await callAdvanceTurnsApi({ ...params })

  if (!_.isUndefined(newGameStates)) {
    params.gameSession.upsertGameStates(newGameStates, params.startTurn)
  }
}
