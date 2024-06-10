// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import type { PlayerActionNameInTurn } from '../codesync/PlayerActionEvent'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'

export const playerActionsPayloadsProviders: {
  [actionName in PlayerActionNameInTurn]: PayloadProviderMap[actionName]
} = {
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCapacityPlayerAction: (TargetId: number) => ({
    ActionName: 'BuyTransportCapacityPlayerAction' as PlayerActionNameInTurn,
    TargetId,
  }),
  // Note: currently HireAgents always hires 1 agent. See PlayerActionPayload.cs in backend.
  HireAgentsPlayerAction: (TargetId: number) => ({
    ActionName: 'HireAgentsPlayerAction' as PlayerActionNameInTurn,
    TargetId,
  }),
  SackAgentsPlayerAction: (Ids: number[]) => ({
    ActionName: 'SackAgentsPlayerAction' as PlayerActionNameInTurn,
    Ids,
  }),
  SendAgentsToGenerateIncomePlayerAction: (Ids: number[]) => ({
    ActionName:
      'SendAgentsToGenerateIncomePlayerAction' as PlayerActionNameInTurn,
    Ids,
  }),
  SendAgentsToGatherIntelPlayerAction: (Ids: number[]) => ({
    ActionName: 'SendAgentsToGatherIntelPlayerAction' as PlayerActionNameInTurn,
    Ids,
  }),
  SendAgentsToTrainingPlayerAction: (Ids: number[]) => ({
    ActionName: 'SendAgentsToTrainingPlayerAction' as PlayerActionNameInTurn,
    Ids,
  }),
  RecallAgentsPlayerAction: (Ids: number[]) => ({
    ActionName: 'RecallAgentsPlayerAction' as PlayerActionNameInTurn,
    Ids,
  }),
  LaunchMissionPlayerAction: (Ids: number[], TargetId: number) => ({
    ActionName: 'LaunchMissionPlayerAction' as PlayerActionNameInTurn,
    Ids,
    TargetId,
  }),
}

export type PayloadProvider =
  | PayloadFromIds
  | PayloadFromTargetId
  | PayloadFromIdsAndTargetId

export type PayloadFromIds = (Ids: number[]) => PlayerActionPayload
export type PayloadFromTargetId = (TargetId: number) => PlayerActionPayload
export type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

type PayloadProviderMap = {
  [key in PlayerActionNameInTurn]: PayloadProvider
} & {
  // Note: this block provides type-safety only against a payload provider for given action
  // having too many parameters, but not not enough.
  // For example, if this declares "AdvanceTime" player action should produce payload
  // from no parameters, and the actual implementation would take some parameters,
  // then this would properly catch it.
  // However, if this declares "RecallAgents" should produce payload from "IDs" parameter,
  // and the actual implementation would take no parameters, then this would not catch that.
  BuyTransportCapacityPlayerAction: PayloadFromTargetId
  HireAgentsPlayerAction: PayloadFromTargetId
  SackAgentsPlayerAction: PayloadFromIds
  SendAgentsToGenerateIncomePlayerAction: PayloadFromIds
  SendAgentsToGatherIntelPlayerAction: PayloadFromIds
  SendAgentsToTrainingPlayerAction: PayloadFromIds
  RecallAgentsPlayerAction: PayloadFromIds
  LaunchMissionPlayerAction: PayloadFromIdsAndTargetId
}
