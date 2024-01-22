/* eslint-disable github/array-foreach */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable max-lines-per-function */
import type { LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameStatePlayerView } from '../types/GameStatePlayerView'
import type { MakeOptional } from '../types/external'

export type GameStatsLineChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

type GameStateDataSeries = {
  key: string
  dataFunc: (gs: GameStatePlayerView) => number
  label: string
  color: string
}

type DataSetEntry = {
  [key: string]: number
  turn: number
}

export function GameStatsLineChart(
  props: GameStatsLineChartProps,
): React.JSX.Element {
  // kja todo dataSeries is to be passed in input props
  const dataSeries: GameStateDataSeries[] = [
    {
      key: 'agents',
      dataFunc: (gs) => _.size(gs.Assets.Agents),
      label: 'Agents',
      color: 'darkgreen',
    },
    {
      key: 'inTraining',
      dataFunc: (gs) =>
        _.size(
          _.filter(
            gs.Assets.Agents,
            (agent) => agent.CurrentState === 'Training',
          ),
        ),
      label: 'InTraining',
      color: 'purple',
    },
    {
      key: 'generatingIncome',
      dataFunc: (gs) =>
        _.size(
          _.filter(
            gs.Assets.Agents,
            (agent) => agent.CurrentState === 'GeneratingIncome',
          ),
        ),
      label: 'GeneratingIncome',
      color: 'gold',
    },
    {
      key: 'gatheringIntel',
      dataFunc: (gs) =>
        _.size(
          _.filter(
            gs.Assets.Agents,
            (agent) => agent.CurrentState === 'GatheringIntel',
          ),
        ),
      label: 'GatheringIntel',
      color: 'dodgerblue',
    },
    {
      key: 'recovering',
      dataFunc: (gs) =>
        _.size(
          _.filter(
            gs.Assets.Agents,
            (agent) => agent.CurrentState === 'Recovering',
          ),
        ),
      label: 'Recovering',
      color: 'crimson',
    },
  ]

  const series: MakeOptional<LineSeriesType, 'type'>[] = _.map(
    dataSeries,
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
    _.forEach(dataSeries, (ds) => {
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const yAxisMax = _.max(_.map(dataset, getMaximum))!

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
