import type { GameState } from '../GameState'
import type { PlayerActionPayload } from '../PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './genericApiUtils'

// "AdvanceTime" => controller.AdvanceTime,
// "BuyTransportCap" => () => controller.TurnController.BuyTransportCapacity(1),
// "HireAgents" => () => controller.TurnController.HireAgents(1),
// "SackAgents" => () => controller.TurnController.SackAgents(Ids!),
// "SendAgentsToIncomeGeneration" => () => controller.TurnController.SendAgentsToGenerateIncome(Ids!),
// "SendAgentsToIntelGathering" => () => controller.TurnController.SendAgentsToGatherIntel(Ids!),
// "SendAgentsToTraining" => () => controller.TurnController.SendAgentsToTraining(Ids!),
// "RecallAgents" => () => controller.TurnController.RecallAgents(Ids!),
// "LaunchMission" => () => controller.TurnController.LaunchMission(TargetId!.Value, Ids!),
// _ => () => throw new InvalidOperationException($"Unsupported player action of '{Action}'")

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

// kja currently these payload providers have not strongly typed inputs.
// Instead, introduce a provider type for each action.
// Like:
//  export type sackAgents = (ids: number[]) => PlayerActionPayload
export const playerActions: {
  [key in PlayerActionName]: PlayerActionPayloadProvider
} = {
  buyTransportCap: () => ({ Action: 'BuyTransportCap' }),
  hireAgents: () => ({ Action: 'HireAgents' }),
  sackAgents: () => ({ Action: 'SackAgents' }),
  sendAgentsToIncomeGeneration: () => ({
    Action: 'SendAgentsToIncomeGeneration',
  }),
  sendAgentsToIntelGathering: () => ({ Action: 'SendAgentsToIntelGathering' }),
  sendAgentsToTraining: () => ({ Action: 'SendAgentsToTraining' }),
  recallAgents: () => ({ Action: 'RecallAgents' }),
  launchMission: () => ({ Action: 'LaunchMission' }),
}

export async function callApiToHireAgents(
  params: FetchCallbacks & { currentGameState: GameState | undefined },
): Promise<GameState | undefined> {
  return callApplyPlayerActionApi({
    ...params,
    playerActionPayload: playerActions.hireAgents({}),
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
