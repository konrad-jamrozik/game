import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'

import type { GameStatePlayerView } from '../types/GameStatePlayerView'

const defaultXAxisMax = 10
const defaultYAxisMax = 100

export type PrototypeChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

export function PrototypeChart(props: PrototypeChartProps): React.JSX.Element {
  const turns: number[] = _.map(props.gameStates, (gs) => gs.CurrentTurn)
  const money: number[] = _.map(props.gameStates, (gs) => gs.Assets.Money)
  const xAxisMax = _.max(turns) ?? defaultXAxisMax
  const yAxisMax = _.max(money) ?? defaultYAxisMax

  return (
    <LineChart
      xAxis={[
        {
          data: turns,
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
          label: 'Money',
          scaleType: 'linear',
          //labelStyle: { ??? },
        },
      ]}
      series={[
        {
          data: money,
        },
      ]}
      width={500}
      height={300}
    />
  )
}
