// codesync: UfoGameLib.State.GameSessionTurn
import _ from 'lodash'
import type { GameEvent } from './GameEvent'
import type { GameState } from './GameState'
import type { PlayerActionEvent } from './PlayerActionEvent'
import type { WorldEvent } from './WorldEvent'

export type GameSessionTurn = {
  readonly EventsUntilStartState: WorldEvent[]
  readonly StartState: GameState
  readonly EventsInTurn: PlayerActionEvent[]
  readonly EndState: GameState
  readonly AdvanceTimeEvent?: PlayerActionEvent | undefined
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
    // using isNil, because it will be null, not undefined, if the turn is the latest turn
    // received from backend.
    NextEventId: !_.isNil(turn.AdvanceTimeEvent)
      ? turn.AdvanceTimeEvent.Id
      : turn.NextEventId,
  }
}

export function resetTurn(turn: GameSessionTurn): GameSessionTurn {
  const eventsRemoved =
    turn.EventsInTurn.length + (!_.isNil(turn.AdvanceTimeEvent) ? 1 : 0)
  const newNextEventId =
    eventsRemoved === 0 ? turn.NextEventId : turn.NextEventId! - eventsRemoved
  console.log(
    `eventsRemoved: ${eventsRemoved}, turn.NextEventId: ${turn.NextEventId}, newNextEventId: ${newNextEventId}`,
  )
  return {
    EventsUntilStartState: turn.EventsUntilStartState,
    StartState: turn.StartState,
    EventsInTurn: [],
    EndState: turn.StartState,
    AdvanceTimeEvent: turn.AdvanceTimeEvent,
    NextEventId: newNextEventId,
  }
}
