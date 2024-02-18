import type { GameState } from '../GameState'
import type { PlayerActionPayload } from '../PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './genericApiUtils'

export type PlayerActionName =
  | 'buyTransportCap'
  | 'hireAgents'
  | 'sackAgents'
  | 'sendAgentsToIncomeGeneration'
  | 'sendAgentsToIntelGathering'
  | 'sendAgentsToTraining'
  | 'recallAgents'
  | 'launchMission'

export type PlayerActionPayloadProviderParams = {
  ids?: number[] | undefined
  targetId?: number | undefined
}

export type PlayerActionPayloadProvider = (
  params: PlayerActionPayloadProviderParams,
) => PlayerActionPayload

// kja 2 playerActionPayloadProviders currently look over-engineered.
// Instead of calling this like that:
//
//   playerActionPayload: playerActionPayloadProviders[
//     params.playerActionName
//   ]({
//     ids: params.ids,
//     targetId: params.targetId,
//   }),
//
// One could instead do:
//
//   playerActionPayload: getPlayerActionPayload(params.playerActionName)
//
// But I am hoping to add stronger typing for each provider signature, like:
//
//  export type sackAgents = (ids: number[]) => PlayerActionPayload
//
// instead of just
///
//   (ids: number[] | undefined, targetId?: number | undefined) => PlayerActionPayload
export const playerActionsPayloadsProviders: {
  [key in PlayerActionName]: PlayerActionPayloadProvider
} = {
  buyTransportCap: () => ({ Action: 'BuyTransportCap' }),
  hireAgents: () => ({ Action: 'HireAgents' }),
  sackAgents: (params) => ({ Action: 'SackAgents', Ids: params.ids! }),
  sendAgentsToIncomeGeneration: () => ({
    Action: 'SendAgentsToIncomeGeneration',
  }),
  sendAgentsToIntelGathering: (params) => ({
    Action: 'SendAgentsToIntelGathering',
    Ids: params.ids!,
  }),
  sendAgentsToTraining: (params) => ({
    Action: 'SendAgentsToTraining',
    Ids: params.ids!,
  }),
  recallAgents: (params) => ({ Action: 'RecallAgents', Ids: params.ids! }),
  launchMission: (params) => ({
    Action: 'LaunchMission',
    Ids: params.ids!,
    TargetId: params.targetId!,
  }),
}

export async function callApiToHireAgents(
  params: FetchCallbacks & { currentGameState: GameState | undefined },
): Promise<GameState | undefined> {
  return callApplyPlayerActionApi({
    ...params,
    playerActionPayload: playerActionsPayloadsProviders.hireAgents({}),
  })
}

export async function callApplyPlayerActionApi(
  params: FetchCallbacks & {
    currentGameState: GameState | undefined
    playerActionPayload: PlayerActionPayload
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
