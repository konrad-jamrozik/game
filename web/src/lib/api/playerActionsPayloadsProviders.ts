// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import type { PlayerActionNameInTurn } from '../codesync/PlayerActionName'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'

export const playerActionsPayloadsProviders: {
  [actionName in PlayerActionNameInTurn]: PayloadProviderMap[actionName]
} = {
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCapacityPlayerAction: (TargetId: number) => ({
    Name: 'BuyTransportCapacityPlayerAction' as const,
    TargetId,
  }),
  HireAgentsPlayerAction: (TargetId: number) => ({
    Name: 'HireAgentsPlayerAction' as const,
    TargetId,
  }),
  SackAgentsPlayerAction: (Ids: number[]) => ({
    Name: 'SackAgentsPlayerAction' as const,
    Ids,
  }),
  SendAgentsToGenerateIncomePlayerAction: (Ids: number[]) => ({
    Name: 'SendAgentsToGenerateIncomePlayerAction' as const,
    Ids,
  }),
  SendAgentsToGatherIntelPlayerAction: (Ids: number[]) => ({
    Name: 'SendAgentsToGatherIntelPlayerAction' as const,
    Ids,
  }),
  SendAgentsToTrainingPlayerAction: (Ids: number[]) => ({
    Name: 'SendAgentsToTrainingPlayerAction' as const,
    Ids,
  }),
  RecallAgentsPlayerAction: (Ids: number[]) => ({
    Name: 'RecallAgentsPlayerAction' as const,
    Ids,
  }),
  LaunchMissionPlayerAction: (Ids: number[], TargetId: number) => ({
    Name: 'LaunchMissionPlayerAction' as const,
    Ids,
    TargetId,
  }),
  InvestIntelPlayerAction: (Ids: number[], TargetId: number) => ({
    Name: 'InvestIntelPlayerAction' as const,
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
  InvestIntelPlayerAction: PayloadFromIdsAndTargetId
  LaunchMissionPlayerAction: PayloadFromIdsAndTargetId
  RecallAgentsPlayerAction: PayloadFromIds
  SackAgentsPlayerAction: PayloadFromIds
  SendAgentsToGatherIntelPlayerAction: PayloadFromIds
  SendAgentsToGenerateIncomePlayerAction: PayloadFromIds
  SendAgentsToTrainingPlayerAction: PayloadFromIds
}

// kja searching e.g. for 'SendAgentsToGatherIntelPlayerAction:' shows it usage in following maps:
// - playerActionsPayloadsProviders, to determine how to call the backend for this action
// - agentPlayerActionConditionMap, to determine when this action can be performed on given agent
// - batchAgentPlayerActionOptionLabel, to show label in player actions dropdown
// - gameEventDisplayMap, to determine how to display corresponding event in event log
//   - this has both the displayed type, and templated details
//
// I feel it would be better to consolidate all of these maps into one, by introducing a class
// representing this player action. This class would have methods like:
// - getBackendPayloadProvider(),
// - getCanBeAppliedToAgent(agent),
// - getLabel(),
// - getEventDisplay()
//
// The underlying maps may still be useful, and the method implementations may call into those maps.
//
// But instead of doing this:
//   const payloadProvider = playerActionsPayloadsProviders[playerActionName]
// I would do this:
//  playerAction.getBackendPayloadProvider()
//
// Instead of doing this:
//   action: BatchAgentPlayerActionOption,
//   return agentPlayerActionConditionMap[action](rowAgent)
// I would do this:
//   playerAction.getCanBeAppliedToAgent(rowAgent)
//
// I would sometimes need to retrieve the player action class based on its name,
// so I would likely have a map from player action names to player action classes.
