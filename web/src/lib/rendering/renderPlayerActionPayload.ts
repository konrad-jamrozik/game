/* eslint-disable @typescript-eslint/consistent-return */
/* eslint-disable default-case */
import _ from 'lodash'
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

const actionToDisplayedDetailsMap: { [name in PlayerActionName]: string } = {
  AdvanceTime: '',
  BuyTransportCap: '',
  HireAgents: `Count: $TargetID`,
  LaunchMission: `Agent IDs: $IDs, Site: $TargetID`,
  SackAgents: `Agent IDs: $IDs`,
  SendAgentsToIncomeGeneration: `Agent IDs: $IDs`,
  SendAgentsToIntelGathering: `Agent IDs: $IDs`,
  SendAgentsToTraining: `Agent IDs: $IDs`,
  RecallAgents: `Agent IDs: $IDs`,
}

export function getDisplayedType(action: PlayerActionPayload): string {
  return actionToDisplayedTypeMap[action.Action]
}

export function getDisplayedDetails(action: PlayerActionPayload): string {
  return formatString(
    actionToDisplayedDetailsMap[action.Action],
    logIds(action),
    action.TargetId,
  )
}

function formatString(
  template: string,
  ids: string | undefined,
  targetId: number | undefined,
): string {
  let formatted = template
  if (!_.isUndefined(ids)) {
    formatted = _.replace(formatted, '$IDs', ids)
  }
  if (!_.isUndefined(targetId)) {
    formatted = _.replace(formatted, '$TargetID', targetId.toString())
  }
  return formatted
}

function logIds(action: PlayerActionPayload): string | undefined {
  if (_.isUndefined(action.Ids)) {
    return undefined
  }
  return str(action.Ids.sort((left, right) => left - right))
}
