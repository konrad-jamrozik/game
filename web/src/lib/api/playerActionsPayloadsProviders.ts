// The a bit more advanced typing done in this file was figured out with the help of ChatGPT:
// https://chat.openai.com/share/af4ac2cb-c221-4c7f-a5c6-e3cac23916c0
import _ from 'lodash'
import type { PlayerActionNameInTurn } from '../codesync/PlayerActionName'
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'

// CODESYNC: this must match the definition of PayloadProviderMap.
const actionNameToPayloadProviderFactoryMap: {
  [actionName in PlayerActionNameInTurn]: PayloadProviderFactory
} =
  // prettier-ignore
  {
  // Note: currently Cap always buys 1 capacity. See PlayerActionPayload.cs in backend.
  BuyTransportCapacityPlayerAction       : payloadFromTargetIdFactory,
  HireAgentsPlayerAction                 : payloadFromTargetIdFactory,
  InvestIntelPlayerAction                : payloadFromIdsAndTargetIdFactory,
  LaunchMissionPlayerAction              : payloadFromIdsAndTargetIdFactory,
  RecallAgentsPlayerAction               : payloadFromIdsFactory,
  SackAgentsPlayerAction                 : payloadFromIdsFactory,
  SendAgentsToGatherIntelPlayerAction    : payloadFromIdsFactory,
  SendAgentsToGenerateIncomePlayerAction : payloadFromIdsFactory,
  SendAgentsToTrainingPlayerAction       : payloadFromIdsFactory,
}

// CODESYNC: this must match the definition of actionNameToPayloadProviderFactoryMap.
//
// Note: this block DOES NOT PROVIDE any type-safety,
// as the actionNameToPayloadProviderMap const is manually asserted to be of this type.
// It provides better autocomplete on the client side.
//
// However, even if this block would provide types-safety, it would protect only against
// given payload provider for given action having too many parameters, but not not enough.
//
// For example, if this declares "HireAgentsPlayerAction" player action should produce payload
// only from "Target" parameter,, and the actual implementation would take both "Target" and also "IDs" parameters,
// then this would properly catch it.
//
// However, if this declares "LaunchMissionPlayerAction" player action
// should produce payload from "IDs" and "TargetId" parameters, and the actual implementation
// would take "IDs" parameter only, then this would not catch that.
type PayloadProviderMap =
  // prettier-ignore
  {
  BuyTransportCapacityPlayerAction       : PayloadFromTargetId
  HireAgentsPlayerAction                 : PayloadFromTargetId
  InvestIntelPlayerAction                : PayloadFromIdsAndTargetId
  LaunchMissionPlayerAction              : PayloadFromIdsAndTargetId
  RecallAgentsPlayerAction               : PayloadFromIds
  SackAgentsPlayerAction                 : PayloadFromIds
  SendAgentsToGatherIntelPlayerAction    : PayloadFromIds
  SendAgentsToGenerateIncomePlayerAction : PayloadFromIds
  SendAgentsToTrainingPlayerAction       : PayloadFromIds
}

export const actionNameToPayloadProviderMap: PayloadProviderMap = _.fromPairs(
  _.map(actionNameToPayloadProviderFactoryMap, (factory, actionName) => {
    const typedActionName = actionName as PlayerActionNameInTurn
    return [typedActionName, factory(typedActionName)]
  }),
) as PayloadProviderMap

type PayloadProviderFactory =
  | ((name: PlayerActionNameInTurn) => PayloadFromIds)
  | ((name: PlayerActionNameInTurn) => PayloadFromIdsAndTargetId)
  | ((name: PlayerActionNameInTurn) => PayloadFromTargetId)

type PayloadFromIds = (Ids: number[]) => PlayerActionPayload

type PayloadFromTargetId = (TargetId: number) => PlayerActionPayload

type PayloadFromIdsAndTargetId = (
  Ids: number[],
  TargetId: number,
) => PlayerActionPayload

function payloadFromIdsFactory(name: PlayerActionNameInTurn): PayloadFromIds {
  return (ids: number[]) => ({
    Name: name,
    Ids: ids,
  })
}

function payloadFromTargetIdFactory(
  name: PlayerActionNameInTurn,
): PayloadFromTargetId {
  return (targetId: number) => ({
    Name: name,
    TargetId: targetId,
  })
}

function payloadFromIdsAndTargetIdFactory(
  name: PlayerActionNameInTurn,
): PayloadFromIdsAndTargetId {
  return (ids: number[], targetId: number) => ({
    Name: name,
    Ids: ids,
    TargetId: targetId,
  })
}
