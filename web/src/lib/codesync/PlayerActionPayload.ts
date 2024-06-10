// codesync: UfoGameLib.Api.PlayerActionPayload
import type { PlayerActionNameInTurn } from './PlayerActionEvent'

export type PlayerActionPayload = {
  readonly ActionName: PlayerActionNameInTurn
  readonly Ids?: number[]
  readonly TargetId?: number
}
