import _ from 'lodash'
import type { GameEventName, GameEventWithTurn } from '../codesync/GameEvent'
import {
  PlayerActionNameVal,
  type PlayerActionName,
} from '../codesync/PlayerActionPayload'
import { str } from '../utils'

const playerActionNameToDisplayMap: {
  [name in GameEventName]: {
    displayedType: string
    displayedDetails: string
  }
} = {
  AdvanceTimePlayerAction: {
    displayedType: 'Advance time',
    displayedDetails: 'Turn: $TargetID -> $TargetID+1',
  },
  BuyTransportCapacityPlayerAction: {
    displayedType: 'Buy transport capacity',
    displayedDetails: 'Capacity: +$TargetID = $IDs[0]',
  },
  HireAgentsPlayerAction: {
    displayedType: 'Hire agents',
    displayedDetails: `Count: +$TargetID = $IDs[0]`,
  },
  LaunchMissionPlayerAction: {
    displayedType: 'Launch mission',
    displayedDetails: `Site ID: $TargetID, Mission ID: $IDs[0], Agent IDs: $IDs[1..]`,
  },
  SackAgentsPlayerAction: {
    displayedType: 'Sack agents',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToGenerateIncomePlayerAction: {
    displayedType: 'Send agents to gen. inc.',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToGatherIntelPlayerAction: {
    displayedType: 'Send agents to gath. intel',
    displayedDetails: `Agent IDs: $IDs`,
  },
  SendAgentsToTrainingPlayerAction: {
    displayedType: 'Send agents to training',
    displayedDetails: `Agent IDs: $IDs`,
  },
  RecallAgentsPlayerAction: {
    displayedType: 'Recall agents',
    displayedDetails: `Agent IDs: $IDs`,
  },
  MissionSiteExpiredEvent: {
    displayedType: 'Mission site expired',
    displayedDetails: `Site ID: $ID`,
  },
}

export function getDisplayedKind(event: GameEventWithTurn): string {
  return _.includes(PlayerActionNameVal, event.Type)
    ? 'Player Action'
    : 'World Event'
}

export function getDisplayedType(event: GameEventWithTurn): string {
  return playerActionNameToDisplayMap[event.Type].displayedType
}

export function getDisplayedDetails(event: GameEventWithTurn): string {
  return formatString(
    playerActionNameToDisplayMap[event.Type as PlayerActionName]
      .displayedDetails,
    event.Ids,
    event.TargetId,
  )
}

function formatString(
  template: string,
  ids: number[] | undefined,
  targetId: number | undefined,
): string {
  let formatted = template
  if (!_.isNil(ids)) {
    formatted = _.replace(formatted, '$IDs[0]', ids[0]!.toString())
    formatted = _.replace(formatted, '$IDs[1..]', logIds(ids.slice(1)))
    formatted = _.replace(formatted, '$IDs', logIds(ids))
  }
  if (!_.isNil(targetId)) {
    formatted = _.replace(formatted, '$TargetID+1', (targetId + 1).toString())
    formatted = _.replace(formatted, '$TargetID', targetId.toString())
  }
  return formatted
}

function logIds(ids: number[]): string {
  return str(ids.sort((left, right) => left - right))
}
