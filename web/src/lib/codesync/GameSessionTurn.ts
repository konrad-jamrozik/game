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
