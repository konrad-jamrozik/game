import { Link, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import { AgentsDataGrid } from './components/AgentsDataGrid/AgentsDataGrid'
import { AssetsDataGrid } from './components/AssetsDataGrid/AssetsDataGrid'
import { GameStatsLineChart } from './components/GameStatsLineChart'
import { MissionSitesDataGrid } from './components/MissionSitesDataGrid/MissionSitesDataGrid'
import { SimulationControlPanel } from './components/SimulationControlPanel/SimulationControlPanel'
import { useGameSession } from './lib/GameSession'
import {
  agentStatsDataSeries,
  intelStatsDataSeries,
  miscStatsDataSeries,
  missionsStatsDataSeries,
  moneyStatsDataSeries,
} from './lib/GameStateDataSeries'
import { getCurrentState } from './lib/GameStateUtils'

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

const lineChartAspectRatio = '1.5'
const lineChartMaxWidth = '700px'

// eslint-disable-next-line max-lines-per-function
export default function App(): React.JSX.Element {
  const gameSession = useGameSession()
  // kja gameStates nor agents should be gotten out of gameSession.
  // Instead, the consumer code should make calls on gameSession methods.
  const gameStates = gameSession.getGameStates()
  const agents = !_.isEmpty(gameStates)
    ? getCurrentState(gameStates).Assets.Agents
    : []

  return (
    <Grid
      container
      justifyContent={'center'}
      spacing={2}
      marginTop={2}
      marginX={0}
      bgcolor={'#303030'}
    >
      <Grid sx={{ bgcolor: '#200000' }}>
        <SimulationControlPanel gameSession={gameSession} />
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
          agents={agents}
        />
      </Grid>
      <Grid sx={{ bgcolor: '#002040' }}>
        <AgentsDataGrid agents={agents} />
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          bgcolor: '#003000',
          aspectRatio: lineChartAspectRatio,
          maxWidth: lineChartMaxWidth,
        }}
      >
        <GameStatsLineChart
          gameStates={gameStates}
          dataSeries={moneyStatsDataSeries}
        />
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          bgcolor: '#303000',
          aspectRatio: lineChartAspectRatio,
          maxWidth: lineChartMaxWidth,
        }}
      >
        <GameStatsLineChart
          gameStates={gameStates}
          dataSeries={agentStatsDataSeries}
        />
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          bgcolor: '#402000',
          aspectRatio: lineChartAspectRatio,
          maxWidth: lineChartMaxWidth,
        }}
      >
        <GameStatsLineChart
          gameStates={gameStates}
          dataSeries={intelStatsDataSeries}
        />
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          bgcolor: '#002040',
          aspectRatio: lineChartAspectRatio,
          maxWidth: lineChartMaxWidth,
        }}
      >
        <GameStatsLineChart
          gameStates={gameStates}
          dataSeries={miscStatsDataSeries}
        />
      </Grid>
      <Grid
        xs={12}
        lg={6}
        sx={{
          bgcolor: '#003030',
          aspectRatio: lineChartAspectRatio,
          maxWidth: lineChartMaxWidth,
        }}
      >
        <GameStatsLineChart
          gameStates={gameStates}
          dataSeries={missionsStatsDataSeries}
        />
      </Grid>
      <Grid xs={12} sx={{ bgcolor: '#300020' }}>
        <Footer />
      </Grid>
    </Grid>
  )
}
