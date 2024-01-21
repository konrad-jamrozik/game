import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'

import type { GameStatePlayerView } from '../types/GameStatePlayerView'

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

  // kja todo: use keyToLabel
  // const keyToLabel: { [key: string]: string } = {
  //   money: 'Money',
  //   upkeepCost: 'Upkeep',
  // }

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
      series={[
        { dataKey: 'money', label: 'Money' },
        { dataKey: 'upkeepCost', label: 'Upkeep' },
      ]}
      dataset={dataSet}
      width={500}
      height={300}
    />
  )
}
