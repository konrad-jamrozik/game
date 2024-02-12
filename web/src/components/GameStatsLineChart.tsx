import { Box, useMediaQuery, useTheme } from '@mui/material'
import type { LegendRendererProps, LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameState } from '../types/GameState'
import type { GameStateDataSeries } from '../types/GameStateDataSeries'
import type { MakeOptional } from '../types/external'

export type GameStatsLineChartProps = {
  readonly gameStates: readonly GameState[]
  readonly dataSeries: readonly GameStateDataSeries[]
}

type DataSetEntry = {
  [key: string]: number
  turn: number
}

export function GameStatsLineChart(
  props: GameStatsLineChartProps,
): React.JSX.Element {
  const series: MakeOptional<LineSeriesType, 'type'>[] = _.map(
    props.dataSeries,
    (ds) => ({
      dataKey: ds.key,
      label: ds.label,
      color: ds.color,
      showMark: false,
    }),
  )

  const dataset: DataSetEntry[] = _.map(props.gameStates, (gs) => {
    const obj: DataSetEntry = {
      turn: gs.Timeline.CurrentTurn,
      ..._.mapValues(
        _.keyBy(props.dataSeries, (ds) => ds.key),
        (ds) => ds.dataFunc(gs),
      ),
    }
    return obj
  })

  const maxTurn = _.maxBy(dataset, (dse: DataSetEntry) => dse.turn)?.turn
  const defaultXAxisMax = 10
  const xAxisMax = maxTurn ?? defaultXAxisMax

  function getMaximum(dse: DataSetEntry): number {
    return _.defaultTo(_.max(_.values(_.omit(dse, 'turn'))), 0)
  }
  const defaultYAxisMax = 10
  const yAxisMax = _.defaultTo(
    _.max(_.map(dataset, getMaximum)),
    defaultYAxisMax,
  )

  // https://mui.com/material-ui/react-use-media-query/
  const theme = useTheme()
  const smallDisplay = useMediaQuery(theme.breakpoints.down('sm'))
  const smallDisplayLegendProps: Partial<LegendRendererProps> = {
    itemMarkWidth: 12,
    itemMarkHeight: 12,
    labelStyle: { fontSize: 12 },
    padding: { bottom: 0 },
  }

  return (
    <Box width={'100%'} height={'100%'}>
      <LineChart
        sx={{ bgcolor: '#161616' }}
        xAxis={[
          {
            dataKey: 'turn',
            label: 'Turn',
            scaleType: 'linear',
            min: 1,
            max: xAxisMax,
          },
        ]}
        yAxis={[
          {
            scaleType: 'linear',
            min: 0,
            max: yAxisMax,
          },
        ]}
        series={series}
        dataset={dataset}
        slotProps={{
          legend: smallDisplay ? smallDisplayLegendProps : {},
        }}
      />
    </Box>
  )
}
