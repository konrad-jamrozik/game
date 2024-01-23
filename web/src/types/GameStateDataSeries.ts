import _ from 'lodash'
import type { GameStatePlayerView } from './GameStatePlayerView'
import { agentUpkeepCost } from './ruleset'

export type GameStatsDataSeriesKey =
  | 'money'
  | 'funding'
  | 'upkeep'
  | 'intel'
  | 'agents'
  | 'inTraining'
  | 'generatingIncome'
  | 'gatheringIntel'
  | 'recovering'

export type GameStateDataSeries = {
  key: GameStatsDataSeriesKey
  dataFunc: (gs: GameStatePlayerView) => number
  label: string
  color: string
}

export const allStatsDataSeries: GameStateDataSeries[] = [
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
  {
    key: 'intel',
    dataFunc: (gs) => gs.Assets.Intel,
    label: 'Intel',
    color: 'dodgerBlue',
  },
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

function getDataSeries(keys: GameStatsDataSeriesKey[]): GameStateDataSeries[] {
  return _.filter(allStatsDataSeries, (ds) => _.includes(keys, ds.key))
}

export const moneyStatsDataSeries: GameStateDataSeries[] = getDataSeries([
  'money',
  'funding',
  'upkeep',
])

export const intelStatsDataSeries: GameStateDataSeries[] = getDataSeries([
  'money',
  'intel',
])

export const agentStatsDataSeries: GameStateDataSeries[] = getDataSeries([
  'agents',
  'inTraining',
  'generatingIncome',
  'gatheringIntel',
  'recovering',
])
