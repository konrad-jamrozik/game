import Grid from '@mui/material/Unstable_Grid2'
import { Fragment } from 'react/jsx-runtime'
import {
  agentStatsDataSeries,
  intelStatsDataSeries,
  miscStatsDataSeries,
  missionsStatsDataSeries,
  moneyStatsDataSeries,
} from '../lib/GameStateDataSeries'
import { useGameSessionContext } from '../lib/gameSession/GameSession'
import { GameStatsLineChart } from './GameStatsLineChart'

const lineChartAspectRatio = '1.5'
const lineChartMaxWidth = '700px'

export function Charts(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gameStates = gameSession.getGameStates()
  return (
    <Fragment>
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
    </Fragment>
  )
}
