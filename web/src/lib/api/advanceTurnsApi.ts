import _ from 'lodash'
import type { GameSession } from '../GameSession'
import type { GameState } from '../GameState'
import {
  callApi,
  getPostJsonRequest,
  type FetchCallbacks,
  getApiUrl,
} from './genericApiUtils'

export async function callAdvanceTurnsApi(
  params: FetchCallbacks & {
    gameSession: GameSession
    startTurn: number
    targetTurn: number
    delegateToAi?: boolean
  },
): Promise<GameState[] | undefined> {
  const { gameSession, startTurn, targetTurn, delegateToAi } = params

  const startNewGameSession = !gameSession.isGameSessionLoaded()
  const apiUrl = getAdvanceTurnsApiUrl(targetTurn, delegateToAi ?? false)
  const request = getPostJsonRequest(
    apiUrl,
    !startNewGameSession ? getPostJsonBody(gameSession, startTurn) : '',
  )

  return callApi<GameState[]>({ ...params, request })
}

function getAdvanceTurnsApiUrl(targetTurn: number, delegateToAi: boolean): URL {
  return getApiUrl(
    `advanceTurns`,
    `includeAllStates=true&turnLimit=${targetTurn}${delegateToAi ? '&delegateToAi=true' : ''}`,
  )
}

function getPostJsonBody(gameSession: GameSession, startTurn: number): string {
  // kja getStateAtTurn() will require more precision: at the start of the turn, or end of the turn?
  return JSON.stringify(gameSession.getStateAtTurn(startTurn))
}
