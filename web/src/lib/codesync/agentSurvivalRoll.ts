// codesync UfoGameLib.Model.AgentSurvivalRoll
import _ from 'lodash'
import type { Agent, MissionSite } from './GameState'
import { getSurvivalSkill } from './ruleset'

export function getSurvivalChance(
  agent: Agent,
  missionSite: MissionSite,
): number {
  return _.min([
    getSurvivalSkill(agent) - missionSite.Difficulty,
    maxSurvivalChance,
  ])!
}

const maxSurvivalChance = 99
