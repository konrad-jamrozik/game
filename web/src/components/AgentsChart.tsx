import type { LineSeriesType } from '@mui/x-charts'
import { LineChart } from '@mui/x-charts/LineChart'
import _ from 'lodash'
import type { GameStatePlayerView } from '../types/GameStatePlayerView'
import type { MakeOptional } from '../types/external'

export type AgentsChartProps = {
  readonly gameStates: readonly GameStatePlayerView[]
}

export function AgentsChart(props: AgentsChartProps): React.JSX.Element {
  const gsData: {
    turn: number
    agents: number
    inTraining: number
    generatingIncome: number
    gatheringIntel: number
    recovering: number
  }[] = _.map(props.gameStates, (gs) => ({
    turn: gs.CurrentTurn,
    agents: _.size(gs.Assets.Agents),
    inTraining: _.size(
      _.filter(gs.Assets.Agents, (agent) => agent.CurrentState === 'Training'),
    ),
    generatingIncome: _.size(
      _.filter(
        gs.Assets.Agents,
        (agent) => agent.CurrentState === 'GeneratingIncome',
      ),
    ),
    gatheringIntel: _.size(
      _.filter(
        gs.Assets.Agents,
        (agent) => agent.CurrentState === 'GatheringIntel',
      ),
    ),
    recovering: _.size(
      _.filter(
        gs.Assets.Agents,
        (agent) => agent.CurrentState === 'Recovering',
      ),
    ),
  }))

  const seriesConfig: { [key: string]: { label: string; color: string } } = {
    agents: { label: 'Agents', color: 'darkgreen' },
    inTraining: { label: 'InTraining', color: 'purple' },
    generatingIncome: { label: 'GeneratingIncome', color: 'gold' },
    gatheringIntel: { label: 'GatheringIntel', color: 'dodgerblue' },
    recovering: { label: 'Recovering', color: 'crimson' },
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

  const maxAgents = _.maxBy(gsData, (gs) => gs.agents)?.agents
  const defaultYAxisMax = 10
  const yAxisMax = maxAgents ?? defaultYAxisMax

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
      height={500}
    />
  )
}
