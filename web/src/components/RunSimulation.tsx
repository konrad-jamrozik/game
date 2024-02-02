import { Button, Card, CardContent, TextField } from '@mui/material'
import _ from 'lodash'
import { useState } from 'react'
import type { GameState } from '../types/GameState'

export type RunSimulationProps = {
  readonly targetTurn: number
  readonly setTargetTurn: React.Dispatch<React.SetStateAction<number>>
  readonly gameStates: readonly GameState[]
  readonly setGameStates: React.Dispatch<
    React.SetStateAction<GameState[]>
  >
}

export function RunSimulation(props: RunSimulationProps): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const queryString = `?includeAllStates=true&turnLimit=${props.targetTurn}`

  const apiUrl = `${apiHost}/simulateGameSession${queryString}`

  function getMsg(): string {
    const lastGameState = props.gameStates.at(-1)!
    const gameResult = lastGameState.IsGameWon ? 'won' : (lastGameState.IsGameLost ? 'lost' : 'undecided')
    return `Simulation ran until turn ${lastGameState.Timeline.CurrentTurn}. Result: ${gameResult}`
  }

  async function simulate(): Promise<void> {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const allGameStates = (await response.json()) as GameState[]
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
          onClick={simulate}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New simulation'}
        </Button>
        <Button
          variant="outlined"
          onClick={simulate}
          disabled={loading}
        >
          {loading ? 'Loading...' : `Simulate to turn ${props.targetTurn}`}
        </Button>        
        <TextField
          id="textfield-turns"
          label="target turn"
          type="number"
          value={props.targetTurn}
          onChange={(event: React.ChangeEvent) => {
            const target = event.target as HTMLInputElement
            props.setTargetTurn(target.valueAsNumber)
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
        {!_.isEmpty(props.gameStates) && <div>{getMsg()}</div>}
      </CardContent>
    </Card>
  )
}
