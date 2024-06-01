import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { AgentState } from '../codesync/GameState'

const agentStateRenderMap: {
  [key in AgentState]: { display: string; color: string }
} = {
  InTransit: { display: 'In transit', color: 'DeepSkyBlue' },
  Available: { display: 'Available', color: 'LightSeaGreen' },
  OnMission: { display: 'OnMission', color: 'DarkOrange' },
  Training: { display: 'Training', color: 'MediumPurple' },
  GatheringIntel: { display: 'Intel', color: 'DodgerBlue' },
  GeneratingIncome: { display: 'Income', color: 'Gold' },
  Recovering: { display: 'Recovering', color: 'Crimson' },
  Terminated: { display: 'Terminated', color: 'DarkRed' },
}

const invertedAgentStateValueMap = _.invert(
  _.mapValues(agentStateRenderMap, (value) => value.display),
)

export const agentStateColors: {
  [key in AgentState]: string
} = _.mapValues(agentStateRenderMap, (value) => value.color)

export const agentStateGridColDef: GridColDef = {
  field: 'state',
  headerName: 'State',
  width: 120,

  valueGetter: (agentState: AgentState): string =>
    agentStateRenderMap[agentState].display,
  cellClassName: (
    params: GridCellParams<GridValidRowModel, string>,
  ): string => {
    const agentStateColumnValue: string = params.value!
    return invertedAgentStateValueMap[agentStateColumnValue]!
  },
}
