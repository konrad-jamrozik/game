import _ from 'lodash'
import { median } from '../lib/utils'
import type { GameState } from './GameState'
import {
  agentSurvivalSkill,
  agentUpkeepCost,
  incomeGeneratedPerAgent,
  missionLaunched,
} from './ruleset'

export type GameStateDataSeries = {
  key: GameStatsDataSeriesKey
  dataFunc: (gs: GameState) => number
  label: string
  color: string
}

export type GameStatsDataSeriesKey =
  | 'money'
  | 'funding'
  | 'incomeGenerated'
  | 'upkeep'
  | 'intel'
  | 'agents'
  | 'inTraining'
  | 'generatingIncome'
  | 'gatheringIntel'
  | 'recovering'
  | 'terminatedAgents'
  | 'support'
  | 'maxTransportCapacity'
  | 'avgDiffLast5MissionSites'
  | 'maxAgentSurvSkill'
  | 'meanAgentSurvSkill'
  | 'medianAgentSurvSkill'
  | 'missionsLaunched'
  | 'missionsSuccessful'
  | 'missionsFailed'
  | 'missionSitesExpired'

type AllStatsDataSeries = {
  [K in GameStatsDataSeriesKey]: Omit<GameStateDataSeries, 'key'>
}

const supportScale = 0.1

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
  incomeGenerated: {
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'GeneratingIncome',
        ),
      ) * incomeGeneratedPerAgent,
    label: 'Income generated',
    color: 'GoldenRod',
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
  support: {
    dataFunc: (gs) => gs.Assets.Support * supportScale,
    label: 'Support/10',
    color: 'darkOliveGreen',
  },
  maxTransportCapacity: {
    dataFunc: (gs) => gs.Assets.MaxTransportCapacity,
    label: 'Trp. Cap',
    color: 'blue',
  },
  agents: {
    dataFunc: (gs) => _.size(gs.Assets.Agents),
    label: 'Agents',
    color: 'darkGreen',
  },
  terminatedAgents: {
    dataFunc: (gs) => _.size(gs.TerminatedAgents),
    label: 'Terminated agents',
    color: 'darkRed',
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
  avgDiffLast5MissionSites: {
    dataFunc: (gs) =>
      gs.MissionSites.length > 0
        ? Math.round(
            _.meanBy(
              _.takeRight(gs.MissionSites, 5),
              (site) => site.Difficulty,
            ),
          )
        : 0,
    label: 'Avg. diff. last 5 sites',
    color: 'red',
  },
  maxAgentSurvSkill: {
    dataFunc: (gs) =>
      gs.Assets.Agents.length > 0
        ? agentSurvivalSkill(
            _.maxBy(gs.Assets.Agents, (agent) => agentSurvivalSkill(agent))!,
          )
        : 0,
    label: 'Max surv. skill',
    color: 'mediumPurple',
  },
  meanAgentSurvSkill: {
    dataFunc: (gs) =>
      gs.Assets.Agents.length > 0
        ? _.meanBy(gs.Assets.Agents, (agent) => agentSurvivalSkill(agent))
        : 0,
    label: 'Mean surv. skill',
    color: '#7347cd',
  },
  medianAgentSurvSkill: {
    dataFunc: (gs) => {
      const survSkills = _.map(gs.Assets.Agents, (ag) => agentSurvivalSkill(ag))
      return gs.Assets.Agents.length > 0 ? median(survSkills) : 0
    },
    label: 'Median surv. skill',
    color: '#501fb2',
  },
  missionsLaunched: {
    dataFunc: (gs) =>
      _.size(_.filter(gs.Missions, (mission) => missionLaunched(mission))),
    label: 'Missions launched',
    color: 'dodgerBlue',
  },
  missionsSuccessful: {
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Missions,
          (mission) => mission.CurrentState === 'Successful',
        ),
      ),
    label: 'Missions successful',
    color: 'darkGReen',
  },
  missionsFailed: {
    dataFunc: (gs) =>
      _.size(
        _.filter(gs.Missions, (mission) => mission.CurrentState === 'Failed'),
      ),
    label: 'Missions failed',
    color: 'red',
  },
  missionSitesExpired: {
    dataFunc: (gs) =>
      _.size(_.filter(gs.MissionSites, (missionSite) => missionSite.Expired)),
    label: 'Mission sites expired',
    color: 'darkRed',
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
  'incomeGenerated',
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
  'maxTransportCapacity',
])

export const miscStatsDataSeries: GameStateDataSeries[] = getDataSeries([
  'support',
  'terminatedAgents',
  'avgDiffLast5MissionSites',
  'maxAgentSurvSkill',
  'meanAgentSurvSkill',
  'medianAgentSurvSkill',
])

export const missionsStatsDataSeries: GameStateDataSeries[] = getDataSeries([
  'missionsLaunched',
  'missionsSuccessful',
  'missionsFailed',
  'missionSitesExpired',
])
