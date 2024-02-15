import type { GameState } from './GameState'
import type { PlayerActionPayload } from './PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './genericApiUtils'

export async function callApiToAdvanceTimeBy1Turn(
  params: FetchCallbacks & { currentGameState?: GameState | undefined },
): Promise<GameState | undefined> {
  return callApplyPlayerActionApi({
    ...params,
    playerActionPayload: { Action: 'AdvanceTime' },
    currentGameState: params.currentGameState,
  })
}

async function callApplyPlayerActionApi(
  params: FetchCallbacks & {
    playerActionPayload: PlayerActionPayload
    currentGameState?: GameState | undefined
  },
): Promise<GameState | undefined> {
  const apiPath = 'applyPlayerAction'
  const apiQuery = ''
  const jsonBody: string = JSON.stringify(
    getApplyPlayerActionBody(
      params.playerActionPayload,
      params.currentGameState,
    ),
  )
  const apiUrl = getApiUrl(apiPath, apiQuery)
  const request = getPostJsonRequest(apiUrl, jsonBody)
  return callApi<GameState>({ ...params, request })
}

function getApplyPlayerActionBody(
  playerActionPayload: PlayerActionPayload,
  currentGameState?: GameState,
): { PlayerAction: PlayerActionPayload; GameState: GameState | undefined } {
  return { PlayerAction: playerActionPayload, GameState: currentGameState }
}
