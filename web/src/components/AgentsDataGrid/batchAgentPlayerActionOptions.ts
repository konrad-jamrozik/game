import type { AgentPlayerActionName } from '../../lib/codesync/PlayerActionEvent'

export type BatchAgentPlayerActionOption = AgentPlayerActionName | 'None'

export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  SendAgentsToGenerateIncomePlayerAction: 'Send to gen. income',
  SendAgentsToGatherIntelPlayerAction: 'Send to gather intel',
  SendAgentsToTrainingPlayerAction: 'Send to training',
  RecallAgentsPlayerAction: 'Recall',
  SackAgentsPlayerAction: 'Sack',
  None: 'None',
}
