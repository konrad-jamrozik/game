import { Typography } from '@mui/material'
import type { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid'
import type { AgentState, Assets } from '../types/GameState'

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

export function renderAssetNameCell(
  params: GridRenderCellParams<GridValidRowModel, keyof Assets>,
): React.JSX.Element {
  const assetName: keyof Assets = params.value!
  let style = {}
  let displayedValue: string = assetName

  style = { color: assetsColors[assetName] }
  if (params.value === 'MaxTransportCapacity') {
    displayedValue = 'Transp. cap.'
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

export const assetsColors: { [key in keyof Assets]: string } = {
  Money: 'darkGreen',
  Funding: 'goldenRod',
  Intel: agentStateColors.GatheringIntel,
  Support: 'darkOliveGreen',
  MaxTransportCapacity: agentStateColors.InTransit,
  Agents: agentStateColors.Available,
}
