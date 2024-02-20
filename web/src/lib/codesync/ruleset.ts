// codesync UfoGameLib.Model.Ruleset
// Note: ideally I would auto-generate the ruleset.ts file from the backend code,
// but there doesn't appear to be a well-supported, official solution for this.
import _ from 'lodash'
import type { Agent, AgentState, Mission, MissionSite } from './GameState'
import type { AgentPlayerActionName } from './PlayerActionPayload'

export const agentUpkeepCost = 5

export const incomeGeneratedPerAgent = agentUpkeepCost * 3

export const agentHireCost = 50

const agentTrainingCoefficient = 1

const transportCapBuyCost = 200

const skillFromEachFirstMission = [18, 15, 12, 9, 6]

const skillFromEachMissionBeyondFirstMissions =
  skillFromEachFirstMission.at(-1)!

const minSurvivalThreshold = 1

const agentSurvivalRollUpperBound = 100

const baseMissionSiteDifficulty = 30

export function isActive(missionSite: MissionSite): boolean {
  return (
    _.isNil(missionSite.TurnDeactivated) &&
    !missionSite.Expired &&
    (_.isNil(missionSite.ExpiresIn) || missionSite.ExpiresIn >= 0)
  )
}

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

export function transportCapBuyingCost(cap: number): number {
  return cap * transportCapBuyCost
}

export function canBeSentOnMission(agent: Agent): boolean {
  const validAgentStates: AgentState[] = ['Available', 'Training']
  return _.includes(validAgentStates, agent.CurrentState)
}

export function getSurvivalChanceNonNegative(
  agent: Agent,
  missionSite: MissionSite,
): number {
  return _.max([getSurvivalChance(agent, missionSite), 0])!
}

export function requiredSurvivingAgentsForSuccess(site: MissionSite): number {
  const reqAgentsForSuccess =
    1 + Math.floor((site.Difficulty - baseMissionSiteDifficulty) / 30)
  console.assert(reqAgentsForSuccess >= 1)
  return reqAgentsForSuccess
}

export const agentPlayerActionConditionMap: {
  [action in AgentPlayerActionName]: (agent: Agent) => boolean
} = {
  SendAgentsToIncomeGeneration: canBeSentOnMission,
  SendAgentsToIntelGathering: canBeSentOnMission,
  SendAgentsToTraining: canBeSentToTraining,
  RecallAgents: canBeRecalled,
  SackAgents: canBeSacked,
}

function canBeRecalled(agent: Agent): boolean {
  const validStates: AgentState[] = ['GatheringIntel', 'GeneratingIncome']
  return _.includes(validStates, agent.CurrentState)
}

function canBeSacked(agent: Agent): boolean {
  const validStates: AgentState[] = ['Available', 'Training']
  return _.includes(validStates, agent.CurrentState)
}

function canBeSentToTraining(agent: Agent): boolean {
  const validStates: AgentState[] = ['Available']
  return _.includes(validStates, agent.CurrentState)
}

function getSurvivalChance(agent: Agent, missionSite: MissionSite): number {
  return (
    agentSurvivalRollUpperBound -
    agentSurvivalThreshold(agent, missionSite.Difficulty)
  )
}

function agentSurvivalThreshold(agent: Agent, difficulty: number): number {
  return _.max([difficulty - getSurvivalSkill(agent), minSurvivalThreshold])!
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
