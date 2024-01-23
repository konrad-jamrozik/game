import _ from 'lodash'
import type { GameStatePlayerView } from './GameStatePlayerView'
import { agentUpkeepCost } from './ruleset'

export type GameStateDataSeries = {
  key: GameStatsDataSeriesKey
  dataFunc: (gs: GameStatePlayerView) => number
  label: string
  color: string
}

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

type AllStatsDataSeries = {
  [K in GameStatsDataSeriesKey]: Omit<GameStateDataSeries, 'key'>
}

export const allGameStatsDataSeriesByKey: AllStatsDataSeries = {
  money: {
    dataFunc: (gs) => gs.Assets.Money,
    label: 'Money',
    color: 'darkGreen',
  },
  funding: {
    dataFunc: (gs) => gs.Assets.Funding,
    label: 'Funding',
    color: 'gold',
  },
  upkeep: {
    dataFunc: (gs) => _.size(gs.Assets.Agents) * agentUpkeepCost,
    label: 'Upkeep',
    color: 'red',
  },
  intel: {
    dataFunc: (gs) => gs.Assets.Intel,
    label: 'Intel',
    color: 'dodgerBlue',
  },
  agents: {
    dataFunc: (gs) => _.size(gs.Assets.Agents),
    label: 'Agents',
    color: 'darkGreen',
  },
  inTraining: {
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
  generatingIncome: {
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
  gatheringIntel: {
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
  recovering: {
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
}

const allGameStatsDataSeries: GameStateDataSeries[] = _.map(
  allGameStatsDataSeriesByKey,
  (ds, key) => ({ ...ds, key: key as GameStatsDataSeriesKey }),
)

function getDataSeries(keys: GameStatsDataSeriesKey[]): GameStateDataSeries[] {
  return _.filter(allGameStatsDataSeries, (dsWithKey) =>
    _.includes(keys, dsWithKey.key),
  )
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
