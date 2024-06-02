// codesync: UfoGameLib.Api.PlayerActionPayload

export type PlayerActionPayload = {
  readonly ActionName: PlayerActionName
  readonly Ids?: number[]
  readonly TargetId?: number
}

export type PlayerActionName =
  | 'AdvanceTime'
  | 'BuyTransportCap'
  | 'HireAgents'
  | 'LaunchMission'
  | AgentPlayerActionName

export type AgentPlayerActionName =
  | 'SackAgents'
  | 'SendAgentsToIncomeGeneration'
  | 'SendAgentsToIntelGathering'
  | 'SendAgentsToTraining'
  | 'RecallAgents'
