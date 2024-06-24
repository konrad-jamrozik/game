import type {
  GridCellParams,
  GridColDef,
  GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { FactionName, factionMap } from '../codesync/GameState'

type FactionMapKeys = keyof typeof factionMap

// kja replace uses of factionsRenderMap with factionNameRenderMap
export const factionsRenderMap: {
  [key in FactionMapKeys]: { label: string; color: string }
} = {
  0: { label: 'Black Lotus', color: 'White' },
  1: { label: 'Red Dawn', color: 'Red' },
  2: { label: 'EXALT', color: 'RoyalBlue' },
  3: { label: 'Zombies', color: 'LimeGreen' },
}

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

// kja because field is 'name', bunch of components have Row model that has Name prop instead of Faction. Fix.
export const factionNameGridColDef: GridColDef = {
  field: 'name',
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
