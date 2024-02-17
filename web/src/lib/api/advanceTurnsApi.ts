import _ from 'lodash'
import type { GameState } from '../GameState'
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
    delegateToAi?: boolean
  },
): Promise<GameState[] | undefined> {
  const { startGameState, targetTurn, delegateToAi } = params

  const apiUrl = getAdvanceTurnsApiUrl(targetTurn, delegateToAi ?? false)
  const request = getPostJsonRequest(
    apiUrl,
    !_.isUndefined(startGameState) ? JSON.stringify(startGameState) : '',
  )

  return callApi<GameState[]>({ ...params, request })
}

function getAdvanceTurnsApiUrl(targetTurn: number, delegateToAi: boolean): URL {
  return getApiUrl(
    `advanceTurns`,
    `includeAllStates=true&turnLimit=${targetTurn}${delegateToAi ? '&delegateToAi=true' : ''}`,
  )
}
