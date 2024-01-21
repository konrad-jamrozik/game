import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'

import type { GameStatePlayerView } from '../types/GameStatePlayerView'

export type PrototypeChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

export function PrototypeChart(props: PrototypeChartProps): React.JSX.Element {
  const turns: number[] = _.map(props.gameStates, (gs) => gs.CurrentTurn)
  const money: number[] = _.map(props.gameStates, (gs) => gs.Assets.Money)
  return (
    <LineChart
      xAxis={[{ data: turns }]}
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
