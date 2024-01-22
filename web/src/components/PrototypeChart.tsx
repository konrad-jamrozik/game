import type { LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameStatePlayerView } from '../types/GameStatePlayerView'
import type { MakeOptional } from '../types/external'
import { agentUpkeepCost } from '../types/ruleset'

export type PrototypeChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

export function PrototypeChart(props: PrototypeChartProps): React.JSX.Element {
  const gsData: {
    turn: number
    money: number
    upkeepCost: number
    funding: number
    intel: number
  }[] = _.map(props.gameStates, (gs) => ({
    turn: gs.CurrentTurn,
    money: gs.Assets.Money,
    funding: gs.Assets.Funding,
    intel: gs.Assets.Intel,
    upkeepCost: _.size(gs.Assets.Agents) * agentUpkeepCost,
  }))

  const seriesConfig: { [key: string]: { label: string; color: string } } = {
    money: { label: 'Money', color: 'darkgreen' },
    funding: { label: 'Funding', color: 'lime' },
    upkeepCost: { label: 'Upkeep', color: 'red' },
    intel: { label: 'Intel', color: 'dodgerblue' },
  }

  const series: MakeOptional<LineSeriesType, 'type'>[] = _.map(
    _.keys(seriesConfig),
    (key: string) => ({
      dataKey: key,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      label: seriesConfig[key]!.label,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      color: seriesConfig[key]!.color,
      showMark: false,
    }),
  )

  const maxTurn = _.maxBy(gsData, (gs) => gs.turn)?.turn
  const defaultXAxisMax = 10
  const xAxisMax = maxTurn ?? defaultXAxisMax

  const maxMoney = _.maxBy(gsData, (gs) => gs.money)?.money
  const defaultYAxisMax = 100
  const yAxisMax = maxMoney ?? defaultYAxisMax

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
      dataset={gsData}
      width={800}
      height={500}
    />
  )
}
