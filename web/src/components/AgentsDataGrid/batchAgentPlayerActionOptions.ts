import type { PlayerActionName } from '../../lib/api/applyPlayerActionApi'

// kja 2 instead of these weird exclusions here, I probably should have 'AgentPlayerActionName' union-member of PlayerActionName
export type BatchAgentPlayerActionOption = Exclude<
  PlayerActionName | 'none',
  'buyTransportCap' | 'launchMission'
>

// kja 2 inconsistency between keys and values. E.g. "send agents" vs "assign to"
export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  hireAgents: 'Hire agent',
  sendAgentsToIncomeGeneration: 'Assign to income gen.',
  sendAgentsToIntelGathering: 'Assign to intel gath.',
  sendAgentsToTraining: 'Assign to training',
  recallAgents: 'Recall',
  sackAgents: 'Sack',
  none: 'None',
}
