import _ from 'lodash'
import {
  isPlayerActionEvent,
  isWorldEvent,
  type GameEventName,
  type GameEventWithTurn,
} from '../codesync/GameEvent'
import { never, str } from '../utils'
import { formatString } from './formatString'

const gameEventDisplayMap: {
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
  InvestIntelPlayerAction: {
    displayedType: 'Invest intel',
    displayedDetails: `Faction ID: $IDs[0], Amount: $TargetID`,
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
  if (isWorldEvent(event)) {
    return 'World Event'
  } else if (isPlayerActionEvent(event)) {
    return 'Player Action'
  }
  return never()
}

export function getDisplayedType(event: GameEventWithTurn): string {
  return gameEventDisplayMap[event.Type].displayedType
}

export function getDisplayedDetails(event: GameEventWithTurn): string {
  return formatString(
    gameEventDisplayMap[event.Type].displayedDetails,
    'Ids' in event ? event.Ids : undefined,
    'TargetId' in event ? event.TargetId : undefined,
  )
}

export function logIds(ids: number[]): string {
  // The "[...id]" spread here is used to avoid mutating the "ids" array.
  return str([...ids].sort((left, right) => left - right))
}
