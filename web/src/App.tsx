import { Container, Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { useState } from 'react'
import { PrototypeChart } from './components/PrototypeChart'
import { RunSimulation } from './components/RunSimulation'
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
    <Typography component={'div'} sx={{ bgcolor: '#000020' }} gutterBottom>
      <Container maxWidth={false} sx={{ bgcolor: '#202020', my: 4 }}>
        <Grid container spacing={2} sx={{ bgcolor: '#333333' }}>
          <Grid
            xs={12}
            sx={{ bgcolor: '#200000' }}
            display="flex"
            justifyContent="center"
          >
            <RunSimulation
              {...{ agents, setAgents, turnLimit, setTurnLimit, setGameStates }}
            />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#002000' }}>
            <PrototypeChart gameStates={gameStates} />
          </Grid>
          {/* <SimulationOutputTable agents={agents} /> */}

          <Grid xs={12} sx={{ bgcolor: '#000020' }}>
            <Footer />
          </Grid>
        </Grid>
      </Container>
    </Typography>
  )
}
