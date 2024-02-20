// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
/* eslint-disable no-else-return */

import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

// kja 2 Note: currently getPlayerActionPayload causes loss of type safety:
// it accepts arbitrary triple of [playerActionName, ids, targetId] and
// constructs appropriate player action payload based on the playerActionName,
// assuming the ids and targetId values are correct, without checking them at
// compile time.
export function getPlayerActionPayload(
  playerActionName: PlayerActionName,
  ids: number[] | undefined,
  targetId: number | undefined,
): PlayerActionPayload {
  const payloadProvider: PayloadProvider =
    playerActionsPayloadsProviders[playerActionName]

  if (isPayloadFromNothing(payloadProvider)) {
    return payloadProvider()
  } else if (isPayloadFromIds(payloadProvider)) {
    return payloadProvider(ids!)
  } else if (isPayloadFromIdsAndTargetId(payloadProvider)) {
    return payloadProvider(ids!, targetId!)
  } else {
    throw new Error(
      `Unknown payload provider for playerActionName: ${playerActionName}`,
    )
  }
}

function isPayloadFromNothing(
  provider: PayloadProvider,
): provider is PayloadFromNothing {
  return provider.length === 0
}

function isPayloadFromIds(
  provider: PayloadProvider,
): provider is PayloadFromIds {
  return provider.length === 1
}

function isPayloadFromIdsAndTargetId(
  provider: PayloadProvider,
): provider is PayloadFromIdsAndTargetId {
  return provider.length === 2
}

type PayloadProvider =
  | PayloadFromNothing
  | PayloadFromIds
  | PayloadFromIdsAndTargetId

type PayloadFromNothing = () => PlayerActionPayload
type PayloadFromIds = (Ids: number[]) => PlayerActionPayload
type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

const playerActionsPayloadsProviders: {
  [actionName in PlayerActionName]: PayloadProviderMap[actionName]
} = {
  AdvanceTime: () => ({ Action: 'AdvanceTime' as PlayerActionName }),
  BuyTransportCap: () => ({ Action: 'BuyTransportCap' as PlayerActionName }),
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
