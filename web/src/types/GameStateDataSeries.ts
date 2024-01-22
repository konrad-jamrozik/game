import _ from 'lodash'
import type { GameStatePlayerView } from './GameStatePlayerView'
import { agentUpkeepCost } from './ruleset'

export type GameStateDataSeries = {
  key: string
  dataFunc: (gs: GameStatePlayerView) => number
  label: string
  color: string
}

export const moneyStatsDataSeries: GameStateDataSeries[] = [
  {
    key: 'money',
    dataFunc: (gs) => gs.Assets.Money,
    label: 'Money',
    color: 'darkGreen',
  },
  {
    key: 'funding',
    dataFunc: (gs) => gs.Assets.Funding,
    label: 'Funding',
    color: 'gold',
  },
  {
    key: 'upkeep',
    dataFunc: (gs) => _.size(gs.Assets.Agents) * agentUpkeepCost,
    label: 'Upkeep',
    color: 'red',
  },
]

export const intelStatsDataSeries: GameStateDataSeries[] = [
  {
    key: 'money',
    dataFunc: (gs) => gs.Assets.Money,
    label: 'Money',
    color: 'darkGreen',
  },
  {
    key: 'intel',
    dataFunc: (gs) => gs.Assets.Intel,
    label: 'Intel',
    color: 'dodgerBlue',
  },
]

export const agentStatsDataSeries: GameStateDataSeries[] = [
  {
    key: 'agents',
    dataFunc: (gs) => _.size(gs.Assets.Agents),
    label: 'Agents',
    color: 'darkGreen',
  },
  {
    key: 'inTraining',
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'Training',
        ),
      ),
    label: 'InTraining',
    color: 'purple',
  },
  {
    key: 'generatingIncome',
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'GeneratingIncome',
        ),
      ),
    label: 'GeneratingIncome',
    color: 'gold',
  },
  {
    key: 'gatheringIntel',
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'GatheringIntel',
        ),
      ),
    label: 'GatheringIntel',
    color: 'dodgerBlue',
  },
  {
    key: 'recovering',
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'Recovering',
        ),
      ),
    label: 'Recovering',
    color: 'crimson',
  },
]
