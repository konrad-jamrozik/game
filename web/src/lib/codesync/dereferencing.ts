/**
 * This file contains functions that dereference GameState data structures using
 * the $ID_<Value> properties of GameState data structure.
 */

import _ from 'lodash'
import type { Faction, Mission, MissionSite } from './GameState'

export function getMissionSite(
  mission: Mission,
  missionSites: MissionSite[],
): MissionSite {
  const foundMissionSite = _.find(
    missionSites,
    (missionSite) => missionSite.Id === mission.$Id_Site,
  )

  /* c8 ignore start */
  if (!foundMissionSite) {
    throw new Error(`Mission site with id ${mission.$Id_Site} not found.`)
  }
  /* c8 ignore stop */

  return foundMissionSite
}

export function getFaction(
  missionSite: MissionSite,
  factions: Faction[],
): Faction {
  const foundFaction = _.find(
    factions,
    (faction) => faction.Id === missionSite.$Id_Faction,
  )

  /* c8 ignore start */
  if (!foundFaction) {
    throw new Error(`Faction with id ${missionSite.$Id_Faction} not found.`)
  }
  /* c8 ignore stop */

  return foundFaction
}
