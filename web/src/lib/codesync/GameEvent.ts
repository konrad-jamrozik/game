// codesync: UfoGameLib.Events.GameEvent

import { getTurnNo, type GameSessionTurn } from './GameSessionTurn'
import type { PlayerActionName } from './PlayerActionPayload'
import type { WorldEventName } from './WorldEventName'

export type GameEvent = {
  readonly Id: number
  readonly Type: GameEventName
  readonly Ids?: number[] | undefined
  readonly TargetId?: number | undefined
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
    Ids: event.Ids,
    TargetId: event.TargetId,
  }
}

export type GameEventName = PlayerActionName | WorldEventName
