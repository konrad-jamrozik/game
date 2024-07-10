// codesync: UfoGameLib.Events.GameEvent
// codesync: UfoGameLib.Events.PlayerActionEvent
// codesync: UfoGameLib.Events.WorldEvent

import _ from 'lodash'
import { getTurnNo, type GameSessionTurn } from './GameSessionTurn'
import { PlayerActionNameVal, type PlayerActionName } from './PlayerActionName'

export type GameEvent = PlayerActionEvent | WorldEvent

export type PlayerActionEvent = GameEventBase & {
  readonly Ids: number[] | undefined
  readonly TargetId: number | undefined
}

export type WorldEvent = GameEventBase & {
  readonly Ids: number[] | undefined
  readonly TargetId: number | undefined
}

export type GameEventBase = {
  readonly Id: number
  readonly Type: GameEventName
}

export type GameEventName = PlayerActionName | WorldEventName

export type WorldEventName = (typeof WorldEventNameVal)[number]

export const WorldEventNameVal = [
  'MissionSiteExpiredEvent',
  'ReportEvent',
] as const

export type GameEventWithTurn = GameEvent & {
  readonly Turn: number
}

export function isPlayerActionEvent(
  event: GameEvent,
): event is PlayerActionEvent {
  return _.includes(PlayerActionNameVal, event.Type)
}

export function isWorldEvent(event: GameEvent): event is WorldEvent {
  return _.includes(WorldEventNameVal, event.Type)
}

export function addTurnToGameEvent(
  event: GameEvent,
  turn: GameSessionTurn,
): GameEventWithTurn {
  return {
    Id: event.Id,
    Turn: getTurnNo(turn),
    Type: event.Type,
    Ids: 'Ids' in event ? event.Ids : undefined,
    TargetId: 'TargetId' in event ? event.TargetId : undefined,
  }
}
