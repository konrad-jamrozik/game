// codesync: UfoGameLib.Events.GameEvent

import { getTurnNo, type GameSessionTurn } from './GameSessionTurn'
import type { PlayerActionName } from './PlayerActionPayload'

export type GameEvent = {
  readonly Id: number
  readonly Type: GameEventName
  readonly Details: string
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
    Details: event.Details,
  }
}

export type GameEventName = PlayerActionName | WorldEventName

export type WorldEvent = GameEvent

export type WorldEventName = 'MissionSiteExpiredEvent'
