import _ from 'lodash'
import type { GameSession } from '../../lib/GameSession'
import { callSimulateGameSessionApi } from '../../lib/api/simulateGameSessionApi'

type SimulateParams = {
  readonly gameSession: GameSession
  readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>
  readonly startTurn: number
  readonly targetTurn: number
}

export async function simulate(params: SimulateParams): Promise<void> {
  params.setLoading(true)
  params.setError('')

  const startNewSimulation = !params.gameSession.isGameSessionLoaded()

  const newGameStates = await callSimulateGameSessionApi({
    ...params,
    startNewSimulation,
  })

  if (!_.isUndefined(newGameStates)) {
    params.gameSession.upsertGameStates(newGameStates, params.startTurn)
  }
}
