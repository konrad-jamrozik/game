// codesync: UfoGameLib.State.GameSessionTurn
import _ from 'lodash'
import type { GameEvent } from './GameEvent'
import type { GameState } from './GameState'

export type GameSessionTurn = {
  readonly EventsUntilStartState: GameEvent[]
  readonly StartState: GameState
  readonly EventsInTurn: GameEvent[]
  readonly EndState: GameState
  readonly AdvanceTimeEvent?: GameEvent | undefined
  readonly NextEventId?: number | undefined
}

export function getEvents(turn: GameSessionTurn): GameEvent[] {
  return [
    ...turn.EventsUntilStartState,
    ...turn.EventsInTurn,
    ...(turn.AdvanceTimeEvent ? [turn.AdvanceTimeEvent] : []),
  ]
}

export function getGameEvents(
  turns: readonly GameSessionTurn[],
): readonly GameEvent[] {
  return _.flatMap(turns, (turn) => getEvents(turn))
}

export function getTurnNo(turn: GameSessionTurn): number {
  return turn.StartState.Timeline.CurrentTurn
}

export function getTurnNoUnsafe(
  turn: GameSessionTurn | undefined,
): number | undefined {
  if (_.isUndefined(turn)) {
    return undefined
  }
  return getTurnNo(turn)
}

export function removeAdvanceTimeEvent(turn: GameSessionTurn): GameSessionTurn {
  return {
    ...turn,
    AdvanceTimeEvent: undefined,
  }
}

export function resetTurn(turn: GameSessionTurn): GameSessionTurn {
  return {
    EventsUntilStartState: turn.EventsUntilStartState,
    StartState: turn.StartState,
    EventsInTurn: [],
    EndState: turn.StartState,
    AdvanceTimeEvent: turn.AdvanceTimeEvent,
    NextEventId: turn.NextEventId,
  }
}
