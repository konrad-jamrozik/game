// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

export const playerActionsPayloadsProviders: {
  [actionName in PlayerActionName]: PayloadProviderMap[actionName]
} = {
  AdvanceTime: () => ({ ActionName: 'AdvanceTime' as PlayerActionName }),
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCap: () => ({
    ActionName: 'BuyTransportCap' as PlayerActionName,
  }),
  // Note: currently HireAgents always hires 1 agent. See PlayerActionPayload.cs in backend.
  HireAgents: (TargetId: number) => ({
    ActionName: 'HireAgents' as PlayerActionName,
    TargetId,
  }),
  SackAgents: (Ids: number[]) => ({
    ActionName: 'SackAgents' as PlayerActionName,
    Ids,
  }),
  SendAgentsToIncomeGeneration: (Ids: number[]) => ({
    ActionName: 'SendAgentsToIncomeGeneration' as PlayerActionName,
    Ids,
  }),
  SendAgentsToIntelGathering: (Ids: number[]) => ({
    ActionName: 'SendAgentsToIntelGathering' as PlayerActionName,
    Ids,
  }),
  SendAgentsToTraining: (Ids: number[]) => ({
    ActionName: 'SendAgentsToTraining' as PlayerActionName,
    Ids,
  }),
  RecallAgents: (Ids: number[]) => ({
    ActionName: 'RecallAgents' as PlayerActionName,
    Ids,
  }),
  LaunchMission: (Ids: number[], TargetId: number) => ({
    ActionName: 'LaunchMission' as PlayerActionName,
    Ids,
    TargetId,
  }),
}

export type PayloadProvider =
  | PayloadFromNothing
  | PayloadFromIds
  | PayloadFromIdsAndTargetId

export type PayloadFromNothing = () => PlayerActionPayload
export type PayloadFromIds = (Ids: number[]) => PlayerActionPayload
export type PayloadFromTargetId = (TargetId: number) => PlayerActionPayload
export type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

type PayloadProviderMap = {
  [key in PlayerActionName]:
    | PayloadFromIdsAndTargetId
    | PayloadFromTargetId
    | PayloadFromIds
    | PayloadFromNothing
} & {
  // Note: this block provides type-safety only against a payload provider for given action
  // having too many parameters, but not not enough.
  // For example, if this declares "AdvanceTime" player action should produce payload
  // from no parameters, and the actual implementation would take some parameters,
  // then this would properly catch it.
  // However, if this declares "RecallAgents" should produce payload from "IDs" parameter,
  // and the actual implementation would take no parameters, then this would not catch that.
  AdvanceTime: PayloadFromNothing
  BuyTransportCap: PayloadFromNothing
  HireAgents: PayloadFromTargetId
  SackAgents: PayloadFromIds
  SendAgentsToIncomeGeneration: PayloadFromIds
  SendAgentsToIntelGathering: PayloadFromIds
  SendAgentsToTraining: PayloadFromIds
  RecallAgents: PayloadFromIds
  LaunchMission: PayloadFromIdsAndTargetId
}
