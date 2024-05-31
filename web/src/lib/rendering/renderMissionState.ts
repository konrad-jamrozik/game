import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { MissionState } from '../codesync/GameState'

const missionStateRenderMap: {
  [key in MissionState]: { display: string; color: string }
} = {
  Successful: { display: '✅ Won', color: 'LimeGreen' },
  Failed: { display: '❌ Lost', color: 'Red' },
  Active: { display: '⚔️ Active', color: 'DarkOrange' },
}

const invertedMissionStateValueMap = _.invert(
  _.mapValues(missionStateRenderMap, (value) => value.display),
)

export const missionStateColors: {
  [key in MissionState]: string
} = _.mapValues(missionStateRenderMap, (value) => value.color)

export const missionStateGridColDef: GridColDef = {
  field: 'state',
  headerName: 'State',
  width: 90,
  disableColumnMenu: true,

  valueGetter: (missionState: MissionState): string =>
    missionStateRenderMap[missionState].display,
  cellClassName: (
    params: GridCellParams<GridValidRowModel, string>,
  ): string => {
    const missionStateColumnValue: string = params.value!
    return invertedMissionStateValueMap[missionStateColumnValue]!
  },
}
