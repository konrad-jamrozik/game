/* eslint-disable arrow-body-style */
// codesync UfoGameLib.Model.Ruleset
// Note: ideally I would auto-generate the ruleset.ts file from the backend code,
// but there doesn't appear to be a well-supported, official solution for this.
import _ from 'lodash'
import type {
  Agent,
  AgentState,
  Assets,
  GameState,
  Mission,
  MissionSite,
} from './GameState'
import type { AgentPlayerActionName } from './PlayerActionName'

export const agentUpkeepCost = 5

export const incomeGeneratedPerAgent = agentUpkeepCost * 3

export const intelGatheredPerAgent = 5

export const agentHireCost = 50

const agentTrainingCoefficient = 1

const skillFromEachFirstMission = [18, 15, 12, 9, 6]

const skillFromEachMissionBeyondFirstMissions =
  skillFromEachFirstMission.at(-1)!

const missionSiteSurvivalBaseDifficultyRequirement = 30

const agentBaseSurvivalSkill = 100

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
    agentBaseSurvivalSkill +
    agent.TurnsInTraining * agentTrainingCoefficient +
    skillFromMissions(agent)
  )
}

const InitialMaxTransportCapacity = 4

export function transportCapBuyingCost(
  maxTransportCap: number,
  capacityToBuy: number,
): number {
  return (
    (200 + 50 * (maxTransportCap - InitialMaxTransportCapacity)) * capacityToBuy
  )
}

export function canBeSentOnMission(agent: Agent): boolean {
  const validAgentStates: AgentState[] = ['Available', 'Training']
  return _.includes(validAgentStates, agent.CurrentState)
}

export function requiredSurvivingAgentsForSuccess(site: MissionSite): number {
  const reqAgentsForSuccess =
    1 +
    Math.floor(site.Difficulty / missionSiteSurvivalBaseDifficultyRequirement)
  console.assert(reqAgentsForSuccess >= 1)
  return reqAgentsForSuccess
}

// kja this does not belong in ruleset
type EstimatableAssets = Pick<Assets, 'Money' | 'Intel'>

export function getAssetTurnDiffEstimate(
  gameState: GameState,
  assetName: keyof EstimatableAssets,
): number {
  return assetTurnDiffEstimates[assetName](gameState)
}

const assetTurnDiffEstimates: {
  [assetName in keyof EstimatableAssets]: (gameState: GameState) => number
} = {
  Intel: (gameState) => {
    return intelGatheringAgents(gameState).length * intelGatheredPerAgent
  },
  Money: (gameState) => {
    const incomeGenerated = computeIncomeGenerated(
      incomeGeneratingAgents(gameState).length,
    )
    const agentsUpkeep = computeAgentsUpkeepCost(gameState.Assets.Agents.length)
    const moneyChange = computeMoneyChange(
      gameState.Assets.Funding,
      incomeGenerated,
      agentsUpkeep,
    )
    return moneyChange
  },
}

function incomeGeneratingAgents(gameState: GameState): Agent[] {
  return _.filter(
    gameState.Assets.Agents,
    (agent: Agent) => agent.CurrentState === 'GeneratingIncome',
  )
}

function intelGatheringAgents(gameState: GameState): Agent[] {
  return _.filter(
    gameState.Assets.Agents,
    (agent: Agent) => agent.CurrentState === 'GatheringIntel',
  )
}

export function canBeRecalled(agent: Agent): boolean {
  const validStates: AgentState[] = ['GatheringIntel', 'GeneratingIncome']
  return _.includes(validStates, agent.CurrentState)
}

export function canBeSacked(agent: Agent): boolean {
  const validStates: AgentState[] = ['Available', 'Training']
  return _.includes(validStates, agent.CurrentState)
}

export function canBeSentToTraining(agent: Agent): boolean {
  const validStates: AgentState[] = ['Available']
  return _.includes(validStates, agent.CurrentState)
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

function computeMoneyChange(
  funding: number,
  incomeGenerated: number,
  agentUpkeep: number,
): number {
  return funding + incomeGenerated - agentUpkeep
}

function computeIncomeGenerated(incomeGeneratingAgentCount: number): number {
  return incomeGeneratingAgentCount * incomeGeneratedPerAgent
}

function computeAgentsUpkeepCost(agentCount: number): number {
  return agentCount * agentUpkeepCost
}
