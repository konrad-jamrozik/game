/* eslint-disable sonarjs/prefer-immediate-return */
import _ from 'lodash'
import type { GameState } from '../../lib/GameState'
import type { PlayerActionPayload } from '../../lib/PlayerActionPayload'

// kja introduce a new class for managing gameStates history. Use it instead of passing around 'gameStates' and 'setGameStates'.
type CallPlayerActionApiParams = {
  readonly currentGameState: GameState | undefined
  readonly playerActionPayload: PlayerActionPayload
  readonly setLoading: React.Dispatch<React.SetStateAction<boolean>>
  readonly setError: React.Dispatch<React.SetStateAction<string | undefined>>
}
export async function callPlayerActionApi(
  params: CallPlayerActionApiParams,
): Promise<GameState | undefined> {
  params.setLoading(true)
  params.setError('')

  const { currentGameState, playerActionPayload } = params

  const apiUrl = getApplyPlayerActionApiUrl()
  const jsonBody: string = JSON.stringify(
    getApplyPlayerActionBody(playerActionPayload, currentGameState),
  )

  // kja dedup all this logic with 'simulate' function
  try {
    console.log(`apiUrl: ${apiUrl}, jsonBody: ${jsonBody}`)
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: jsonBody,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      const errorContents = await response.text()
      throw new Error(errorContents)
    }
    const resultGameState = (await response.json()) as GameState
    // kja here the logic will differ depending on if the player action is "Advance Time"
    // or is it something that keeps the same turn.
    // For now assuming it is advance time.
    return resultGameState
  } catch (fetchError: unknown) {
    params.setError((fetchError as Error).message)
    console.error(fetchError)
    return undefined
  } finally {
    params.setLoading(false)
  }
}

function getApplyPlayerActionApiUrl(): string {
  // kja dedup apiHost
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  return `${apiHost}/applyPlayerAction`
}

function getApplyPlayerActionBody(
  playerActionPayload: PlayerActionPayload,
  currentGameState?: GameState,
): { PlayerAction: PlayerActionPayload; GameState: GameState | undefined } {
  return { PlayerAction: playerActionPayload, GameState: currentGameState }
}
