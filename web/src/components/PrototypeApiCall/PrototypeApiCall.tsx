/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react'

import type {
  Agent,
  GameStatePlayerView,
} from '../../types/GameStatePlayerView'

export type PrototypeApiCallProps = {
  readonly agents: readonly Agent[]
  readonly setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
}

export function PrototypeApiCall(
  props: PrototypeApiCallProps,
): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<GameStatePlayerView | null>(
    null,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const turnLimit = 1

  const queryString = `?turnLimit=${turnLimit}`

  const apiUrl = `${apiHost}/simulateGameSession${queryString}`

  async function fetchApiResponse(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data: GameStatePlayerView = await response.json()
      setApiResponse(data)
      props.setAgents(data.Assets.Agents)
    } catch (fetchError) {
      setError('Failed to fetch API response')
      console.error('There was an error!', fetchError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={fetchApiResponse} disabled={loading}>
        {loading ? 'Loading...' : 'Start Game Session'}
      </button>
      {error && <div>Error: {error}</div>}
      {apiResponse && (
        <div>
          <div>props.agents: </div>
          <pre> {JSON.stringify(props.agents, null, 2)} </pre>
          {/* Render your apiResponse game data here */}
          <div>apiResponse: </div>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
