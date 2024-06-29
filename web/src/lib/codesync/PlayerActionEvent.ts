// codesync: UfoGameLib.Controller.PlayerAction
import type { GameEventBase } from './GameEvent'

export type PlayerActionEvent = GameEventBase & {
  readonly Ids: number[] | undefined
  readonly TargetId: number | undefined
}

export type PlayerActionName =
  | 'AdvanceTimePlayerAction'
  | 'BuyTransportCapacityPlayerAction'
  | 'HireAgentsPlayerAction'
  | 'LaunchMissionPlayerAction'
  | 'InvestIntelPlayerAction'
  | AgentPlayerActionName

export type AgentPlayerActionName =
  | 'SackAgentsPlayerAction'
  | 'SendAgentsToGenerateIncomePlayerAction'
  | 'SendAgentsToGatherIntelPlayerAction'
  | 'SendAgentsToTrainingPlayerAction'
  | 'RecallAgentsPlayerAction'

export const PlayerActionNameVal = [
  'AdvanceTimePlayerAction',
  'BuyTransportCapacityPlayerAction',
  'HireAgentsPlayerAction',
  'InvestIntelPlayerAction',
  'LaunchMissionPlayerAction',
  'SackAgentsPlayerAction',
  'SendAgentsToGenerateIncomePlayerAction',
  'SendAgentsToGatherIntelPlayerAction',
  'SendAgentsToTrainingPlayerAction',
  'RecallAgentsPlayerAction',
]

export type PlayerActionNameInTurn = Exclude<
  PlayerActionName,
  'AdvanceTimePlayerAction'
>
