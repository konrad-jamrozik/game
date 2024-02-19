import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { Agent, MissionSite } from '../../lib/GameState'
import { isActive } from '../../lib/ruleset'
import { defaultComponentMinWidth } from '../../lib/utils'
import DeployMissionDialog from './DeployMissionDialog'

export type MissionSitesDataGridProps = {
  readonly missionSites: MissionSite[] | undefined
  readonly agents: Agent[] | undefined
}

const tableHeight = 310

export function MissionSitesDataGrid(
  props: MissionSitesDataGridProps,
): React.JSX.Element {
  // kja fix this to use gameSession instead. This fill fix a bug with undefined MissionSite.
  const rows: MissionSiteRow[] = getRows(props.missionSites)

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Id',
      disableColumnMenu: true,
      width: 70,
    },
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      disableColumnMenu: true,
      width: 110,
    },
    {
      field: 'expiresIn',
      headerName: 'Exp T#',
      disableColumnMenu: true,
      width: 95,
    },
    {
      field: 'deploy',
      disableColumnMenu: true,
      sortable: false,
      headerName: '',
      width: 80,
      renderCell: (
        params: GridRenderCellParams<MissionSiteRow>,
      ): React.JSX.Element | undefined => {
        const row: MissionSiteRow = params.row

        const missionSite: MissionSite | undefined = _.find(
          props.missionSites,
          {
            Id: row.id,
          },
        )

        return <DeployMissionDialog missionSite={missionSite} />
      },
    },
  ]

  return (
    <Box
      sx={{
        height: tableHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 358,
        width: '100%',
      }}
    >
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
