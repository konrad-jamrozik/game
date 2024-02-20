// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

export const playerActionsPayloadsProviders: {
  [actionName in PlayerActionName]: PayloadProviderMap[actionName]
} = {
  AdvanceTime: () => ({ Action: 'AdvanceTime' as PlayerActionName }),
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCap: () => ({ Action: 'BuyTransportCap' as PlayerActionName }),
  // Note: currently HireAgents always hires 1 agent. See PlayerActionPayload.cs in backend.
  HireAgents: () => ({ Action: 'HireAgents' as PlayerActionName }),
  SackAgents: (Ids: number[]) => ({
    Action: 'SackAgents' as PlayerActionName,
    Ids,
  }),
  SendAgentsToIncomeGeneration: (Ids: number[]) => ({
    Action: 'SendAgentsToIncomeGeneration' as PlayerActionName,
    Ids,
  }),
  SendAgentsToIntelGathering: (Ids: number[]) => ({
    Action: 'SendAgentsToIntelGathering' as PlayerActionName,
    Ids,
  }),
  SendAgentsToTraining: (Ids: number[]) => ({
    Action: 'SendAgentsToTraining' as PlayerActionName,
    Ids,
  }),
  RecallAgents: (Ids: number[]) => ({
    Action: 'RecallAgents' as PlayerActionName,
    Ids,
  }),
  LaunchMission: (Ids: number[], TargetId: number) => ({
    Action: 'LaunchMission' as PlayerActionName,
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
export type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

type PayloadProviderMap = {
  [key in PlayerActionName]:
    | PayloadFromIdsAndTargetId
    | PayloadFromIds
    | PayloadFromNothing
} & {
  AdvanceTime: PayloadFromNothing
  BuyTransportCap: PayloadFromNothing
  HireAgents: PayloadFromNothing
  SackAgents: PayloadFromIds
  SendAgentsToIncomeGeneration: PayloadFromIds
  SendAgentsToIntelGathering: PayloadFromIds
  SendAgentsToTraining: PayloadFromIds
  RecallAgents: PayloadFromIds
  LaunchMission: PayloadFromIdsAndTargetId
}
