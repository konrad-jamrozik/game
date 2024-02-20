import type { PlayerActionName } from '../../lib/codesync/PlayerActionPayload'

export type BatchAgentPlayerActionOption = Exclude<
  Uncapitalize<PlayerActionName> | 'none',
  'hireAgents' | 'buyTransportCap' | 'launchMission' | 'advanceTime'
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
