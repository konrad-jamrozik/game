// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
/* eslint-disable no-else-return */

import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'

type PlayerActionPayloadProvider2 = {
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

export type PayloadFromNothing = () => PlayerActionPayload
export type PayloadFromIds = (Ids: number[]) => PlayerActionPayload
export type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

export type PayloadFrom =
  | PayloadFromNothing
  | PayloadFromIds
  | PayloadFromIdsAndTargetId

export const playerActionsPayloadsProviders2: {
  [key in Uncapitalize<PlayerActionName>]: PlayerActionPayloadProvider2[key]
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

export function getPlayerActionPayload(
  playerActionName: Uncapitalize<PlayerActionName>,
  ids: number[] | undefined,
  targetId: number | undefined,
): PlayerActionPayload {
  const provider: PayloadFrom =
    playerActionsPayloadsProviders2[playerActionName]

  if (isPayloadFromNothing(provider)) {
    return provider()
  } else if (isPayloadFromIds(provider)) {
    return provider(ids!)
  } else if (isPayloadFromIdsAndTargetId(provider)) {
    return provider(ids!, targetId!)
  } else {
    throw new Error(
      `Unknown payload provider for playerActionName: ${playerActionName}`,
    )
  }
}
function isPayloadFromNothing(
  provider: PayloadFrom,
): provider is PayloadFromNothing {
  return provider.length === 0
}
function isPayloadFromIds(provider: PayloadFrom): provider is PayloadFromIds {
  return provider.length === 1
}
function isPayloadFromIdsAndTargetId(
  provider: PayloadFrom,
): provider is PayloadFromIdsAndTargetId {
  return provider.length === 2
}
