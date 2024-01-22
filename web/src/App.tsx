import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Fragment, useState } from 'react'
import { PrototypeChart } from './components/PrototypeChart'
import { RunSimulation } from './components/RunSimulation'
import { SimulationOutputTable } from './components/SimulationOutputTable'
import type { Agent, GameStatePlayerView } from './types/GameStatePlayerView'

const defaultTurnLimit = 10

function Footer(): React.JSX.Element {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Game by '}
      <Link color="inherit" href="https://github.com/konrad-jamrozik/">
        Konrad Jamrozik
      </Link>{' '}
      {new Date().getFullYear()}.
    </Typography>
  )
}

export default function App(): React.JSX.Element {
  const [agents, setAgents] = useState<Agent[]>([
    { Id: 42, CurrentState: 'Happy', TurnHired: 66 },
  ])
  const [turnLimit, setTurnLimit] = useState<number>(defaultTurnLimit)
  const [gameStates, setGameStates] = useState<GameStatePlayerView[]>([])
  return (
    <Container maxWidth={false} sx={{ bgcolor: '#202020', my: 4 }}>
      <Typography component={'span'} gutterBottom>
        <Fragment>
          <RunSimulation
            {...{ agents, setAgents, turnLimit, setTurnLimit, setGameStates }}
          />
          <PrototypeChart gameStates={gameStates} />
          <SimulationOutputTable agents={agents} />
        </Fragment>
      </Typography>
      <Footer />
    </Container>
  )
}
