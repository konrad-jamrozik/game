// codesync: UfoGameLib.Events.WorldEvent
import type { GameEventBase } from './GameEvent'

export type WorldEvent = MissionSiteExpiredEvent

export type MissionSiteExpiredEvent = GameEventBase & {
  readonly TargetId: number
}
export type WorldEventName = 'MissionSiteExpiredEvent'
