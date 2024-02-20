// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
/* eslint-disable no-else-return */

import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

export function getPlayerActionPayload(
  playerActionName: Uncapitalize<PlayerActionName>,
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
  [actionName in Uncapitalize<PlayerActionName>]: PayloadProviderMap[actionName]
} = {
  advanceTime: () => ({ Action: 'AdvanceTime' as PlayerActionName }),
  buyTransportCap: () => ({ Action: 'BuyTransportCap' as PlayerActionName }),
  hireAgents: () => ({ Action: 'HireAgents' as PlayerActionName }),
  sackAgents: (Ids: number[]) => ({
    Action: 'SackAgents' as PlayerActionName,
    Ids,
  }),
  sendAgentsToIncomeGeneration: (Ids: number[]) => ({
    Action: 'SendAgentsToIncomeGeneration' as PlayerActionName,
    Ids,
  }),
  sendAgentsToIntelGathering: (Ids: number[]) => ({
    Action: 'SendAgentsToIntelGathering' as PlayerActionName,
    Ids,
  }),
  sendAgentsToTraining: (Ids: number[]) => ({
    Action: 'SendAgentsToTraining' as PlayerActionName,
    Ids,
  }),
  recallAgents: (Ids: number[]) => ({
    Action: 'RecallAgents' as PlayerActionName,
    Ids,
  }),
  launchMission: (Ids: number[], TargetId: number) => ({
    Action: 'LaunchMission' as PlayerActionName,
    Ids,
    TargetId,
  }),
}

type PayloadProviderMap = {
  [key in Uncapitalize<PlayerActionName>]:
    | PayloadFromIdsAndTargetId
    | PayloadFromIds
    | PayloadFromNothing
} & {
  advanceTime: PayloadFromNothing
  buyTransportCap: PayloadFromNothing
  hireAgents: PayloadFromNothing
  sackAgents: PayloadFromIds
  sendAgentsToIncomeGeneration: PayloadFromIds
  sendAgentsToIntelGathering: PayloadFromIds
  sendAgentsToTraining: PayloadFromIds
  recallAgents: PayloadFromIds
  launchMission: PayloadFromIdsAndTargetId
}
