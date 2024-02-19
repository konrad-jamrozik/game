// codesync UfoGameLib.Model.Ruleset
import _ from 'lodash'
import type { Agent, AgentState, Mission, MissionSite } from './GameState'

export const agentUpkeepCost = 5
export const incomeGeneratedPerAgent = agentUpkeepCost * 3

export const agentHireCost = 50

export const agentTrainingCoefficient = 1

export function isActive(missionSite: MissionSite): boolean {
  return (
    _.isNil(missionSite.TurnDeactivated) &&
    !missionSite.Expired &&
    (_.isNil(missionSite.ExpiresIn) || missionSite.ExpiresIn >= 0)
  )
}

// kja3: instead of replicating this logic from backend here,
// make backend expose this property in the returned json. Applies to all such
// properties in ruleset.ts.
export function missionLaunched(mission: Mission): boolean {
  return (
    mission.CurrentState === 'Failed' || mission.CurrentState === 'Successful'
  )
}

export function getSurvivalSkill(agent: Agent): number {
  return (
    agent.TurnsInTraining * agentTrainingCoefficient + skillFromMissions(agent)
  )
}

function skillFromMissions(agent: Agent): number {
  const skillFromFirstMissions = _.reduce(
    skillFromEachFirstMission.slice(0, agent.MissionsSurvived),
    (acc, curr) => acc + curr,
    0,
  )
  const missionsBeyondFirstMissions = Math.max(
    agent.MissionsSurvived - skillFromEachFirstMission.length,
    0,
  )
  return (
    skillFromFirstMissions +
    missionsBeyondFirstMissions * skillFromEachMissionBeyondFirstMissions
  )
}

const skillFromEachFirstMission = [18, 15, 12, 9, 6]

const skillFromEachMissionBeyondFirstMissions =
  skillFromEachFirstMission.at(-1)!

export function transportCapBuyingCost(cap: number): number {
  return cap * 200
}

export function canBeSentOnMission(agent: Agent): boolean {
  const validAgentStates: AgentState[] = ['Available', 'Training']
  return _.includes(validAgentStates, agent.CurrentState)
}

export const minSurvivalThreshold = 1
export const agentSurvivalRollUpperBound = 100

export function agentSurvivalThreshold(
  agent: Agent,
  difficulty: number,
): number {
  return _.max([difficulty - getSurvivalSkill(agent), minSurvivalThreshold])!
}

export function getSurvivalChanceNonNegative(
  agent: Agent,
  missionSite: MissionSite,
): number {
  return _.max([getSurvivalChance(agent, missionSite), 0])!
}

export function getSurvivalChance(
  agent: Agent,
  missionSite: MissionSite,
): number {
  return (
    agentSurvivalRollUpperBound -
    agentSurvivalThreshold(agent, missionSite.Difficulty)
  )
}

export function canSurvive(agent: Agent, missionSite: MissionSite): boolean {
  return getSurvivalChance(agent, missionSite) > 0
}

export const baseMissionSiteDifficulty = 30

export function requiredSurvivingAgentsForSuccess(site: MissionSite): number {
  const reqAgentsForSuccess =
    1 + Math.floor((site.Difficulty - baseMissionSiteDifficulty) / 30)
  console.assert(reqAgentsForSuccess >= 1)
  return reqAgentsForSuccess
}
