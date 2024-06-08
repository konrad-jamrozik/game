// codesync: UfoGameLib.State.GameSessionTurn
import type { GameEvent } from './GameEvent'
import type { GameState } from './GameState'

export type GameSessionTurn = {
  readonly EventsUntilStartState: GameEvent[]
  readonly StartState: GameState
  readonly EventsInTurn: GameEvent[]
  readonly EndState: GameState
  readonly AdvanceTimeEvent?: GameEvent
}
