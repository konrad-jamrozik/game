import { useState } from 'react'

import type { Agent, GameStatePlayerView } from '../types/GameStatePlayerView'

export type PrototypeApiCallProps = {
  readonly agents: readonly Agent[]
  readonly setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
}

export function PrototypeApiCall(
  props: PrototypeApiCallProps,
): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<GameStatePlayerView>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const turnLimit = 10

  const queryString = `?turnLimit=${turnLimit}`

  const apiUrl = `${apiHost}/simulateGameSession${queryString}`

  async function fetchApiResponse(): Promise<void> {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = (await response.json()) as GameStatePlayerView
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
      {Boolean(error) && <div>Error: {error}</div>}
      {apiResponse && (
        <div>
          <div>props.agents: </div>
          <pre> {props.agents.length} </pre>
          {/* <pre> {JSON.stringify(props.agents, null, 2)} </pre> */}
          {/* Render your apiResponse game data here */}
          <div>apiResponse: </div>
          {/* <pre>{JSON.stringify(apiResponse, null, 2)}</pre> */}
          <pre> {apiResponse.Assets.Agents.length} </pre>
        </div>
      )}
    </div>
  )
}