import type { AgentPlayerActionName } from '../../lib/codesync/PlayerActionPayload'

export type BatchAgentPlayerActionOption = AgentPlayerActionName | 'None'

// kja 2 inconsistency between keys and values. E.g. "send agents" vs "assign to"
export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  SendAgentsToIncomeGeneration: 'Assign to income gen.',
  SendAgentsToIntelGathering: 'Assign to intel gath.',
  SendAgentsToTraining: 'Assign to training',
  RecallAgents: 'Recall',
  SackAgents: 'Sack',
  None: 'None',
}
