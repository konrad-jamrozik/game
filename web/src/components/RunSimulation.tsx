import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import type { Agent, GameStatePlayerView } from '../types/GameStatePlayerView'

export type RunSimulationProps = {
  readonly agents: readonly Agent[]
  readonly setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
  readonly turnLimit: number
  readonly setTurnLimit: React.Dispatch<React.SetStateAction<number>>
  readonly setGameStates: React.Dispatch<
    React.SetStateAction<GameStatePlayerView[]>
  >
}

export function RunSimulation(props: RunSimulationProps): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<GameStatePlayerView>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const queryString = `?includeAllStates=true&turnLimit=${props.turnLimit}`

  const apiUrl = `${apiHost}/simulateGameSession${queryString}`

  async function fetchApiResponse(): Promise<void> {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const allGameStates = (await response.json()) as GameStatePlayerView[]
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const lastGameState = allGameStates.at(-1)!
      setApiResponse(lastGameState)
      props.setAgents(lastGameState.Assets.Agents)
      props.setGameStates(allGameStates)
    } catch (fetchError) {
      setError('Failed to fetch API response')
      console.error('There was an error!', fetchError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="outlined" onClick={fetchApiResponse} disabled={loading}>
        {loading ? 'Loading...' : 'Start Game Session'}
      </Button>
      <TextField
        id="textfield-turnLimit"
        label="turn limit"
        type="number"
        value={props.turnLimit}
        onChange={(event: React.ChangeEvent) => {
          const target = event.target as HTMLInputElement
          props.setTurnLimit(target.valueAsNumber)
        }}
        InputLabelProps={{
          shrink: true,
        }}
        inputProps={{
          min: 1,
          max: 100,
          step: 1,
        }}
      />
      {Boolean(error) && <div>Error: {error}</div>}
      {apiResponse && (
        <div>
          <div>agents count from props: </div>
          <pre> {props.agents.length} </pre>
          {/* <pre> {JSON.stringify(props.agents, null, 2)} </pre> */}
          <div>agents count from API: </div>
          {/* <pre>{JSON.stringify(apiResponse, null, 2)}</pre> */}
          <pre> {apiResponse.Assets.Agents.length} </pre>
        </div>
      )}
    </>
  )
}