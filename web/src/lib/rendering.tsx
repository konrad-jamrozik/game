import { Typography, type SxProps, type Theme } from '@mui/material'
import type { GridRenderCellParams } from '@mui/x-data-grid'
import type { AgentRow } from '../components/AgentsDataGrid/AgentsDataGrid'
import type { AssetRow } from '../components/AssetsDataGrid'
import type { AgentState, Assets } from '../types/GameState'

export function renderAgentStateCell(
  params: GridRenderCellParams<AgentRow, AgentState>,
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
  params: GridRenderCellParams<AssetRow, keyof Assets>,
): React.JSX.Element {
  const assetName: keyof Assets = params.value!
  let displayedValue: string = assetName

  if (params.value === 'MaxTransportCapacity') {
    displayedValue = 'Transp. cap.'
  }

  return <Typography sx={getSx(assetName)}>{displayedValue}</Typography>
}

export function getSx(key: AllStylableValues): SxProps<Theme> {
  return { color: allColors[key] }
}

export const agentStateColors: { [key in AgentState]: string } = {
  InTransit: 'DeepSkyBlue',
  OnMission: 'DarkOrange',
  Available: 'LightSeaGreen',
  Training: 'MediumPurple',
  GeneratingIncome: 'Gold',
  GatheringIntel: 'DodgerBlue',
  Recovering: 'Crimson',
  Terminated: 'DarkRed',
}

export const assetsColors: { [key in keyof Assets]: string } = {
  Money: 'LimeGreen',
  Funding: 'GoldenRod',
  Intel: agentStateColors.GatheringIntel,
  Support: 'YellowGreen',
  MaxTransportCapacity: agentStateColors.InTransit,
  Agents: agentStateColors.Available,
}

type MiscValues = 'Cost'

type AllStylableValues = keyof Assets | MiscValues

export const miscColors: { [key in MiscValues]: string } = {
  Cost: 'red',
}

const allColors: { [key in AllStylableValues]: string } = {
  ...assetsColors,
  ...miscColors,
}
