import { Button, Card, CardContent, TextField } from '@mui/material'
import { useState } from 'react'
import type { Agent, GameState } from '../types/GameState'

export type RunSimulationProps = {
  readonly agents: readonly Agent[]
  readonly setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
  readonly turnLimit: number
  readonly setTurnLimit: React.Dispatch<React.SetStateAction<number>>
  readonly setGameStates: React.Dispatch<
    React.SetStateAction<GameState[]>
  >
}

export function RunSimulation(props: RunSimulationProps): React.JSX.Element {
  const [apiResponse, setApiResponse] = useState<GameState>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const [msg, setMsg] = useState<string>()

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
      const allGameStates = (await response.json()) as GameState[]
      const lastGameState = allGameStates.at(-1)!
      const gameResult = lastGameState.IsGameWon ? 'won' : (lastGameState.IsGameLost ? 'lost' : 'undecided')
      setMsg(`Simulation ended at turn ${lastGameState.Timeline.CurrentTurn}. Result: ${gameResult}`)
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
    <Card variant="outlined" sx={{ maxWidth: '400px' }}>
      <CardContent>
        <Button
          variant="outlined"
          onClick={fetchApiResponse}
          disabled={loading}
        >
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
            max: 300,
            step: 1,
          }}
        />
        {Boolean(error) && <div>Error: {error}</div>}
        {apiResponse && <div>{msg}</div>}
      </CardContent>
    </Card>
  )
}
