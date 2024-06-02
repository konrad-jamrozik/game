/* eslint-disable @typescript-eslint/consistent-return */
/* eslint-disable default-case */
import _ from 'lodash'
import type {
  PlayerActionName,
  PlayerActionPayload,
} from '../codesync/PlayerActionPayload'
import { str } from '../utils'

const playerActionNameToDisplayMap: {
  [name in PlayerActionName]: {
    displayedType: string
    displayedDetails: string
  }
} = {
  AdvanceTime: { displayedType: 'Advance time', displayedDetails: '' },
  BuyTransportCap: {
    displayedType: 'Buy transport capacity',
    displayedDetails: '',
  },
  HireAgents: {
    displayedType: 'Hire agents',
    displayedDetails: `Count: $TargetID`,
  },
  LaunchMission: {
    displayedType: 'Launch mission',
    displayedDetails: `Agent IDs: $IDs, Site: $TargetID`,
  },
  SackAgents: {
    displayedType: 'Sack agents',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToIncomeGeneration: {
    displayedType: 'Send agents to gen. inc.',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToIntelGathering: {
    displayedType: 'Send agents to gath. intel',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToTraining: {
    displayedType: 'Send agents to training',
    displayedDetails: `Agent IDs: $IDs`,
  },
  RecallAgents: {
    displayedType: 'Recall agents',
    displayedDetails: `Agent IDs: $IDs`,
  },
}

export function getDisplayedType(payload: PlayerActionPayload): string {
  return playerActionNameToDisplayMap[payload.ActionName].displayedType
}

export function getDisplayedDetails(payload: PlayerActionPayload): string {
  return formatString(
    playerActionNameToDisplayMap[payload.ActionName].displayedDetails,
    logIds(payload),
    payload.TargetId,
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
