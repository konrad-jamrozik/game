import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Faction } from '../../lib/codesync/GameState'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import { defaultComponentMinWidth } from '../../lib/rendering/renderUtils'

const boxHeight = 200
export function FactionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gs = gameSession.getCurrentGameStateUnsafe()
  const factions = gs?.Factions ?? []

  const rows: FactionRow[] = _.map(factions, (faction: Faction) => ({
    id: faction.Id,
    name: faction.Name,
    power: faction.Power,
  }))

  return (
    <Box
      sx={{
        height: boxHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 964,
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
              pageSize: 50,
            },
          },
        }}
        hideFooter={true}
        sx={(theme) => ({ bgcolor: theme.palette.background.default })}
      />
    </Box>
  )
}

export type FactionRow = {
  readonly id: number
  readonly name: string
  readonly power: number
}

const columns: GridColDef<FactionRow>[] = [
  {
    field: 'id',
    headerName: 'Faction',
    width: 80,
  },
  {
    field: 'name',
    headerName: 'Name',
    width: 150,
    disableColumnMenu: true,
  },
  {
    field: 'power',
    headerName: 'Power',
    width: 110,
    disableColumnMenu: true,
  },
]
