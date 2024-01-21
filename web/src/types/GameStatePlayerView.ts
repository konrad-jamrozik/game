export type GameStatePlayerView = {
  readonly Assets: Assets
  readonly CurrentTurn: number
}

export type Assets = {
  readonly Money: number
  readonly Agents: Agent[]
}

export type Agent = {
  readonly Id: number
  readonly CurrentState: string
  readonly TurnHired: number
}
