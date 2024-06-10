// codesync: UfoGameLib.Api.PlayerActionPayload
// codesync: UfoGameLib.Controller.PlayerAction

export type PlayerActionPayload = {
  readonly ActionName: PlayerActionNameInTurn
  readonly Ids?: number[]
  readonly TargetId?: number
}

export type PlayerActionName =
  | 'AdvanceTimePlayerAction'
  | 'BuyTransportCapacityPlayerAction'
  | 'HireAgentsPlayerAction'
  | 'LaunchMissionPlayerAction'
  | AgentPlayerActionName

export type AgentPlayerActionName =
  | 'SackAgentsPlayerAction'
  | 'SendAgentsToGenerateIncomePlayerAction'
  | 'SendAgentsToGatherIntelPlayerAction'
  | 'SendAgentsToTrainingPlayerAction'
  | 'RecallAgentsPlayerAction'

export type PlayerActionNameInTurn = Exclude<
  PlayerActionName,
  'AdvanceTimePlayerAction'
>
