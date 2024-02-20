import type { AgentPlayerActionName } from '../../lib/codesync/PlayerActionPayload'

export type BatchAgentPlayerActionOption = AgentPlayerActionName | 'None'

export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  SendAgentsToIncomeGeneration: 'Send to gen. income',
  SendAgentsToIntelGathering: 'Send to gather intel',
  SendAgentsToTraining: 'Send to training',
  RecallAgents: 'Recall',
  SackAgents: 'Sack',
  None: 'None',
}
