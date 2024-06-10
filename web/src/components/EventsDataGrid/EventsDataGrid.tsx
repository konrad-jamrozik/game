import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { GameEventWithTurn } from '../../lib/codesync/GameEvent'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  getDisplayedDetails,
  getDisplayedKind,
  getDisplayedType,
} from '../../lib/rendering/renderGameEvent'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/rendering/renderUtils'

export function EventsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const gameEvents: readonly GameEventWithTurn[] = gameSession.isInitialized()
    ? gameSession.getGameEvents()
    : []

  const rows: GameEventRow[] = _.reverse(
    _.map(gameEvents, (event: GameEventWithTurn) => ({
      id: event.Id,
      turn: event.Turn,
      kind: getDisplayedKind(event),
      type: getDisplayedType(event),
      details: getDisplayedDetails(event),
    })),
  )

  return (
    <Box
      sx={[
        {
          height: defaultComponentHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 960,
          width: '100%',
        },
      ]}
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
        pageSizeOptions={[50]}
        sx={(theme) => ({ bgcolor: theme.palette.background.default })}
      />
    </Box>
  )
}

export type GameEventRow = {
  readonly id: number
  readonly turn: number
  readonly kind: string
  readonly type: string
  readonly details: string
}

const columns: GridColDef<GameEventRow>[] = [
  {
    field: 'id',
    headerName: 'Event',
    width: 110,
  },
  {
    field: 'turn',
    headerName: 'Turn',
    width: 80,
    disableColumnMenu: true,
  },
  {
    field: 'kind',
    headerName: 'Kind',
    width: 110,
    disableColumnMenu: true,
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 190,
    disableColumnMenu: true,
  },
  {
    field: 'details',
    headerName: 'Details',
    width: 450,
    disableColumnMenu: true,
  },
]
