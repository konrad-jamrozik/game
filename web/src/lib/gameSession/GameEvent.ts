import type { PlayerActionName } from '../codesync/PlayerActionPayload'

export type GameEvent<T extends GameEventType = GameEventType> = {
  readonly Id: number
  readonly Turn: number
  readonly Type: T
  readonly Name: GameEventName<T>
  readonly Description: string
}

export type GameEventType = 'PlayerAction' | 'WorldEvent'

export type GameEventName<T extends GameEventType> = T extends 'PlayerAction'
  ? PlayerActionName
  : 'WorldEventName'
