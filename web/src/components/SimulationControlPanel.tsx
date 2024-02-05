import { Button, Card, CardContent, CardHeader, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import {
  getCurrentTurn,
  getGameResult,
  getStateAtTurn,
  isGameOver,
} from '../lib/GameStateUtils'
import { initialTurn, type GameState } from '../types/GameState'

export type SimulationControlPanelProps = {
  readonly gameStates: readonly GameState[]
  readonly setGameStates: React.Dispatch<React.SetStateAction<GameState[]>>
}

const defaultStartTurn = 1
const defaultTargetTurn = 50

export function SimulationControlPanel(
  props: SimulationControlPanelProps,
): React.JSX.Element {
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

    const { resolvedStartTurn, resolvedTargetTurn } = resolveStartAndTargetTurn(
      props.gameStates,
      startTurn,
      targetTurn,
      turnsToSimulate,
    )
    const startNewSimulation = resolvedStartTurn === 1

    const apiUrl = getApiUrl(props, resolvedTargetTurn, startNewSimulation)
    const jsonBody: string = !startNewSimulation
      ? JSON.stringify(getStateAtTurn(props.gameStates, resolvedStartTurn))
      : ''

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
    <Card variant="outlined" sx={{ maxWidth: '480px' }}>
      <CardHeader
        title="Simulation"
        sx={{ paddingTop: '8px', paddingBottom: '0px' }}
      />
      <CardContent>
        <Grid container spacing={1}>
          <Grid xs={12}>{currentTurnLabel(props.gameStates)}</Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {simulateFor1TurnButton(simulate, loading, props.gameStates)}
            </Grid>
            <Grid xsOffset={'auto'}>{resetButton(loading)}</Grid>
          </Grid>

          <Grid>
            {simulateFromToTurnButton(simulate, loading, startTurn, targetTurn)}
          </Grid>
          <Grid container xsOffset={'auto'}>
            <Grid>{startTurnInputTextField(startTurn, setStartTurn)}</Grid>
            <Grid>{targetTurnInputTextField(targetTurn, setTargetTurn)}</Grid>
          </Grid>
          <Grid>{!_.isEmpty(props.gameStates) && getMsg()}</Grid>
          <Grid>{Boolean(error) && `Error: ${error}`}</Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

function resolveStartAndTargetTurn(
  gameStates: readonly GameState[],
  startTurn: number,
  targetTurn: number,
  turnsToSimulate?: number,
): {
  resolvedStartTurn: number
  resolvedTargetTurn: number
} {
  const currentTurn = !_.isEmpty(gameStates)
    ? getCurrentTurn(gameStates)
    : undefined

  let resolvedStartTurn: number = defaultStartTurn
  if (!_.isEmpty(gameStates)) {
    resolvedStartTurn = _.isUndefined(turnsToSimulate)
      ? _.min([currentTurn, startTurn])!
      : currentTurn!
  }

  let resolvedTargetTurn: number = defaultStartTurn
  if (_.isUndefined(turnsToSimulate)) {
    resolvedTargetTurn = targetTurn
  } else {
    resolvedTargetTurn = !_.isUndefined(currentTurn)
      ? currentTurn + turnsToSimulate
      : initialTurn + turnsToSimulate
  }
  return { resolvedStartTurn, resolvedTargetTurn }
}

function currentTurnLabel(gameStates: readonly GameState[]): string {
  return `Current turn: ${
    !_.isEmpty(gameStates) ? getCurrentTurn(gameStates) : 'N/A'
  }`
}

function startTurnInputTextField(
  startTurn: number,
  setStartTurn: React.Dispatch<React.SetStateAction<number>>,
): React.JSX.Element {
  return (
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
  )
}

function targetTurnInputTextField(
  targetTurn: number,
  setTargetTurn: React.Dispatch<React.SetStateAction<number>>,
): React.JSX.Element {
  return (
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
  )
}

function simulateFor1TurnButton(
  simulate: (turnsToSimulate?: number) => Promise<void>,
  loading: boolean,
  gameStates: readonly GameState[],
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => simulate(1)}
      disabled={loading || (!_.isEmpty(gameStates) && isGameOver(gameStates))}
    >
      {'Simulate 1 turn'}
    </Button>
  )
}

function simulateFromToTurnButton(
  simulate: (turnsToSimulate?: number) => Promise<void>,
  loading: boolean,
  startTurn: number,
  targetTurn: number,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => simulate()}
      disabled={loading || startTurn >= targetTurn}
    >
      {`Simulate turns: ${startTurn} to ${targetTurn}`}
    </Button>
  )
}

function resetButton(loading: boolean): React.JSX.Element {
  return (
    <Button variant="outlined" disabled={loading}>
      {`Reset`}
    </Button>
  )
}

function getApiUrl(
  props: SimulationControlPanelProps,
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
