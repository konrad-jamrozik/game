// codesync: UfoGameLib.Controller.PlayerActionName
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
