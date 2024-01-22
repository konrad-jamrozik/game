/* eslint-disable github/array-foreach */
/* eslint-disable unicorn/no-array-for-each */
import type { LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameStateDataSeries } from '../types/GameStateDataSeries'
import type { GameStatePlayerView } from '../types/GameStatePlayerView'
import type { MakeOptional } from '../types/external'

export type GameStatsLineChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
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
    const obj: DataSetEntry = { turn: gs.CurrentTurn }
    // kja replace this foreach with declarative code (probably will have to use splatting ...)
    _.forEach(props.dataSeries, (ds) => {
      obj[ds.key] = ds.dataFunc(gs)
    })
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

  return (
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
      height={500}
    />
  )
}
