// codesync: UfoGameLib.State.GameSessionTurn
import type { GameEvent } from './GameEvent'
import type { GameState } from './GameState'

export type GameSessionTurn = {
  readonly GameState: GameState
  readonly GameEvents: GameEvent[]
}
