import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'

export type GameEventFromPayload<
  TPayload extends GameEventPayload = GameEventPayload,
> = {
  readonly Id: number
  readonly Turn: number
  readonly Payload: TPayload
}

export type GameEventPayload = PlayerActionPayload | WorldEventPayload

export type WorldEventPayload = {
  readonly Id: number
}

export type GameEventDisplayedKind<T extends GameEventPayload> =
  T extends PlayerActionPayload ? 'Player action' : 'World event'
