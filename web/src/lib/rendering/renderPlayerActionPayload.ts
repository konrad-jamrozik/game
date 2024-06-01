/* eslint-disable @typescript-eslint/consistent-return */
/* eslint-disable default-case */
import type { PlayerActionPayload } from '../codesync/PlayerActionPayload'
import { str } from '../utils'

// kja make this declarative map
export function getDisplayedType(action: PlayerActionPayload): string {
  switch (action.Action) {
    case 'AdvanceTime': {
      return 'Advance time'
    }
    case 'BuyTransportCap': {
      return 'Buy transport capacity'
    }
    case 'HireAgents': {
      // Note: currently UI supports hiring only one agent. See playerActionsPayloadsProviders.HireAgents
      return 'Hire agent'
    }
    case 'LaunchMission': {
      return `Launch mission`
    }
    case 'SackAgents': {
      return `Sack agents`
    }
    case 'SendAgentsToIncomeGeneration': {
      return `Send agents to inc. gen.`
    }
    case 'SendAgentsToIntelGathering': {
      return `Send agents to intel gath.`
    }
    case 'SendAgentsToTraining': {
      return `Send agents to training`
    }
    case 'RecallAgents': {
      return `Recall agents`
    }
  }
}

export function getDisplayedDetails(action: PlayerActionPayload): string {
  switch (action.Action) {
    case 'AdvanceTime': {
      return ''
    }
    case 'BuyTransportCap': {
      return ''
    }
    case 'HireAgents': {
      return ''
    }
    case 'LaunchMission': {
      return `Agent IDs: ${logIds(action)}, Site: ${action.TargetId!}`
    }
    case 'SackAgents': {
      return `Agent IDs: ${logIds(action)}`
    }
    case 'SendAgentsToIncomeGeneration': {
      return `Agent IDs: ${logIds(action)}`
    }
    case 'SendAgentsToIntelGathering': {
      return `Agent IDs: ${logIds(action)}`
    }
    case 'SendAgentsToTraining': {
      return `Agent IDs: ${logIds(action)}`
    }
    case 'RecallAgents': {
      return `Agent IDs: ${logIds(action)}`
    }
  }
}

function logIds(action: PlayerActionPayload): string {
  return str(action.Ids!.sort((left, right) => left - right))
}
