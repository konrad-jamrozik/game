import type { GameEvent } from '../codesync/GameEvent'

export type RenderedGameEvent = GameEvent & {
  readonly Id: number
  readonly Turn: number
}
