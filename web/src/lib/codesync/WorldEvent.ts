// codesync: UfoGameLib.Events.WorldEvent
import type { GameEventBase } from './GameEvent'

export type WorldEvent = GameEventBase & {
  readonly Ids: number[] | undefined
  readonly TargetId: number | undefined
}

export type WorldEventName = 'MissionSiteExpiredEvent' | 'ReportEvent'
