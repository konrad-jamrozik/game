import _ from 'lodash'
import type { GameSessionTurn } from '../codesync/GameSessionTurn'
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
    delegateToAi?: boolean | undefined
  },
): Promise<GameSessionTurn[] | undefined> {
  const { startGameTurn: startTurn, targetTurn, delegateToAi } = params

  const apiUrl = getAdvanceTurnsApiUrl(targetTurn, delegateToAi ?? false)
  const request = getPostJsonRequest(
    apiUrl,
    !_.isUndefined(startTurn) ? JSON.stringify(startTurn) : '',
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
