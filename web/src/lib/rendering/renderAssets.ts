import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { Assets } from '../codesync/GameState'
import { agentStateColors } from './renderAgentState'

const assetNameRenderMap: {
  [key in keyof Assets]: { display: string; color: string }
} = {
  Money: { display: 'Money', color: 'LimeGreen' },
  Funding: { display: 'Funding', color: 'GoldenRod' },
  Intel: { display: 'Intel', color: agentStateColors.GatheringIntel },
  Support: { display: 'Support', color: 'YellowGreen' },
  CurrentTransportCapacity: {
    display: 'Curr. Tr. Cap',
    color: agentStateColors.InTransit,
  },
  MaxTransportCapacity: {
    display: 'Max Tr. Cap',
    color: agentStateColors.InTransit,
  },
  Agents: { display: 'Agents', color: agentStateColors.Available },
}

const invertedAssetNameValueMap = _.invert(
  _.mapValues(assetNameRenderMap, (value) => value.display),
)

export const assetNameColors: {
  [key in keyof Assets]: string
} = _.mapValues(assetNameRenderMap, (value) => value.color)

export const assetNameGridColDef: GridColDef = {
  field: 'name',
  headerName: 'Asset',
  disableColumnMenu: true,
  sortable: false,
  width: 110,

  valueGetter: (assetName: keyof Assets): string =>
    assetNameRenderMap[assetName].display,
  cellClassName: (
    params: GridCellParams<GridValidRowModel, string>,
  ): string => {
    const assetNameColumnValue: string = params.value!
    return _.kebabCase(invertedAssetNameValueMap[assetNameColumnValue])
  },
}
