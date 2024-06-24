// codesync: UfoGameLib.State.GameState

export type GameState = {
  readonly IsGameOver: boolean
  readonly IsGameLost: boolean
  readonly IsGameWon: boolean
  readonly NextAgentId: number
  readonly NextMissionId: number
  readonly NextMissionSiteId: number
  readonly Timeline: Timeline
  readonly Assets: Assets
  readonly TerminatedAgents: Agent[]
  readonly MissionSites: MissionSite[]
  readonly Missions: Mission[]
  readonly Factions: Faction[]
  readonly UpdateCount: number
}

export const initialTurn = 1

export type Timeline = {
  readonly CurrentTurn: number
}

export type Assets = {
  readonly Money: number
  readonly Funding: number
  readonly Intel: number
  readonly Support: number
  readonly CurrentTransportCapacity: number
  readonly MaxTransportCapacity: number
  readonly Agents: Agent[]
}

export type Mission = {
  readonly Id: number
  readonly CurrentState: MissionState
  readonly AgentsSent: number
  readonly AgentsTerminated: number
  readonly $Id_Site: number
}

export type MissionSite = {
  readonly Id: number
  readonly $Id_Faction: number
  readonly Modifiers: MissionSiteModifiers
  readonly Difficulty: number
  readonly TurnAppeared: number
  readonly TurnDeactivated: number | undefined
  readonly Expired: number
  readonly ExpiresIn: number | undefined
}

export type MissionSiteModifiers = {
  readonly MoneyReward: number
  readonly IntelReward: number
  readonly FundingReward: number
  readonly SupportReward: number
  readonly PowerDamageReward: number
  readonly PowerIncreaseDamageReward: number
  readonly PowerAccelerationDamageReward: number
  readonly FundingPenalty: number
  readonly SupportPenalty: number
}

export type Faction = {
  readonly Id: number
  readonly Name: FactionName
  readonly Power: number
  readonly MissionSiteCountdown: number
  readonly PowerIncrease: number
  readonly PowerAcceleration: number
  readonly AccumulatedPowerAcceleration: number
  readonly IntelInvested: number
}

export const factionMap: { [key: number]: FactionName } = {
  0: 'Black Lotus cult',
  1: 'Red Dawn remnants',
  2: 'EXALT',
  3: 'Zombies',
}

export type FactionName =
  | 'Black Lotus cult'
  | 'Red Dawn remnants'
  | 'EXALT'
  | 'Zombies'

export type AgentState =
  | 'InTransit'
  | 'Available'
  | 'OnMission'
  | 'Training'
  | 'GatheringIntel'
  | 'GeneratingIncome'
  | 'Recovering'
  | 'Terminated'

export type MissionState = 'Successful' | 'Failed' | 'Active'

export type Agent = {
  readonly Id: number
  readonly TurnHired: number
  readonly CurrentState: AgentState
  readonly MissionsSurvived: number
  readonly TurnsInTraining: number
  readonly RecoversIn: number
}
