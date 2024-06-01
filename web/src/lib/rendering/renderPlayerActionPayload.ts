/* eslint-disable @typescript-eslint/consistent-return */
/* eslint-disable default-case */
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'
import { str } from '../utils'

const actionToDisplayedTypeMap: { [name in PlayerActionName]: string } = {
  AdvanceTime: 'Advance time',
  BuyTransportCap: 'Buy transport capacity',
  HireAgents: 'Hire agents',
  LaunchMission: 'Launch mission',
  SackAgents: 'Sack agents',
  SendAgentsToIncomeGeneration: 'Send agents to gen. inc.',
  SendAgentsToIntelGathering: 'Send agents to gath. intel',
  SendAgentsToTraining: 'Send agents to training',
  RecallAgents: 'Recall agents',
}

export function getDisplayedType(action: PlayerActionPayload): string {
  return actionToDisplayedTypeMap[action.Action]
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
      return `Count: ${action.TargetId}`
    }
    case 'LaunchMission': {
      return `Agent IDs: ${logIds(action)}, Site: ${action.TargetId}`
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
