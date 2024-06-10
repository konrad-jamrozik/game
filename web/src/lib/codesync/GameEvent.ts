// codesync: UfoGameLib.Events.GameEvent

import type { GameSessionTurn } from './GameSessionTurn'

export type GameEvent = {
  readonly Id: number
  readonly Type: string
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
    Turn: turn.StartState.Timeline.CurrentTurn,
    Type: event.Type,
    Details: event.Details,
  }
}
