import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Mission } from '../../lib/codesync/GameState'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import { renderMissionStateCell } from '../../lib/rendering'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/utils'

export function MissionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const missions: Mission[] = gameSession.isInitialized()
    ? gameSession.getCurrentGameState().Missions
    : []

  const rows: MissionRow[] = _.reverse(
    _.map(missions, (mission) => getRow(mission)),
  )

  return (
    <Box
      sx={{
        height: defaultComponentHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 550,
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        rowHeight={30}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25,
            },
          },
          // sorting: { sortModel: [{ field: 'id', sort: 'desc' }] },
        }}
        sx={(theme) => ({ bgcolor: theme.palette.background.default })}
      />
    </Box>
  )
}
export type MissionRow = {
  id: number
  state: string
}

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Mission',
    sortable: true,
    width: 130,
    // sortingOrder: ['desc', 'asc'],
  },
  {
    field: 'state',
    headerName: 'State',
    sortable: true,
    width: 110,
    disableColumnMenu: true,
    renderCell: renderMissionStateCell,
  },
]

function getRow(mission: Mission): MissionRow {
  return { id: mission.Id, state: mission.CurrentState }
}
