import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './genericApiUtils'

export async function callApplyPlayerActionApi(
  params: FetchCallbacks & {
    currentGameTurn: GameSessionTurn
    playerActionPayload: PlayerActionPayload
  },
): Promise<GameSessionTurn | undefined> {
  const apiPath = 'applyPlayerAction'
  const apiQuery = ''
  const jsonBody: string = JSON.stringify(
    getApplyPlayerActionBody(
      params.playerActionPayload,
      params.currentGameTurn,
    ),
  )
  const apiUrl = getApiUrl(apiPath, apiQuery)
  const request = getPostJsonRequest(apiUrl, jsonBody)
  return callApi<GameSessionTurn>({ ...params, request })
}

function getApplyPlayerActionBody(
  playerActionPayload: PlayerActionPayload,
  currentGameTurn: GameSessionTurn,
): { PlayerAction: PlayerActionPayload; GameSessionTurn: GameSessionTurn } {
  return { PlayerAction: playerActionPayload, GameSessionTurn: currentGameTurn }
}
