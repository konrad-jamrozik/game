import _ from 'lodash'
import type { GameEventWithTurn } from '../codesync/GameEvent'
import type { PlayerActionName } from '../codesync/PlayerActionPayload'
import { str } from '../utils'

const playerActionNameToDisplayMap: {
  [name in PlayerActionName]: {
    displayedType: string
    displayedDetails: string
  }
} = {
  AdvanceTimePlayerAction: {
    displayedType: 'Advance time',
    displayedDetails: '',
  },
  BuyTransportCapacityPlayerAction: {
    displayedType: 'Buy transport capacity',
    displayedDetails: '',
  },
  HireAgentsPlayerAction: {
    displayedType: 'Hire agents',
    displayedDetails: `Count: $TargetID`,
  },
  LaunchMissionPlayerAction: {
    displayedType: 'Launch mission',
    displayedDetails: `Agent IDs: $IDs, Site: $TargetID`,
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
}

export function getDisplayedType(event: GameEventWithTurn): string {
  return playerActionNameToDisplayMap[event.Type as PlayerActionName]
    .displayedType
}

export function getDisplayedDetails(event: GameEventWithTurn): string {
  if (!_.isEmpty(event.Details)) {
    return event.Details
  }
  return formatString(
    playerActionNameToDisplayMap[event.Type as PlayerActionName]
      .displayedDetails,
    logIds(event),
    event.Id, // kja this is fake and wrong; it should be "event.targetId", but currently backend doesn't return targetId in the GameEvent.
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

function logIds(event: GameEventWithTurn): string | undefined {
  // kja this is fake and wrong; instead of "eventIds" it should be "event.Ids";
  // but currently backend doesn't return Ids in the GameEvent, just Details string.
  const eventIds = [event.Id]
  if (_.isUndefined(eventIds)) {
    return undefined
  }
  return str(eventIds.sort((left, right) => left - right))
}
