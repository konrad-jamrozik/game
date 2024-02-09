import { Box, Button } from '@mui/material'
import {
  DataGrid,
  type GridRenderCellParams,
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

const tableHeight = 310

export function MissionSitesDataGrid(
  props: MissionSitesDataGridProps,
): React.JSX.Element {
  const rows: MissionSiteRow[] = getRows(props.missionSites)

  return (
    <Box sx={{ height: tableHeight, width: 340 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooterPagination={true}
        sx={(theme) => ({ bgcolor: theme.palette.background.default })}
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

const defaultRowWidth = 80

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Id',
    disableColumnMenu: true,
    width: defaultRowWidth,
  },
  {
    field: 'difficulty',
    headerName: 'Difficulty',
    disableColumnMenu: true,
    width: defaultRowWidth,
  },
  {
    field: 'expiresIn',
    headerName: 'Exp T#',
    disableColumnMenu: true,
    width: defaultRowWidth,
  },
  {
    field: 'deploy',
    disableColumnMenu: true,
    sortable: false,
    headerName: '',
    width: defaultRowWidth,
    renderCell: (
      params: GridRenderCellParams<MissionSiteRow, true>,
    ): React.JSX.Element | undefined => {
      const row: MissionSiteRow = params.row

      return (
        <Button
          variant="text"
          color="primary"
          onClick={() => {
            console.log(`Clicked! ${JSON.stringify(row.id, undefined, 2)}`)
          }}
        >
          Deploy
        </Button>
      )
    },
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
