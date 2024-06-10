// codesync: UfoGameLib.Events.GameEvent

import { getTurnNo, type GameSessionTurn } from './GameSessionTurn'
import type { PlayerActionEvent, PlayerActionName } from './PlayerActionEvent'
import type { WorldEvent, WorldEventName } from './WorldEvent'

export type GameEvent = PlayerActionEvent | WorldEvent

export type GameEventBase = {
  readonly Id: number
  readonly Type: GameEventName
}

export type GameEventWithTurn = GameEvent & {
  readonly Turn: number
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

export type GameEventName = PlayerActionName | WorldEventName
