import type { LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameStatePlayerView } from '../types/GameStatePlayerView'
import type { MakeOptional } from '../types/external'

const defaultXAxisMax = 10
const defaultYAxisMax = 100

const agentUpkeepCost = 5 // codesync UfoGameLib.Model.Ruleset.AgentUpkeepCost

export type PrototypeChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

export function PrototypeChart(props: PrototypeChartProps): React.JSX.Element {
  const dataSet: { turn: number; money: number; upkeepCost: number }[] = _.map(
    props.gameStates,
    (gs) => ({
      turn: gs.CurrentTurn,
      money: gs.Assets.Money,
      upkeepCost: _.size(gs.Assets.Agents) * agentUpkeepCost,
    }),
  )

  const seriesLabels: { [key: string]: string } = {
    money: 'Money',
    upkeepCost: 'Upkeep',
  }

  const series: MakeOptional<LineSeriesType, 'type'>[] = _.map(
    _.keys(seriesLabels),
    (key: string) => ({
      dataKey: key,
      label: _.get(seriesLabels, key),
    }),
  )

  const maxTurn = _.maxBy(dataSet, (item) => item.turn)?.turn
  const maxMoney = _.maxBy(dataSet, (item) => item.money)?.money
  const xAxisMax = maxTurn ?? defaultXAxisMax
  const yAxisMax = maxMoney ?? defaultYAxisMax

  return (
    <LineChart
      xAxis={[
        {
          dataKey: 'turn',
          min: 1,
          max: xAxisMax,
          label: 'Turn',
          scaleType: 'linear',
        },
      ]}
      yAxis={[
        {
          min: 0,
          max: yAxisMax,
          scaleType: 'linear',
        },
      ]}
      series={series}
      dataset={dataSet}
      width={500}
      height={300}
    />
  )
}
