import _ from 'lodash'
import {
  factionNames,
  type FactionName,
  type GameState,
} from './codesync/GameState'
import {
  agentUpkeepCost,
  getSurvivalSkill,
  incomeGeneratedPerAgent,
  missionLaunched,
} from './codesync/ruleset'
import { agentStateColors } from './rendering/renderAgentState'
import { assetNameColors } from './rendering/renderAssets'
import { factionNameRenderMap } from './rendering/renderFactions'
import { missionStateColors } from './rendering/renderMissionState'
import { median } from './utils'

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
  | 'training'
  | 'generatingIncome'
  | 'gatheringIntel'
  | 'recovering'
  | 'terminatedAgents'
  | 'support'
  | 'maxTransportCapacity'
  | 'missionsLaunched'
  | 'missionsSuccessful'
  | 'missionsFailed'
  | 'missionSitesExpired'
  | FactionName
  | GameStatsDerivedDataSeriesKey

export type GameStatsDerivedDataSeriesKey =
  | 'avgDiffLast5MissionSites'
  | 'maxAgentSurvSkill'
  | 'meanAgentSurvSkill'
  | 'medianAgentSurvSkill'

type AllStatsDataSeries = {
  [K in GameStatsDataSeriesKey]: Omit<GameStateDataSeries, 'key'>
}

const supportScale = 0.1

const factionsDataSeriesByKey = _.reduce(
  factionNames,
  (result, factionName) => {
    result[factionName] = {
      dataFunc: (gs: GameState): number =>
        _.find(gs.Factions, { Name: factionName })!.Power,
      label: factionNameRenderMap[factionName].display,
      color: factionNameRenderMap[factionName].color,
    }
    return result as { [key in FactionName]: Omit<GameStateDataSeries, 'key'> }
  },
  {} as { [key in FactionName]: Omit<GameStateDataSeries, 'key'> },
)

export const allGameStatsDataSeriesByKey: AllStatsDataSeries = {
  ...factionsDataSeriesByKey,
  money: {
    dataFunc: (gs) => gs.Assets.Money,
    label: 'Money',
    color: assetNameColors.Money,
  },
  funding: {
    dataFunc: (gs) => gs.Assets.Funding,
    label: 'Funding',
    color: assetNameColors.Funding,
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
    color: agentStateColors.GeneratingIncome,
  },
  upkeep: {
    dataFunc: (gs) => _.size(gs.Assets.Agents) * agentUpkeepCost,
    label: 'Upkeep',
    color: 'Red',
  },
  intel: {
    dataFunc: (gs) =>
      gs.Assets.Intel +
      _.sumBy(gs.Factions, (faction) => faction.IntelInvested),
    label: 'Intel',
    color: assetNameColors.Intel,
  },
  support: {
    dataFunc: (gs) => gs.Assets.Support * supportScale,
    label: 'Support/10',
    color: assetNameColors.Support,
  },
  maxTransportCapacity: {
    dataFunc: (gs) => gs.Assets.MaxTransportCapacity,
    label: 'Transp. Cap',
    color: assetNameColors.MaxTransportCapacity,
  },
  agents: {
    dataFunc: (gs) => _.size(gs.Assets.Agents),
    label: 'Agents',
    color: assetNameColors.Agents,
  },
  terminatedAgents: {
    dataFunc: (gs) => _.size(gs.TerminatedAgents),
    label: 'Terminated agents',
    color: agentStateColors.Terminated,
  },
  training: {
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'Training',
        ),
      ),
    label: 'Training',
    color: agentStateColors.Training,
  },
  generatingIncome: {
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'GeneratingIncome',
        ),
      ),
    label: 'Generating income',
    color: agentStateColors.GeneratingIncome,
  },
  gatheringIntel: {
    dataFunc: (gs) =>
      _.size(
        _.filter(
          gs.Assets.Agents,
          (agent) => agent.CurrentState === 'GatheringIntel',
        ),
      ),
    label: 'Gathering intel',
    color: agentStateColors.GatheringIntel,
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
    color: agentStateColors.Recovering,
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
    color: 'Red',
  },
  maxAgentSurvSkill: {
    dataFunc: (gs) =>
      gs.Assets.Agents.length > 0
        ? getSurvivalSkill(
            _.maxBy(gs.Assets.Agents, (agent) => getSurvivalSkill(agent))!,
          )
        : 0,
    label: 'Max surv. skill',
    color: 'MediumPurple',
  },
  meanAgentSurvSkill: {
    dataFunc: (gs) =>
      gs.Assets.Agents.length > 0
        ? _.meanBy(gs.Assets.Agents, (agent) => getSurvivalSkill(agent))
        : 0,
    label: 'Mean surv. skill',
    color: '#7347cd',
  },
  medianAgentSurvSkill: {
    dataFunc: (gs) => {
      const survSkills = _.map(gs.Assets.Agents, (ag) => getSurvivalSkill(ag))
      return gs.Assets.Agents.length > 0 ? median(survSkills) : 0
    },
    label: 'Median surv. skill',
    color: '#501fb2',
  },
  missionsLaunched: {
    dataFunc: (gs) =>
      _.size(_.filter(gs.Missions, (mission) => missionLaunched(mission))),
    label: 'Missions launched',
    color: 'DodgerBlue',
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
    color: missionStateColors.Successful,
  },
  missionsFailed: {
    dataFunc: (gs) =>
      _.size(
        _.filter(gs.Missions, (mission) => mission.CurrentState === 'Failed'),
      ),
    label: 'Missions failed',
    color: missionStateColors.Failed,
  },
  missionSitesExpired: {
    dataFunc: (gs) =>
      _.size(_.filter(gs.MissionSites, (missionSite) => missionSite.Expired)),
    label: 'Mission sites expired',
    color: 'DarkRed',
  },
}

const allGameStatsDataSeries: GameStateDataSeries[] = _.map(
  allGameStatsDataSeriesByKey,
  (ds, key) => ({ ...ds, key: key as GameStatsDataSeriesKey }),
)

function getDataSeries(keys: GameStatsDataSeriesKey[]): GameStateDataSeries[] {
  return _.filter(allGameStatsDataSeries, (dataSeries) =>
    _.includes(keys, dataSeries.key),
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
  'training',
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

export const factionsDataSeries: GameStateDataSeries[] =
  getDataSeries(factionNames)
