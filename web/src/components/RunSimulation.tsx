/* eslint-disable max-statements */
/* eslint-disable sonarjs/no-duplicate-string */
import { Button, Card, CardContent, TextField } from '@mui/material'
import _ from 'lodash'
import { useState } from 'react'
import {
  getStateAtTurn,
  getCurrentTurn,
  getGameResult,
  isGameOver,
} from '../lib/GameStateUtils'
import { initialTurn, type GameState } from '../types/GameState'

export type RunSimulationProps = {
  readonly gameStates: readonly GameState[]
  readonly setGameStates: React.Dispatch<React.SetStateAction<GameState[]>>
}

const defaultStartTurn = 1
const defaultTargetTurn = 50

// eslint-disable-next-line max-lines-per-function
export function RunSimulation(props: RunSimulationProps): React.JSX.Element {
  const [startTurn, setStartTurn] = useState<number>(defaultStartTurn)
  const [targetTurn, setTargetTurn] = useState<number>(defaultTargetTurn)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  function getMsg(): string {
    return `Simulation ran until turn ${getCurrentTurn(props.gameStates)}. Result: ${getGameResult(props.gameStates)}`
  }

  async function simulate(turnsToSimulate?: number): Promise<void> {
    setLoading(true)
    setError('')

    const currentTurn = !_.isEmpty(props.gameStates)
      ? getCurrentTurn(props.gameStates)
      : undefined

    let resolvedStartTurn: number = defaultStartTurn
    if (!_.isEmpty(props.gameStates)) {
      resolvedStartTurn = _.isUndefined(turnsToSimulate)
        ? _.min([currentTurn, startTurn])!
        : currentTurn!
    }

    const startNewSimulation = resolvedStartTurn === 1

    let resolvedTargetTurn: number = defaultStartTurn
    if (_.isUndefined(turnsToSimulate)) {
      resolvedTargetTurn = targetTurn
    } else {
      resolvedTargetTurn = !_.isUndefined(currentTurn)
        ? currentTurn + turnsToSimulate
        : initialTurn + turnsToSimulate
    }

    const apiUrl = getApiUrl(props, resolvedTargetTurn, startNewSimulation)
    const jsonBody: string = startNewSimulation
      ? ''
      : JSON.stringify(getStateAtTurn(props.gameStates, resolvedStartTurn))

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
        const gameStates = props.gameStates.slice(
          0,
          _.min([resolvedStartTurn, getCurrentTurn(props.gameStates)]),
        )
        props.setGameStates([...gameStates, ...allGameStates])
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
          onClick={async () => simulate()}
          disabled={loading || startTurn >= targetTurn}
        >
          {`Simulate turns ${startTurn} to ${targetTurn}`}
        </Button>
        <Button
          variant="outlined"
          onClick={async () => simulate(1)}
          disabled={
            loading ||
            (!_.isEmpty(props.gameStates) && isGameOver(props.gameStates))
          }
        >
          {'Simulate 1 turn'}
        </Button>
        <TextField
          id="textfield-start-turn"
          label="start turn"
          type="number"
          value={startTurn}
          onChange={(event: React.ChangeEvent) => {
            const target = event.target as HTMLInputElement
            setStartTurn(target.valueAsNumber)
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
        <TextField
          id="textfield-target-turn"
          label="target turn"
          type="number"
          value={targetTurn}
          onChange={(event: React.ChangeEvent) => {
            const target = event.target as HTMLInputElement
            setTargetTurn(target.valueAsNumber)
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
  targetTurn: number,
  startNewSimulation: boolean,
): string {
  const apiHost = import.meta.env.PROD
    ? 'https://game-api1.azurewebsites.net'
    : 'https://localhost:7128'

  const useNewGameSessionApi =
    startNewSimulation ||
    (!_.isEmpty(props.gameStates) &&
      getCurrentTurn(props.gameStates) === initialTurn)

  const queryString = `?includeAllStates=true&turnLimit=${targetTurn}`

  return `${apiHost}/simulateGameSession${useNewGameSessionApi ? '' : 'FromState'}${queryString}`
}
