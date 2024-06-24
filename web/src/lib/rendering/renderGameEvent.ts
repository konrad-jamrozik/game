import _ from 'lodash'
import type { GameEventName, GameEventWithTurn } from '../codesync/GameEvent'
import {
  type PlayerActionName,
  PlayerActionNameVal,
} from '../codesync/PlayerActionEvent'
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
    displayedDetails: `Site ID: $TargetID`,
  },
  ReportEvent: {
    displayedType: 'Report',
    displayedDetails: `Change: Money: $IDs[0] Intel: $IDs[1] Funding: $IDs[2] Support: $IDs[3]`,
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
    'Ids' in event ? event.Ids : undefined,
    'TargetId' in event ? event.TargetId : undefined,
  )
}

function formatString(
  template: string,
  ids: number[] | undefined,
  targetId: number | undefined,
): string {
  let formatted = template
  if (!_.isNil(ids)) {
    if (!_.isEmpty(ids)) {
      for (const index of _.rangeRight(ids.length)) {
        formatted = _.replace(
          formatted,
          `$IDs[${index}]`,
          ids[index]!.toString(),
        )
      }
    }
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
  // The "[...id]" spread here is used to avoid mutating the "ids" array.
  return str([...ids].sort((left, right) => left - right))
}
