import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import type { GameState } from '../codesync/GameState'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './genericApiUtils'

export async function callApplyPlayerActionApi(
  params: FetchCallbacks & {
    currentGameState: GameState | undefined
    playerActionPayload: PlayerActionPayload
  },
): Promise<GameSessionTurn | undefined> {
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
  return callApi<GameSessionTurn>({ ...params, request })
}

function getApplyPlayerActionBody(
  playerActionPayload: PlayerActionPayload,
  currentGameState?: GameState,
): { PlayerAction: PlayerActionPayload; GameState: GameState | undefined } {
  return { PlayerAction: playerActionPayload, GameState: currentGameState }
}
