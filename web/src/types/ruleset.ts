import _ from 'lodash'
import type { Agent, Mission } from './GameStatePlayerView'

// codesync UfoGameLib.Model.Ruleset
export const agentUpkeepCost = 5
export const incomeGeneratedPerAgent = agentUpkeepCost * 3

export const agentTrainingCoefficient = 1

export function missionLaunched(mission: Mission): boolean {
  return (
    mission.CurrentState === 'Failed' || mission.CurrentState === 'Successful'
  )
}

export function agentSurvivalSkill(agent: Agent): number {
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
