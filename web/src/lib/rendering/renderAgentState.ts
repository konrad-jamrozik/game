import _ from 'lodash'
import type { AgentState } from '../codesync/GameState'

export const agentStateColors: {
  [key in AgentState]: string
} = {
  InTransit: 'DeepSkyBlue',
  OnMission: 'DarkOrange',
  Available: 'LightSeaGreen',
  Training: 'MediumPurple',
  GeneratingIncome: 'Gold',
  GatheringIntel: 'DodgerBlue',
  Recovering: 'Crimson',
  Terminated: 'DarkRed',
}

export const agentStateValueGetterMap: {
  [key in AgentState]: string
} = {
  GeneratingIncome: 'Income',
  GatheringIntel: 'Intel',
  InTransit: 'InTransit',
  Available: 'Available',
  OnMission: 'OnMission',
  Training: 'Training',
  Recovering: 'Recovering',
  Terminated: 'Terminated',
}
export const invertedAgentStateValueGetterMap = _.invert(
  agentStateValueGetterMap,
)
