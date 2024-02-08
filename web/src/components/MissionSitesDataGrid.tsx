import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { MissionSite } from '../types/GameState'
import { isActive } from '../types/ruleset'

export type MissionSitesDataGridProps = {
  readonly missionSites: MissionSite[] | undefined
}

const tableHeight = 290
const defaultRowWidth = 110

export function MissionSitesDataGrid(
  props: MissionSitesDataGridProps,
): React.JSX.Element {
  const rows: MissionSiteRow[] = getRows(props.missionSites)

  return (
    <Box sx={{ height: tableHeight, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooterPagination={true}
      />
    </Box>
  )
}

// https://mui.com/x/api/data-grid/data-grid/
function onRowSelectionModelChange(
  rowSelectionModel: GridRowSelectionModel,
  details: GridCallbackDetails,
): void {
  console.log('rowSelectionModel:', rowSelectionModel)
  console.log('details:', details)
}

type MissionSiteRow = {
  id: number
  difficulty: number
  expiresIn: number
}

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Id',
    width: 90,
  },
  {
    field: 'difficulty',
    headerName: 'Difficulty',
    width: defaultRowWidth,
  },
  {
    field: 'expiresIn',
    headerName: 'Expires in',
    width: defaultRowWidth,
  },
]

function getRows(missionSites?: MissionSite[]): MissionSiteRow[] {
  if (_.isUndefined(missionSites)) {
    return []
  }

  const activeMissionSites = _.filter(missionSites, (missionSite) =>
    isActive(missionSite),
  )

  return _.map(activeMissionSites, (missionSite) => ({
    id: missionSite.Id,
    difficulty: missionSite.Difficulty,
    expiresIn: missionSite.ExpiresIn!,
  }))
}
