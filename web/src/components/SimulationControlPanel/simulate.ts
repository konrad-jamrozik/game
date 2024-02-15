import _ from 'lodash'
import { initialTurn, type GameState } from '../../lib/GameState'
import { getCurrentTurn, getStateAtTurn } from '../../lib/GameStateUtils'

type SimulateParams = {
  readonly gameStates: readonly GameState[]
  readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>
  readonly startTurn: number
  readonly targetTurn: number
  readonly turnsToSimulate?: number | undefined
}

// eslint-disable-next-line max-statements
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

  const apiUrl = getApiUrl(
    params.gameStates,
    resolvedTargetTurn,
    startNewSimulation,
  )
  const jsonBody: string = !startNewSimulation
    ? JSON.stringify(getStateAtTurn(params.gameStates, resolvedStartTurn))
    : ''

  try {
    console.log(`apiUrl: ${apiUrl}`)
    const response = startNewSimulation
      ? await fetch(apiUrl)
      : await fetch(apiUrl, {
          method: 'POST',
          body: jsonBody,
          headers: {
            'Content-Type': 'application/json',
          },
        })
    if (!response.ok) {
      const errorContents = await response.text()
      throw new Error(errorContents)
    }
    const allGameStates = (await response.json()) as GameState[]
    if (startNewSimulation) {
      return allGameStates
      // eslint-disable-next-line no-else-return
    } else {
      const gameStates = params.gameStates.slice(
        0,
        _.min([resolvedStartTurn, getCurrentTurn(params.gameStates)]),
      )
      return [...gameStates, ...allGameStates]
    }
  } catch (fetchError: unknown) {
    params.setError((fetchError as Error).message)
    console.error(fetchError)
    return undefined
  } finally {
    params.setLoading(false)
  }
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

function getApiUrl(
  gameStates: readonly GameState[],
  targetTurn: number,
  startNewSimulation: boolean,
): string {
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const useNewGameSessionApi =
    startNewSimulation ||
    (!_.isEmpty(gameStates) && getCurrentTurn(gameStates) === initialTurn)

  const queryString = `?includeAllStates=true&turnLimit=${targetTurn}`

  return `${apiHost}/simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}${queryString}`
}
