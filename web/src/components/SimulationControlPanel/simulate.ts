import _ from 'lodash'
import { initialTurn, type GameState } from '../../lib/GameState'
import { getCurrentTurn } from '../../lib/GameStateUtils'
import { callSimulateGameSessionApi } from '../../lib/api/simulateGameSessionApi'

type SimulateParams = {
  readonly gameStates: readonly GameState[]
  readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>
  readonly startTurn: number
  readonly targetTurn: number
  readonly turnsToSimulate?: number | undefined
}

export async function simulate(
  params: SimulateParams,
): Promise<GameState[] | undefined> {
  params.setLoading(true)
  params.setError('')

  const { resolvedStartTurn, resolvedTargetTurn } = resolveStartAndTargetTurn(
    params.gameStates,
    params.startTurn,
    params.targetTurn,
    params.turnsToSimulate,
  )
  const startNewSimulation = resolvedStartTurn === initialTurn

  return callSimulateGameSessionApi({
    ...params,
    resolvedStartTurn,
    startNewSimulation,
    resolvedTargetTurn,
  })
}

function resolveStartAndTargetTurn(
  gameStates: readonly GameState[],
  startTurn: number,
  targetTurn: number,
  turnsToSimulate?: number,
): {
  resolvedStartTurn: number
  resolvedTargetTurn: number
} {
  const currentTurn = !_.isEmpty(gameStates)
    ? getCurrentTurn(gameStates)
    : undefined

  let resolvedStartTurn = initialTurn
  if (!_.isEmpty(gameStates)) {
    resolvedStartTurn = _.isUndefined(turnsToSimulate)
      ? _.min([currentTurn, startTurn])!
      : currentTurn!
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
