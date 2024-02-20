// codesync: UfoGameLib.Api.PlayerActionPayload

export type PlayerActionPayload = {
  readonly Action: PlayerActionName
  readonly Ids?: number[]
  readonly TargetId?: number
}

export type PlayerActionName =
  | 'AdvanceTime'
  | 'BuyTransportCap'
  | 'HireAgents'
  | 'SackAgents'
  | 'SendAgentsToIncomeGeneration'
  | 'SendAgentsToIntelGathering'
  | 'SendAgentsToTraining'
  | 'RecallAgents'
  | 'LaunchMission'
