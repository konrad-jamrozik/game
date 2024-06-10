// codesync: UfoGameLib.Events.WorldEvent
import type { GameEventBase } from './GameEvent'

export type WorldEvent = GameEventBase & {
  readonly TargetId: number
}

export type WorldEventName = 'MissionSiteExpiredEvent'
