import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { AgentState } from '../codesync/GameState'

export const agentStateColors: {
  [key in AgentState]: string
} = {
  InTransit: 'DeepSkyBlue',
  OnMission: 'DarkOrange',
  Available: 'LightSeaGreen',
  Training: 'MediumPurple',
  GeneratingIncome: 'Gold',
  GatheringIntel: 'DodgerBlue',
  Recovering: 'Crimson',
  Terminated: 'DarkRed',
}

export const agentStateValueGetterMap: {
  [key in AgentState]: string
} = {
  GeneratingIncome: 'Income',
  GatheringIntel: 'Intel',
  InTransit: 'InTransit',
  Available: 'Available',
  OnMission: 'OnMission',
  Training: 'Training',
  Recovering: 'Recovering',
  Terminated: 'Terminated',
}
export const invertedAgentStateValueGetterMap = _.invert(
  agentStateValueGetterMap,
)

export const agentStateGridColDef: GridColDef = {
  field: 'state',
  headerName: 'State',
  width: 120,

  valueGetter: (agentState: AgentState): string =>
    agentStateValueGetterMap[agentState],
  cellClassName: (
    params: GridCellParams<GridValidRowModel, string>,
  ): string => {
    const agentStateColumnValue: string = params.value!
    return invertedAgentStateValueGetterMap[agentStateColumnValue]!
  },
}
