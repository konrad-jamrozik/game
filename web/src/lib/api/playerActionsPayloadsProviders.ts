// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

export const playerActionsPayloadsProviders: {
  [actionName in PlayerActionName]: PayloadProviderMap[actionName]
} = {
  AdvanceTimePlayerAction: () => ({
    ActionName: 'AdvanceTimePlayerAction' as PlayerActionName,
  }),
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCapacityPlayerAction: () => ({
    ActionName: 'BuyTransportCapacityPlayerAction' as PlayerActionName,
  }),
  // Note: currently HireAgents always hires 1 agent. See PlayerActionPayload.cs in backend.
  HireAgentsPlayerAction: (TargetId: number) => ({
    ActionName: 'HireAgentsPlayerAction' as PlayerActionName,
    TargetId,
  }),
  SackAgentsPlayerAction: (Ids: number[]) => ({
    ActionName: 'SackAgentsPlayerAction' as PlayerActionName,
    Ids,
  }),
  SendAgentsToGenerateIncomePlayerAction: (Ids: number[]) => ({
    ActionName: 'SendAgentsToGenerateIncomePlayerAction' as PlayerActionName,
    Ids,
  }),
  SendAgentsToGatherIntelPlayerAction: (Ids: number[]) => ({
    ActionName: 'SendAgentsToGatherIntelPlayerAction' as PlayerActionName,
    Ids,
  }),
  SendAgentsToTrainingPlayerAction: (Ids: number[]) => ({
    ActionName: 'SendAgentsToTrainingPlayerAction' as PlayerActionName,
    Ids,
  }),
  RecallAgentsPlayerAction: (Ids: number[]) => ({
    ActionName: 'RecallAgentsPlayerAction' as PlayerActionName,
    Ids,
  }),
  LaunchMissionPlayerAction: (Ids: number[], TargetId: number) => ({
    ActionName: 'LaunchMissionPlayerAction' as PlayerActionName,
    Ids,
    TargetId,
  }),
}

export type PayloadProvider =
  | PayloadFromNothing
  | PayloadFromIds
  | PayloadFromTargetId
  | PayloadFromIdsAndTargetId

export type PayloadFromNothing = () => PlayerActionPayload
export type PayloadFromIds = (Ids: number[]) => PlayerActionPayload
export type PayloadFromTargetId = (TargetId: number) => PlayerActionPayload
export type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

type PayloadProviderMap = {
  [key in PlayerActionName]: PayloadProvider
} & {
  // Note: this block provides type-safety only against a payload provider for given action
  // having too many parameters, but not not enough.
  // For example, if this declares "AdvanceTime" player action should produce payload
  // from no parameters, and the actual implementation would take some parameters,
  // then this would properly catch it.
  // However, if this declares "RecallAgents" should produce payload from "IDs" parameter,
  // and the actual implementation would take no parameters, then this would not catch that.
  AdvanceTimePlayerAction: PayloadFromNothing
  BuyTransportCapacityPlayerAction: PayloadFromNothing
  HireAgentsPlayerAction: PayloadFromTargetId
  SackAgentsPlayerAction: PayloadFromIds
  SendAgentsToGenerateIncomePlayerAction: PayloadFromIds
  SendAgentsToGatherIntelPlayerAction: PayloadFromIds
  SendAgentsToTrainingPlayerAction: PayloadFromIds
  RecallAgentsPlayerAction: PayloadFromIds
  LaunchMissionPlayerAction: PayloadFromIdsAndTargetId
}
