import _ from 'lodash'
import {
  GameStatsLineChart,
  type GameStateDataSeries,
  type GameStatsLineChartProps,
} from './GameStatsLineChart'

const agentStatsDataSeries: GameStateDataSeries[] = [
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

export function AgentStatsChart(
  props: Omit<GameStatsLineChartProps, 'dataSeries'>,
): React.JSX.Element {
  return (
    <GameStatsLineChart
      gameStates={props.gameStates}
      dataSeries={agentStatsDataSeries}
    />
  )
}
