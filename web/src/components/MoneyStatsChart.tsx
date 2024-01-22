import _ from 'lodash'
import { agentUpkeepCost } from '../types/ruleset'
import {
  GameStatsLineChart,
  type GameStateDataSeries,
  type GameStatsLineChartProps,
} from './GameStatsLineChart'

export function MoneyStatsChart(
  props: Omit<GameStatsLineChartProps, 'dataSeries'>,
): React.JSX.Element {
  return (
    <GameStatsLineChart
      gameStates={props.gameStates}
      dataSeries={moneyStatsDataSeries}
    />
  )
}

const moneyStatsDataSeries: GameStateDataSeries[] = [
  {
    key: 'money',
    dataFunc: (gs) => gs.Assets.Money,
    label: 'Money',
    color: 'darkgreen',
  },
  {
    key: 'funding',
    dataFunc: (gs) => gs.Assets.Funding,
    label: 'Funding',
    color: 'gold',
  },
  {
    key: 'upkeep',
    dataFunc: (gs) => _.size(gs.Assets.Agents) * agentUpkeepCost,
    label: 'Upkeep',
    color: 'red',
  },
  {
    key: 'intel',
    dataFunc: (gs) => gs.Assets.Intel,
    label: 'Intel',
    color: 'dodgerblue',
  },
]
