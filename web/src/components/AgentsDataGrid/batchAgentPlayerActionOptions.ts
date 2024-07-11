import _ from 'lodash'
import type { AgentPlayerActionName } from '../../lib/codesync/PlayerActionName'
import { playerActionMap } from '../../lib/model/PlayerAction'

export type BatchAgentPlayerActionOption = AgentPlayerActionName | 'None'

export const batchAgentPlayerActionOptionLabel: {
  [key in BatchAgentPlayerActionOption]: string
} = {
  SendAgentsToGenerateIncomePlayerAction:
    playerActionMap.SendAgentsToGenerateIncomePlayerAction.label,
  SendAgentsToGatherIntelPlayerAction:
    playerActionMap.SendAgentsToGatherIntelPlayerAction.label,
  SendAgentsToTrainingPlayerAction:
    playerActionMap.SendAgentsToTrainingPlayerAction.label,
  RecallAgentsPlayerAction: playerActionMap.RecallAgentsPlayerAction.label,
  SackAgentsPlayerAction: playerActionMap.SackAgentsPlayerAction.label,
  None: 'None',
}
