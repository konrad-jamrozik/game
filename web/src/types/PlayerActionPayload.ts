// codesync: UfoGameLib.Api.PlayerActionPayload

export type PlayerActionPayload = {
  readonly Action: string
  readonly Ids?: number[]
  readonly TargetId?: number
}
