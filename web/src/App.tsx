import { Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { useState } from 'react'
import { AgentsDataGrid } from './components/AgentsDataGrid'
import { AssetsDataGrid } from './components/AssetsDataGrid'
import { GameStatsLineChart } from './components/GameStatsLineChart'
import { MissionSitesDataGrid } from './components/MissionSitesDataGrid'
import { SimulationControlPanel } from './components/SimulationControlPanel'
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
      <Grid
        container
        justifyContent={'center'}
        spacing={2}
        marginTop={2}
        marginX={0}
        bgcolor={'#303030'}
      >
        <Grid sx={{ bgcolor: '#200000' }}>
          <SimulationControlPanel {...{ gameStates, setGameStates }} />
        </Grid>
        <Grid sx={{ bgcolor: '#300030' }}>
          <AssetsDataGrid
            assets={
              !_.isEmpty(gameStates)
                ? getCurrentState(gameStates).Assets
                : undefined
            }
          />
        </Grid>
        <Grid sx={{ bgcolor: '#302000' }}>
          <MissionSitesDataGrid
            missionSites={
              !_.isEmpty(gameStates)
                ? getCurrentState(gameStates).MissionSites
                : undefined
            }
          />
        </Grid>
        <Grid sx={{ bgcolor: '#002040' }}>
          <AgentsDataGrid agents={agents} />
        </Grid>
        <Grid xs={12} lg={6} sx={{ bgcolor: '#003000' }}>
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={moneyStatsDataSeries}
          />
        </Grid>
        <Grid xs={12} lg={6} sx={{ bgcolor: '#303000' }}>
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={agentStatsDataSeries}
          />
        </Grid>
        <Grid xs={12} lg={6} sx={{ bgcolor: '#402000' }}>
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={intelStatsDataSeries}
          />
        </Grid>
        <Grid xs={12} lg={6} sx={{ bgcolor: '#002040' }}>
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={miscStatsDataSeries}
          />
        </Grid>
        <Grid xs={12} lg={6} sx={{ bgcolor: '#003030' }}>
          <GameStatsLineChart
            gameStates={gameStates}
            dataSeries={missionsStatsDataSeries}
          />
        </Grid>
        <Grid xs={12} sx={{ bgcolor: '#300020' }}>
          <Footer />
        </Grid>
      </Grid>
    </Typography>
  )
}
