import { Typography, type SxProps, type Theme } from '@mui/material'
import type { GridRenderCellParams } from '@mui/x-data-grid'
import type { AgentRow } from '../components/AgentsDataGrid/AgentsDataGrid'
import type { AssetRow } from '../components/AssetsDataGrid/AssetsDataGrid'
import type { AgentState, Assets } from './codesync/GameState'

export function renderAgentStateCell(
  params: GridRenderCellParams<AgentRow, AgentState>,
): React.JSX.Element {
  const agentState: AgentState = params.value!
  let displayedValue: string = agentState

  if (params.value === 'GeneratingIncome') {
    displayedValue = 'Income'
  }
  if (params.value === 'GatheringIntel') {
    displayedValue = 'Intel'
  }

  return <Typography sx={getSx(agentState)}>{displayedValue}</Typography>
}

export function renderAssetNameCell(
  params: GridRenderCellParams<AssetRow, keyof Assets>,
): React.JSX.Element {
  const assetName: keyof Assets = params.value!
  let displayedValue: string = assetName

  if (params.value === 'MaxTransportCapacity') {
    displayedValue = 'Max Tr. cap.'
  }
  if (params.value === 'CurrentTransportCapacity') {
    displayedValue = 'Curr. Tr. cap.'
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
  CurrentTransportCapacity: agentStateColors.InTransit,
  MaxTransportCapacity: agentStateColors.InTransit,
  Agents: agentStateColors.Available,
}

type MiscValues = 'Cost' | 'Difficulty'

type AllStylableValues = keyof Assets | AgentState | MiscValues

export const miscColors: { [key in MiscValues]: string } = {
  Cost: 'red',
  Difficulty: 'red',
}

const allColors: { [key in AllStylableValues]: string } = {
  ...assetsColors,
  ...agentStateColors,
  ...miscColors,
}

// I might like to have a list of all the GameState type property keys
// (recursively over all its children, including Assets property keys etc.)
// for compile-time exhaustiveness checking to ensure all GameState properties
// have rendering logic defined for them.
//
// To do that, I could leverage 'keyof' and 'Uncapitalize':
// https://www.typescriptlang.org/docs/handbook/2/keyof-types.html
// https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html
// https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
// And if I want to pick a subset:
// https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html
// One idea is to have a function that takes as input GameState
// schema and requires defining a type for each each key.
// Like "GameStateRenderData" or similar.
// In pseudocode:
// For each key in GameState, recursively, define a function
// that takes as input an array of its value type (so for Money key it is going to be number[])
// and returns RenderData type, which says how to compute it and metadata like label and color.
// Note I said "array of its value type" because it is going to be an array of all its occurrences
// over time.
