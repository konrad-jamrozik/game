import _ from 'lodash'
import type { GameSession } from '../../lib/GameSession'
import { initialTurn, type GameState } from '../../lib/GameState'
import { callSimulateGameSessionApi } from '../../lib/api/simulateGameSessionApi'

type SimulateParams = {
  readonly gameSession: GameSession
  readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>
  readonly startTurn: number
  readonly targetTurn: number
  readonly turnsToSimulate?: number | undefined
}

export async function simulate(
  params: SimulateParams,
): Promise<readonly GameState[]> {
  params.setLoading(true)
  params.setError('')

  const { resolvedStartTurn, resolvedTargetTurn } = resolveStartAndTargetTurn(
    params.gameSession,
    params.startTurn,
    params.targetTurn,
    params.turnsToSimulate,
  )
  const startNewSimulation = resolvedStartTurn === initialTurn

  const newGameStates = await callSimulateGameSessionApi({
    ...params,
    resolvedStartTurn,
    startNewSimulation,
    resolvedTargetTurn,
  })

  return upsertNewGameStatesToExisting(params, resolvedStartTurn, newGameStates)
}

function upsertNewGameStatesToExisting(
  params: SimulateParams,
  resolvedStartTurn: number,
  newGameStates: readonly GameState[] | undefined,
): readonly GameState[] {
  if (_.isUndefined(newGameStates)) {
    return params.gameSession.getGameStates()
  }

  const currentTurn = params.gameSession.getCurrentTurnUnsafe()

  const valuesToMin = [
    resolvedStartTurn,
    ...(!_.isUndefined(currentTurn) ? [currentTurn] : []),
  ]

  const existingGameStates = params.gameSession
    .getGameStates()
    .slice(0, _.min(valuesToMin))

  return [...existingGameStates, ...newGameStates]
}

function resolveStartAndTargetTurn(
  gameSession: GameSession,
  startTurn: number,
  targetTurn: number,
  turnsToSimulate?: number,
): {
  resolvedStartTurn: number
  resolvedTargetTurn: number
} {
  const currentTurn = gameSession.getCurrentTurnUnsafe()

  let resolvedStartTurn = initialTurn
  if (!_.isUndefined(currentTurn)) {
    resolvedStartTurn = _.isUndefined(turnsToSimulate)
      ? // if turnsToSimulate is not defined, we simulate from the startTurn,
        // but if startTurn is after the currentTurn, then we must simulate from currentTurn,
        // otherwise there would be gap in simulated turns
        _.min([currentTurn, startTurn])!
      : // if turnsToSimulate is defined, we simulate the turnsToSimulate from currentTurn
        currentTurn
  }

  let resolvedTargetTurn = initialTurn
  if (_.isUndefined(turnsToSimulate)) {
    resolvedTargetTurn = targetTurn
  } else {
    resolvedTargetTurn = !_.isUndefined(currentTurn)
      ? currentTurn + turnsToSimulate
      : initialTurn - 1 + turnsToSimulate
  }
  return { resolvedStartTurn, resolvedTargetTurn }
}
