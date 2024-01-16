/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useState } from 'react'

export interface PrototypeApiCallProps {
  readonly prop?: string
}

export function PrototypeApiCall({
  prop = 'default value',
}: PrototypeApiCallProps): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<string>('')
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
      const data = await response.json()
      setApiResponse(data)
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
          <div> {prop} </div>
          {/* Render your apiResponse game data here */}
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
