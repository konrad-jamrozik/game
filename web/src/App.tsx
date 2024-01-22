import { Container, Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { useState } from 'react'
import { AgentStatsChart } from './components/AgentStatsChart'
import { MoneyStatsChart } from './components/MoneyStatsChart'
import { PrototypeChart } from './components/PrototypeChart'
import { RunSimulation } from './components/RunSimulation'
import type { Agent, GameStatePlayerView } from './types/GameStatePlayerView'

const defaultTurnLimit = 300

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
  const [agents, setAgents] = useState<Agent[]>([])
  const [turnLimit, setTurnLimit] = useState<number>(defaultTurnLimit)
  const [gameStates, setGameStates] = useState<GameStatePlayerView[]>([])
  return (
    <Typography component={'span'} sx={{ bgcolor: '#000020' }} gutterBottom>
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
            <MoneyStatsChart gameStates={gameStates} />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#202000' }}>
            <AgentStatsChart gameStates={gameStates} />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#202000' }}>
            <PrototypeChart gameStates={gameStates} />
          </Grid>
          <Grid xs={12} sx={{ bgcolor: '#000020' }}>
            <Footer />
          </Grid>
        </Grid>
      </Container>
    </Typography>
  )
}
