import type { PlayerActionName } from '../../lib/codesync/PlayerActionPayload'

// kja 2 instead of these weird exclusions here, I probably should have 'AgentPlayerActionName' union-member of PlayerActionName
export type BatchAgentPlayerActionOption = Exclude<
  PlayerActionName | 'none',
  'hireAgents' | 'buyTransportCap' | 'launchMission'
>

// kja 2 inconsistency between keys and values. E.g. "send agents" vs "assign to"
export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  sendAgentsToIncomeGeneration: 'Assign to income gen.',
  sendAgentsToIntelGathering: 'Assign to intel gath.',
  sendAgentsToTraining: 'Assign to training',
  recallAgents: 'Recall',
  sackAgents: 'Sack',
  none: 'None',
}
