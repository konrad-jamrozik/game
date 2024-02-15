/* eslint-disable no-warning-comments */
/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash'
import { initialTurn, type GameState } from '../GameState'
import { getCurrentTurn, getStateAtTurn } from '../GameStateUtils'
import type { PlayerActionPayload } from '../PlayerActionPayload'
import {
  callApi,
  getPostJsonRequest,
  getGetRequest,
  type FetchCallbacks,
} from './genericApiUtils'

// kja adapt to the simulateGameSession
// export async function callApiToAdvanceTimeBy1Turn(
//   params: FetchCallbacks & { currentGameState?: GameState | undefined },
// ): Promise<GameState | undefined> {
//   return callApplyPlayerActionApi({
//     ...params,
//     playerActionPayload: { Action: 'AdvanceTime' },
//     currentGameState: params.currentGameState,
//   })
// }

async function callSimulateGameSessionApi(
  params: FetchCallbacks & {
    playerActionPayload: PlayerActionPayload
    currentGameState?: GameState | undefined
    startNewSimulation: boolean
    gameStates: GameState[]
    resolvedStartTurn: number
    targetTurn: number
  },
): Promise<GameState | undefined> {
  // TODO use apiPath and apiQuery instead of logic within getSimulateApiUrl
  // const apiPath = 'applyPlayerAction'
  // const apiQuery = ''
  const jsonBody: string = !params.startNewSimulation
    ? JSON.stringify(
        getStateAtTurn(params.gameStates, params.resolvedStartTurn),
      )
    : ''
  const apiUrl = getSimulateApiUrl(
    params.gameStates,
    params.targetTurn,
    params.startNewSimulation,
  )
  const request = !params.startNewSimulation
    ? getPostJsonRequest(apiUrl, jsonBody)
    : getGetRequest(apiUrl)
  return callApi<GameState>({ ...params, request })
}

function getSimulateApiUrl(
  gameStates: readonly GameState[],
  targetTurn: number,
  startNewSimulation: boolean,
): URL {
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const useNewGameSessionApi =
    startNewSimulation ||
    (!_.isEmpty(gameStates) && getCurrentTurn(gameStates) === initialTurn)

  const queryString = `?includeAllStates=true&turnLimit=${targetTurn}`

  return new URL(
    `${apiHost}/simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}${queryString}`,
  )
}
