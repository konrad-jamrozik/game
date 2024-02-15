/* eslint-disable max-lines */
import { Button, Card, CardContent, CardHeader, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import type { GameSession } from '../../lib/GameSession'
import type { GameState } from '../../lib/GameState'
import {
  getCurrentTurn,
  getGameResult,
  isGameOver,
} from '../../lib/GameStateUtils'
import { Label } from '../Label'
import { simulate } from './simulate'

export type SimulationControlPanelProps = {
  readonly gameSession: GameSession
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
  const gameStates = props.gameSession.getGameStates()

  function simulationRunMsg(): string {
    return `Simulation ran until turn ${getCurrentTurn(gameStates)}. Result: ${getGameResult(gameStates)}`
  }

  async function simulateTurns(turnsToSimulate?: number): Promise<void> {
    const newGameStates = await simulate({
      gameStates,
      setLoading,
      setError,
      startTurn,
      targetTurn,
      turnsToSimulate,
    })
    if (!_.isUndefined(newGameStates)) {
      props.gameSession.setGameStates(newGameStates)
    }
  }

  async function advanceTimeBy1Turn(): Promise<void> {
    await props.gameSession.advanceTimeBy1Turn(setLoading, setError)
  }

  function reset(): void {
    setLoading(false)
    setError('')
    props.gameSession.setGameStates([])
  }

  return (
    <Card
      variant="outlined"
      sx={{
        maxWidth: 440,
        width: '100%',
      }}
    >
      <CardHeader
        title="Simulation control panel"
        sx={{ paddingBottom: '0px' }}
      />
      <CardContent>
        <Grid container spacing={1}>
          <Grid xs={12}>
            <Label>{currentTurnLabel(gameStates)}</Label>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {advanceTimeButton(advanceTimeBy1Turn, loading, gameStates)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {resetCurrentTurnButton(reset, loading)}
            </Grid>
          </Grid>
          <Grid container xs={12} marginBottom={'0px'}>
            <Grid>
              {simulateFor1TurnButton(simulateTurns, loading, gameStates)}
            </Grid>
            <Grid xsOffset={'auto'}>
              {wipeSimulationButton(reset, loading)}
            </Grid>
          </Grid>

          <Grid>
            {simulateFromToTurnButton(
              simulateTurns,
              loading,
              startTurn,
              targetTurn,
            )}
          </Grid>
          <Grid container xsOffset={'auto'}>
            <Grid>{startTurnInputTextField(startTurn, setStartTurn)}</Grid>
            <Grid>{targetTurnInputTextField(targetTurn, setTargetTurn)}</Grid>
          </Grid>
          {!_.isEmpty(gameStates) && (
            <Grid xs={12}>
              <Label>{simulationRunMsg()}</Label>
            </Grid>
          )}
          {Boolean(error) && <Grid xs={12}>Error: {error}</Grid>}
        </Grid>
      </CardContent>
    </Card>
  )
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
      sx={{ width: 90 }}
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
      sx={{ width: 90 }}
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
  advanceTimeBy1Turn: () => Promise<void>,
  loading: boolean,
  gameStates: readonly GameState[],
): React.JSX.Element {
  return (
    <Button
      variant="contained"
      onClick={advanceTimeBy1Turn}
      disabled={loading || (!_.isEmpty(gameStates) && isGameOver(gameStates))}
    >
      {'Advance 1 turn!'}
    </Button>
  )
}

function simulateFor1TurnButton(
  simulateTurns: (turnsToSimulate?: number) => Promise<void>,
  loading: boolean,
  gameStates: readonly GameState[],
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => simulateTurns(1)}
      disabled={loading || (!_.isEmpty(gameStates) && isGameOver(gameStates))}
    >
      {'Delegate 1 turn to AI'}
    </Button>
  )
}

function simulateFromToTurnButton(
  simulateTurns: (turnsToSimulate?: number) => Promise<void>,
  loading: boolean,
  startTurn: number,
  targetTurn: number,
): React.JSX.Element {
  return (
    <Button
      variant="outlined"
      onClick={async () => simulateTurns()}
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
