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
  readonly MaxTransportCapacity: number
  readonly Agents: Agent[]
}

export type Mission = {
  readonly Id: number
  readonly CurrentState: 'Active' | 'Successful' | 'Failed'
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

export type Agent = {
  readonly Id: number
  readonly TurnHired: number
  readonly CurrentState: AgentState
  readonly MissionsSurvived: number
  readonly TurnsInTraining: number
  readonly RecoversIn: number
}

// kja3: if I would like to have a list of GameState type keys
// (recursively over all its children, including Assets keys etc.)
// for compile-time exhaustiveness checking, I could leverage 'keyof' and 'Uncapitalize':
// https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// And if I want to pick a subset:
// https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
// One idea is to have a function that takes as input GameState
// schema and requires defining a type for each each key.
// Like "GameStateRenderData" or similar.
// In pseudocode:
// For each key in GameState, recursively, define a function
// that takes as input an array of its value type (so for Money key it is going to be number[])
// and returns RenderData type, which says how to compute it and metadata like label and color.
// Note I said "array of its value type" because it is going to be an array of all its occurrences
// over time.