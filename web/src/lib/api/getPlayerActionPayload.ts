/* eslint-disable no-else-return */
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'
import {
  type PayloadProvider,
  playerActionsPayloadsProviders,
  type PayloadFromNothing,
  type PayloadFromIds,
  type PayloadFromIdsAndTargetId,
} from './playerActionsPayloadsProviders'

// Note: this function, 'getPlayerActionPayload', is unused because it causes loss of type safety:
// it accepts arbitrary triple of [playerActionName, ids, targetId] and
// constructs appropriate player action payload based on the playerActionName,
// assuming the ids and targetId values are correct, without checking them at
// compile time.
//
// Instead of using this function, it's better to use the playerActionsPayloadsProviders.
// However, I am keeping this function here as implementation reference.
//
// See also: https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0

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
