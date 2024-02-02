/* eslint-disable sonarjs/no-duplicate-string */
import { Button, Card, CardContent, TextField } from '@mui/material'
import _ from 'lodash'
import { useState } from 'react'
import {
  getCurrentState,
  getCurrentTurn,
  getGameResult,
} from '../lib/GameStateUtils'
import { initialTurn, type GameState } from '../types/GameState'

export type RunSimulationProps = {
  readonly targetTurn: number
  readonly setTargetTurn: React.Dispatch<React.SetStateAction<number>>
  readonly gameStates: readonly GameState[]
  readonly setGameStates: React.Dispatch<React.SetStateAction<GameState[]>>
}

// eslint-disable-next-line max-lines-per-function
export function RunSimulation(props: RunSimulationProps): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  function getMsg(): string {
    return `Simulation ran until turn ${getCurrentTurn(props.gameStates)}. Result: ${getGameResult(props.gameStates)}`
  }

  function revertSimulation(): void {
    props.setGameStates(props.gameStates.slice(0, props.targetTurn))
  }

  async function simulate(startNewSimulation: boolean): Promise<void> {
    setLoading(true)
    setError('')

    const apiUrl = getApiUrl(props, startNewSimulation)
    const jsonBody: string = startNewSimulation
      ? ''
      : JSON.stringify(getCurrentState(props.gameStates))

    try {
      console.log(`apiUrl: ${apiUrl}`)
      const response = startNewSimulation
        ? await fetch(apiUrl)
        : await fetch(apiUrl, {
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
      const allGameStates = (await response.json()) as GameState[]
      if (startNewSimulation) {
        props.setGameStates(allGameStates)
      } else {
        props.setGameStates([...props.gameStates, ...allGameStates])
      }
    } catch (fetchError: unknown) {
      setError((fetchError as Error).message)
      console.error(fetchError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card variant="outlined" sx={{ maxWidth: '400px' }}>
      <CardContent>
        <Button
          variant="outlined"
          onClick={async () => simulate(true)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New simulation'}
        </Button>
        <Button
          variant="outlined"
          onClick={async () => simulate(false)}
          disabled={
            loading ||
            _.isEmpty(props.gameStates) ||
            props.targetTurn <= getCurrentTurn(props.gameStates)
          }
        >
          {loading ? 'Loading...' : `Simulate to turn ${props.targetTurn}`}
        </Button>
        <Button
          variant="outlined"
          onClick={revertSimulation}
          disabled={
            loading ||
            _.isEmpty(props.gameStates) ||
            props.targetTurn >= getCurrentTurn(props.gameStates)
          }
        >
          {loading ? 'Loading...' : `Revert to turn ${props.targetTurn}`}
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

function getApiUrl(
  props: RunSimulationProps,
  startNewSimulation: boolean,
): string {
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const useNewGameSessionApi =
    startNewSimulation ||
    (!_.isEmpty(props.gameStates) &&
      getCurrentTurn(props.gameStates) === initialTurn)

  const queryString = `?includeAllStates=true&turnLimit=${props.targetTurn}`

  return `${apiHost}/simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}${queryString}`
}
