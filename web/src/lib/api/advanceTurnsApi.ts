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
    `includeAllTurns=true&turnLimit=${targetTurn}${delegateToAiQueryParam}`,
  )
}

// kja need to update to new backend. JSON returned on first advance turn:
//
// [
//   {
//     "EventsUntilStartState": [],
//     "StartState": {
//       "IsGameOver": false,
//       "IsGameLost": false,
//       "IsGameWon": false,
//       "NextAgentId": 0,
//       "NextMissionId": 0,
//       "NextMissionSiteId": 0,
//       "Timeline": {
//         "CurrentTurn": 1
//       },
//       "Assets": {
//         "Money": 500,
//         "Intel": 0,
//         "Funding": 20,
//         "Support": 30,
//         "CurrentTransportCapacity": 4,
//         "MaxTransportCapacity": 4,
//         "Agents": []
//       },
//       "MissionSites": [],
//       "Missions": [],
//       "TerminatedAgents": [],
//       "UpdateCount": 0
//     },
//     "EventsInTurn": [],
//     "EndState": {
//       "IsGameOver": false,
//       "IsGameLost": false,
//       "IsGameWon": false,
//       "NextAgentId": 0,
//       "NextMissionId": 0,
//       "NextMissionSiteId": 0,
//       "Timeline": {
//         "CurrentTurn": 1
//       },
//       "Assets": {
//         "Money": 500,
//         "Intel": 0,
//         "Funding": 20,
//         "Support": 30,
//         "CurrentTransportCapacity": 4,
//         "MaxTransportCapacity": 4,
//         "Agents": []
//       },
//       "MissionSites": [],
//       "Missions": [],
//       "TerminatedAgents": [],
//       "UpdateCount": 0
//     }
//   }
// ]
