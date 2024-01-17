export type GameStatePlayerView = {
  readonly Assets: Assets
}

export type Assets = {
  readonly Agents: Agent[]
}

export type Agent = {
  readonly Id: number
  readonly CurrentState: string
  readonly TurnHired: number
}
