import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Faction } from '../../lib/codesync/GameState'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import { factionsRenderMap } from '../../lib/rendering/renderFactions'
import { defaultComponentMinWidth } from '../../lib/rendering/renderUtils'

const boxHeight = 200
export function FactionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gs = gameSession.getCurrentGameStateUnsafe()
  const factions = gs?.Factions ?? []

  const rows: FactionRow[] = _.map(factions, (faction: Faction) => ({
    id: faction.Id,
    name: factionsRenderMap[faction.Id]!.label,
    power: faction.Power,
    intel: faction.IntelInvested,
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
  readonly intel: number
}

const columns: GridColDef<FactionRow>[] = [
  {
    field: 'name',
    headerName: 'Faction',
    width: 150,
    disableColumnMenu: true,
  },
  {
    field: 'power',
    headerName: 'Power',
    width: 110,
    disableColumnMenu: true,
  },
  {
    field: 'intel',
    headerName: 'Intel',
    width: 80,
    disableColumnMenu: true,
  },
]
