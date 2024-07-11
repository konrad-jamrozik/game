// codesync: UfoGameLib.Model.PlayerAction
// codesync: UfoGameLib.Model.Agent
import {
  newPayloadFromIds,
  newPayloadFromIdsAndTargetId,
  newPayloadFromTargetId,
  type PayloadProvider,
} from '../api/playerActionsPayloadsProviders'
import type { Agent } from '../codesync/GameState'
import type { PlayerActionName } from '../codesync/PlayerActionName'
import {
  canBeRecalled,
  canBeSacked,
  canBeSentOnMission,
  canBeSentToTraining,
} from '../codesync/ruleset'

// abstract class PlayerAction {
//   public constructor(private readonly name: PlayerActionName) {}
// }

// export class SendAgentsToGenerateIncomePlayerAction extends PlayerAction {
//   public constructor() {
//     super('SendAgentsToGenerateIncomePlayerAction')
//   }
// }

export type PlayerAction = {
  label: string
  canApplyToAgent?: (agent: Agent) => boolean
  payloadProvider?: PayloadProvider
}

export const playerActionMap: {
  [key in PlayerActionName]: PlayerAction
} = {
  AdvanceTimePlayerAction: { label: 'Advance time' },
  BuyTransportCapacityPlayerAction: {
    label: 'Buy transport capacity',
    payloadProvider: newPayloadFromTargetId('BuyTransportCapacityPlayerAction'),
  },
  HireAgentsPlayerAction: {
    label: 'Hire agents',
    payloadProvider: newPayloadFromTargetId('HireAgentsPlayerAction'),
  },
  InvestIntelPlayerAction: {
    label: 'Invest intel',
    payloadProvider: newPayloadFromIdsAndTargetId('InvestIntelPlayerAction'),
  },
  LaunchMissionPlayerAction: {
    label: 'Launch mission',
    payloadProvider: newPayloadFromIdsAndTargetId('LaunchMissionPlayerAction'),
  },
  RecallAgentsPlayerAction: {
    label: 'Recall',
    canApplyToAgent: canBeRecalled,
    payloadProvider: newPayloadFromIds('RecallAgentsPlayerAction'),
  },
  SackAgentsPlayerAction: {
    label: 'Sack',
    canApplyToAgent: canBeSacked,
    payloadProvider: newPayloadFromIds('SackAgentsPlayerAction'),
  },
  SendAgentsToGatherIntelPlayerAction: {
    label: 'Send to gather intel',
    canApplyToAgent: canBeSentOnMission,
    payloadProvider: newPayloadFromIds('SendAgentsToGatherIntelPlayerAction'),
  },
  SendAgentsToGenerateIncomePlayerAction: {
    label: 'Send to gen. income',
    canApplyToAgent: canBeSentOnMission,
    payloadProvider: newPayloadFromIds(
      'SendAgentsToGenerateIncomePlayerAction',
    ),
  },
  SendAgentsToTrainingPlayerAction: {
    label: 'Send to training',
    canApplyToAgent: canBeSentToTraining,
    payloadProvider: newPayloadFromIds('SendAgentsToTrainingPlayerAction'),
  },
}

// kja searching e.g. for 'SendAgentsToGatherIntelPlayerAction:' shows it usage in following maps:
// - playerActionsPayloadsProviders, to determine how to call the backend for this action
// - DONE agentPlayerActionConditionMap, to determine when this action can be performed on given agent
// - DONE batchAgentPlayerActionOptionLabel, to show label in player actions dropdown
// - gameEventDisplayMap, to determine how to display corresponding event in event log
//   - this has both the displayed type, and templated details
//
// I feel it would be better to consolidate all of these maps into one, by introducing a class
// representing this player action. This class would have methods like:
// - getBackendPayloadProvider(),
// - getCanBeAppliedToAgent(agent),
// - getLabel(),
// - getEventDisplay()
//
// The underlying maps may still be useful, and the method implementations may call into those maps.
//
// But instead of doing this:
//   const payloadProvider = playerActionsPayloadsProviders[playerActionName]
// I would do this:
//  playerAction.getBackendPayloadProvider()
//
// Instead of doing this:
//   action: BatchAgentPlayerActionOption,
//   return agentPlayerActionConditionMap[action](rowAgent)
// I would do this:
//   playerAction.getCanBeAppliedToAgent(rowAgent)
//
// I would sometimes need to retrieve the player action class based on its name,
// so I would likely have a map from player action names to player action classes.
