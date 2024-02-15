import type { GameState } from './GameState'
import type { PlayerActionPayload } from './PlayerActionPayload'
import {
  type FetchCallbacks,
  callApi,
  getApiUrl,
  getPostJsonRequest,
} from './callApi'

export async function callApiToAdvanceTimeBy1Turn(
  params: FetchCallbacks & { currentGameState?: GameState | undefined },
): Promise<GameState | undefined> {
  return callApplyPlayerActionApi({
    ...params,
    playerActionPayload: { Action: 'AdvanceTime' },
    currentGameState: params.currentGameState,
  })
}

export async function log(req: Request, pretty?: boolean): Promise<string> {
  const text = await req.clone().text()

  if (pretty ?? false) {
    // JSON.parse here is to avoid escaping of quotes. See
    // https://chat.openai.com/share/d6abd2a4-0265-4ea2-8bbb-f30eeee0f787
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsed = JSON.parse(text)
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const stringified = JSON.stringify(parsed, undefined, 2)
    return stringified
  }
  return text
}

async function callApplyPlayerActionApi(
  params: FetchCallbacks & {
    playerActionPayload: PlayerActionPayload
    currentGameState?: GameState | undefined
  },
): Promise<GameState | undefined> {
  const apiPath = 'applyPlayerAction'
  const apiQuery = ''
  const jsonBody: string = JSON.stringify(
    getApplyPlayerActionBody(
      params.playerActionPayload,
      params.currentGameState,
    ),
  )
  const apiUrl = getApiUrl(apiPath, apiQuery)
  const request = getPostJsonRequest(apiUrl, jsonBody)
  return callApi<GameState>({ ...params, request })
}

function getApplyPlayerActionBody(
  playerActionPayload: PlayerActionPayload,
  currentGameState?: GameState,
): { PlayerAction: PlayerActionPayload; GameState: GameState | undefined } {
  return { PlayerAction: playerActionPayload, GameState: currentGameState }
}
