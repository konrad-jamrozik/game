import _ from 'lodash'
import type { GameSessionTurn } from '../codesync/GameSessionTurn'
import type { GameState } from '../codesync/GameState'
import {
  callApi,
  getPostJsonRequest,
  type FetchCallbacks,
  getApiUrl,
} from './genericApiUtils'

export async function callAdvanceTurnsApi(
  params: FetchCallbacks & {
    startGameState: GameState | undefined
    targetTurn: number
    delegateToAi?: boolean | undefined
  },
): Promise<GameSessionTurn[] | undefined> {
  const { startGameState, targetTurn, delegateToAi } = params

  const apiUrl = getAdvanceTurnsApiUrl(targetTurn, delegateToAi ?? false)
  const request = getPostJsonRequest(
    apiUrl,
    !_.isUndefined(startGameState) ? JSON.stringify(startGameState) : '',
  )

  return callApi<GameSessionTurn[]>({ ...params, request })
}

function getAdvanceTurnsApiUrl(
  targetTurn: number,
  delegateToAi?: boolean,
): URL {
  const delegateToAiQueryParam = !_.isUndefined(delegateToAi)
    ? `&delegateToAi=${delegateToAi}`
    : ''

  return getApiUrl(
    `advanceTurns`,
    `turnLimit=${targetTurn}${delegateToAiQueryParam}`,
  )
}
