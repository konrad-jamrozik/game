// codesync: UfoGameLib.Api.PlayerActionPayload

import type { PlayerActionNameInTurn } from './PlayerActionName'

export type PlayerActionPayload = {
  readonly Name: PlayerActionNameInTurn
  readonly Ids?: number[]
  readonly TargetId?: number
}
