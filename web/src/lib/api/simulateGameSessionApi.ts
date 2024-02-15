import _ from 'lodash'
import { initialTurn, type GameState } from '../GameState'
import { getCurrentTurn, getStateAtTurn } from '../GameStateUtils'
import {
  callApi,
  getPostJsonRequest,
  getGetRequest,
  type FetchCallbacks,
  getApiUrl,
} from './genericApiUtils'

export async function callSimulateGameSessionApi(
  params: FetchCallbacks & {
    startNewSimulation: boolean
    gameStates: readonly GameState[]
    resolvedStartTurn: number
    resolvedTargetTurn: number
  },
): Promise<readonly GameState[] | undefined> {
  const jsonBody: string = !params.startNewSimulation
    ? JSON.stringify(
        getStateAtTurn(params.gameStates, params.resolvedStartTurn),
      )
    : ''
  const apiUrl = getSimulateApiUrl(
    params.gameStates,
    params.resolvedTargetTurn,
    params.startNewSimulation,
  )
  const request = !params.startNewSimulation
    ? getPostJsonRequest(apiUrl, jsonBody)
    : getGetRequest(apiUrl)
  return callApi<GameState[]>({ ...params, request })
}

function getSimulateApiUrl(
  gameStates: readonly GameState[],
  resolvedTargetTurn: number,
  startNewSimulation: boolean,
): URL {
  const useNewGameSessionApi =
    startNewSimulation ||
    (!_.isEmpty(gameStates) && getCurrentTurn(gameStates) === initialTurn)

  const path = `simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}`
  const queryString = `includeAllStates=true&turnLimit=${resolvedTargetTurn}`
  return getApiUrl(path, queryString)
}
