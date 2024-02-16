import _ from 'lodash'
import type { GameSession } from '../../lib/GameSession'
import { initialTurn, type GameState } from '../../lib/GameState'
import { callSimulateGameSessionApi } from '../../lib/api/simulateGameSessionApi'

type SimulateParams = {
  readonly gameSession: GameSession
  readonly gameStates: readonly GameState[]
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
    params.gameStates,
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

  // kja bug here when trying to simulate turn:
  // GameSession.ts:66 Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'Timeline')
  // at GameSession.getCurrentTurn (GameSession.ts:66:33)
  // at upsertNewGameStatesToExisting (simulate.ts:58:50)
  // at simulate (simulate.ts:44:10)
  // at async simulateTurns (SimulationControlPanel.tsx:49:31)
  return upsertNewGameStatesToExisting(params, resolvedStartTurn, newGameStates)
}

function upsertNewGameStatesToExisting(
  params: SimulateParams,
  resolvedStartTurn: number,
  newGameStates: readonly GameState[] | undefined,
): readonly GameState[] {
  if (_.isUndefined(newGameStates)) {
    return params.gameStates
  }

  const currentTurn = !_.isEmpty(params.gameStates)
    ? params.gameSession.getCurrentTurn()
    : resolvedStartTurn

  const existingGameStates = params.gameStates.slice(
    0,
    _.min([resolvedStartTurn, currentTurn]),
  )

  return [...existingGameStates, ...newGameStates]
}

function resolveStartAndTargetTurn(
  gameSession: GameSession,
  gameStates: readonly GameState[],
  startTurn: number,
  targetTurn: number,
  turnsToSimulate?: number,
): {
  resolvedStartTurn: number
  resolvedTargetTurn: number
} {
  const currentTurn = !_.isEmpty(gameStates)
    ? gameSession.getCurrentTurn()
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
