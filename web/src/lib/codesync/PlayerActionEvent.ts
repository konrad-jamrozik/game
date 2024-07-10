// codesync: UfoGameLib.Controller.PlayerAction
import type { GameEventBase } from './GameEvent'

export type PlayerActionEvent = GameEventBase & {
  readonly Ids: number[] | undefined
  readonly TargetId: number | undefined
}

export const AgentPlayerActionNameVal = [
  'RecallAgentsPlayerAction',
  'SackAgentsPlayerAction',
  'SendAgentsToGatherIntelPlayerAction',
  'SendAgentsToGenerateIncomePlayerAction',
  'SendAgentsToTrainingPlayerAction',
] as const

export type AgentPlayerActionName = (typeof AgentPlayerActionNameVal)[number]

export const PlayerActionNameVal = [
  'AdvanceTimePlayerAction',
  'BuyTransportCapacityPlayerAction',
  'HireAgentsPlayerAction',
  'InvestIntelPlayerAction',
  'LaunchMissionPlayerAction',
  'SackAgentsPlayerAction',
  ...AgentPlayerActionNameVal,
] as const

export type PlayerActionName = (typeof PlayerActionNameVal)[number]

export type PlayerActionNameInTurn = Exclude<
  PlayerActionName,
  'AdvanceTimePlayerAction'
>
