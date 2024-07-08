import _ from 'lodash'
import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import type { AIPlayerName } from '../codesync/aiPlayer'
import {
  callApi,
  getPostJsonRequest,
  type FetchCallbacks,
  getApiUrl,
} from './genericApiUtils'

export async function callAdvanceTurnsApi(
  params: FetchCallbacks & {
    startGameTurn: GameSessionTurn | undefined
    targetTurn: number
    aiPlayer?: AIPlayerName | undefined
  },
): Promise<GameSessionTurn[] | undefined> {
  const { startGameTurn, targetTurn, aiPlayer } = params

  const apiUrl = getAdvanceTurnsApiUrl(targetTurn, aiPlayer)
  const request = getPostJsonRequest(
    apiUrl,
    !_.isUndefined(startGameTurn) ? JSON.stringify(startGameTurn) : '',
  )

  return callApi<GameSessionTurn[]>({ ...params, request })
}

function getAdvanceTurnsApiUrl(
  targetTurn: number,
  aiPlayer?: AIPlayerName | undefined,
): URL {
  const aiPlayerQueryParam = !_.isUndefined(aiPlayer)
    ? `&aiPlayer=${aiPlayer}`
    : ''

  return getApiUrl(
    `advanceTurns`,
    `turnLimit=${targetTurn}${aiPlayerQueryParam}`,
  )
}
