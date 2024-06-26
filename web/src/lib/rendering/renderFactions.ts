import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { FactionName } from '../codesync/GameState'

export const factionNameRenderMap: {
  [key in FactionName]: { display: string; color: string }
} = {
  'Black Lotus cult': { display: 'Black Lotus', color: 'White' },
  'Red Dawn remnants': { display: 'Red Dawn', color: 'Red' },
  EXALT: { display: 'EXALT', color: 'RoyalBlue' },
  Zombies: { display: 'Zombies', color: 'LimeGreen' },
}

export const factionColors: {
  [key in FactionName]: string
} = _.mapValues(factionNameRenderMap, (value) => value.color)

const invertedFactionNameValueMap = _.invert(
  _.mapValues(factionNameRenderMap, (value) => value.display),
)

export const factionNameGridColDef: GridColDef = {
  field: 'faction',
  headerName: 'Faction',
  disableColumnMenu: true,
  sortable: false,
  width: 110,

  valueGetter: (factionName: FactionName): string =>
    factionNameRenderMap[factionName].display,
  cellClassName: (
    params: GridCellParams<GridValidRowModel, string>,
  ): string => {
    const factionNameColumnValue: string = params.value!
    return _.kebabCase(invertedFactionNameValueMap[factionNameColumnValue])
  },
}
