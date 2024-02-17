import _ from 'lodash'
import type { GameSession } from '../GameSession'
import type { GameState } from '../GameState'
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
    gameSession: GameSession
    startTurn: number
    targetTurn: number
  },
): Promise<GameState[] | undefined> {
  const jsonBody: string = !params.startNewSimulation
    ? JSON.stringify(params.gameSession.getStateAtTurn(params.startTurn))
    : ''
  const apiUrl = getSimulateApiUrl(params.targetTurn, params.startNewSimulation)
  const request = !params.startNewSimulation
    ? getPostJsonRequest(apiUrl, jsonBody)
    : getGetRequest(apiUrl)
  return callApi<GameState[]>({ ...params, request })
}

function getSimulateApiUrl(
  resolvedTargetTurn: number,
  startNewSimulation: boolean,
): URL {
  const useNewGameSessionApi = startNewSimulation

  const path = `simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}`
  const queryString = `includeAllStates=true&turnLimit=${resolvedTargetTurn}`
  return getApiUrl(path, queryString)
}
