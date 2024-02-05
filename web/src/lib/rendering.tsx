import { Typography } from '@mui/material'
import type { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid'
import type { AgentState } from '../types/GameState'

export function renderAgentStateCell(
  params: GridRenderCellParams<GridValidRowModel, AgentState>,
): React.JSX.Element {
  const agentState: AgentState = params.value!
  let style = {}
  let displayedValue: string = agentState

  style = { color: agentStateColors[agentState] }
  if (params.value === 'GeneratingIncome') {
    displayedValue = 'Income'
  }
  if (params.value === 'GatheringIntel') {
    displayedValue = 'Intel'
  }

  return <Typography style={style}>{displayedValue}</Typography>
}
export const agentStateColors: { [key in AgentState]: string } = {
  InTransit: 'blue',
  OnMission: 'darkOrange',
  Available: 'darkGreen',
  Training: 'MediumPurple',
  GeneratingIncome: 'gold',
  GatheringIntel: 'dodgerBlue',
  Recovering: 'crimson',
  Terminated: 'darkRed',
}
