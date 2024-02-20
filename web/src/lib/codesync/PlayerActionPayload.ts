// codesync: UfoGameLib.Api.PlayerActionPayload

export type PlayerActionName =
  | 'buyTransportCap'
  | 'hireAgents'
  | 'sackAgents'
  | 'sendAgentsToIncomeGeneration'
  | 'sendAgentsToIntelGathering'
  | 'sendAgentsToTraining'
  | 'recallAgents'
  | 'launchMission'

export type PlayerActionPayload = {
  readonly Action: string
  readonly Ids?: number[]
  readonly TargetId?: number
}
