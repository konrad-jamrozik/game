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
  readonly Expired: number
  readonly ExpiresIn: number | undefined
  readonly TurnDeactivated: number | undefined
  readonly Difficulty: number
}

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
