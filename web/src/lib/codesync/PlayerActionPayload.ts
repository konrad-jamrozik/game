// codesync: UfoGameLib.Api.PlayerActionPayload

export type PlayerActionPayload = {
  readonly Action: PlayerActionName // kja this prop. should be named ActionName
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
