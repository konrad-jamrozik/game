import { Container, Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import { AgentsDataGrid } from './components/AgentsDataGrid'
import { GameStatsLineChart } from './components/GameStatsLineChart'
import { RunSimulation } from './components/RunSimulation'
import { getCurrentState } from './lib/GameStateUtils'
import type { GameState } from './types/GameState'
import {
  agentStatsDataSeries,
  intelStatsDataSeries,
  miscStatsDataSeries,
  missionsStatsDataSeries,
  moneyStatsDataSeries,
} from './types/GameStateDataSeries'

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
  const [gameStates, setGameStates] = useState<GameState[]>([])
  const agents = !_.isEmpty(gameStates)
    ? getCurrentState(gameStates).Assets.Agents
    : []

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
            <RunSimulation {...{ gameStates, setGameStates }} />
          </Grid>
          <Grid
            xs={6}
            sx={{ bgcolor: '#000000' }}
            display="flex"
            justifyContent="center"
          >
            <AgentsDataGrid agents={agents} />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#002000' }}>
            <GameStatsLineChart
              gameStates={gameStates}
              dataSeries={moneyStatsDataSeries}
            />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#202000' }}>
            <GameStatsLineChart
              gameStates={gameStates}
              dataSeries={agentStatsDataSeries}
            />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#202000' }}>
            <GameStatsLineChart
              gameStates={gameStates}
              dataSeries={intelStatsDataSeries}
            />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#002000' }}>
            <GameStatsLineChart
              gameStates={gameStates}
              dataSeries={miscStatsDataSeries}
            />
          </Grid>
          <Grid xs={6} sx={{ bgcolor: '#202000' }}>
            <GameStatsLineChart
              gameStates={gameStates}
              dataSeries={missionsStatsDataSeries}
            />
          </Grid>
          <Grid xs={12} sx={{ bgcolor: '#000020' }}>
            <Footer />
          </Grid>
        </Grid>
      </Container>
    </Typography>
  )
}
