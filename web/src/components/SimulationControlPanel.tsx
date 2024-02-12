/* eslint-disable max-lines */
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
import { Label } from './Label'

export type SimulationControlPanelProps = {
  readonly gameStates: readonly GameState[]
  readonly setGameStates: React.Dispatch<React.SetStateAction<GameState[]>>
}

const defaultStartTurn = 1
const defaultTargetTurn = 120

// eslint-disable-next-line max-lines-per-function
export function SimulationControlPanel(
  props: SimulationControlPanelProps,
): React.JSX.Element {
  const [startTurn, setStartTurn] = useState<number>(defaultStartTurn)
  const [targetTurn, setTargetTurn] = useState<number>(defaultTargetTurn)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>()

  function simulationRunMsg(): string {
    return `Simulation ran until turn ${getCurrentTurn(props.gameStates)}. Result: ${getGameResult(props.gameStates)}`
  }

  function reset(): void {
    setLoading(false)
    setError('')
    props.setGameStates([])
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
    <Card variant="outlined" sx={{ width: 500 }}>
      <CardHeader
        title="Simulation control panel"
        sx={{ paddingBottom: '0px' }}
      />
      <CardContent>
        <Grid container spacing={1}>
          <Grid xs={12}>
            <Label>{currentTurnLabel(props.gameStates)}</Label>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {advanceTimeButton(simulate, loading, props.gameStates)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {resetCurrentTurnButton(reset, loading)}
            </Grid>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {simulateFor1TurnButton(simulate, loading, props.gameStates)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {wipeSimulationButton(reset, loading)}
            </Grid>
          </Grid>

          <Grid>
            {simulateFromToTurnButton(simulate, loading, startTurn, targetTurn)}
          </Grid>
          <Grid container xsOffset={'auto'}>
            <Grid>{startTurnInputTextField(startTurn, setStartTurn)}</Grid>
            <Grid>{targetTurnInputTextField(targetTurn, setTargetTurn)}</Grid>
          </Grid>
          {!_.isEmpty(props.gameStates) && (
            <Grid xs={12}>
              <Label>{simulationRunMsg()}</Label>
            </Grid>
          )}
          {Boolean(error) && <Grid xs={12}>`Error: ${error}`</Grid>}
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
      : initialTurn - 1 + turnsToSimulate
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

function advanceTimeButton(
  simulate: (turnsToSimulate?: number) => Promise<void>,
  loading: boolean,
  gameStates: readonly GameState[],
): React.JSX.Element {
  return (
    <Button
      variant="contained"
      onClick={async () => simulate(1)}
      disabled={loading || (!_.isEmpty(gameStates) && isGameOver(gameStates))}
    >
      {'Advance 1 turn'}
    </Button>
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
      {'Delegate 1 turn to AI'}
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
      {`Delegate turns to AI:`}
    </Button>
  )
}

function resetCurrentTurnButton(
  reset: () => void,
  loading: boolean,
): React.JSX.Element {
  // kja implement properly setting this value
  const playerMadeActions = true
  return (
    <Button
      variant="outlined"
      onClick={reset}
      disabled={loading}
      color="warning"
    >
      {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        playerMadeActions ? `Reset current turn` : `Revert to previous turn`
      }
    </Button>
  )
}

function wipeSimulationButton(
  reset: () => void,
  loading: boolean,
): React.JSX.Element {
  return (
    <Button variant="outlined" onClick={reset} disabled={loading} color="error">
      {`Wipe simulation`}
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
