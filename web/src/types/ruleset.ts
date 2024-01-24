/* eslint-disable lodash/prefer-lodash-method */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { Agent } from './GameStatePlayerView'

// codesync UfoGameLib.Model.Ruleset
export const agentUpkeepCost = 5
export const incomeGeneratedPerAgent = agentUpkeepCost * 3

export const agentTrainingCoefficient = 1

export function agentSurvivalSkill(agent: Agent): number {
  return (
    agent.TurnsInTraining * agentTrainingCoefficient + skillFromMissions(agent)
  )
}

function skillFromMissions(agent: Agent): number {
  const skillFromFirstMissions = skillFromEachFirstMission
    .slice(0, agent.MissionsSurvived)
    .reduce((acc, curr) => acc + curr, 0)
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  skillFromEachFirstMission.at(-1)!
