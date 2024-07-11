import type { AgentPlayerActionName } from '../../lib/codesync/PlayerActionName'

export type BatchAgentPlayerActionOption = AgentPlayerActionName | 'None'

// kja to replace with playerActionMap
export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  None: 'None',
  RecallAgentsPlayerAction: 'Recall',
  SackAgentsPlayerAction: 'Sack',
  SendAgentsToGatherIntelPlayerAction: 'Send to gather intel',
  SendAgentsToGenerateIncomePlayerAction: 'Send to gen. income',
  SendAgentsToTrainingPlayerAction: 'Send to training',
}
