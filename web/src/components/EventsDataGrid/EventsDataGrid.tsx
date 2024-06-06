import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { PlayerActionPayload } from '../../lib/codesync/PlayerActionPayload'
import type {
  GameEventFromPayload,
  GameEventDisplayedKind,
  GameEventPayload,
} from '../../lib/gameSession/GameEventFromPayload'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import type { RenderedGameEvent } from '../../lib/gameSession/RenderedGameEvent'
import {
  getDisplayedDetails,
  getDisplayedType,
} from '../../lib/rendering/renderPlayerActionPayload'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/rendering/renderUtils'

export function EventsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const gameEvents: readonly RenderedGameEvent[] = gameSession.isInitialized()
    ? gameSession.getGameEvents()
    : []

  const rows: GameEventRow[] = _.reverse(
    _.map(gameEvents, (event: RenderedGameEvent) => ({
      id: event.Id,
      turn: event.Turn,
      kind: 'Player action', // kja currently just assuming this is player action event
      type: event.Type,
      details: event.Details,
    })),
  )

  return (
    <Box
      sx={[
        {
          height: defaultComponentHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 860,
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

export type GameEventRow<T extends GameEventPayload = GameEventPayload> = {
  readonly id: number
  readonly turn: number
  readonly kind: GameEventDisplayedKind<T>
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
    width: 350,
    disableColumnMenu: true,
  },
]

// kja this will come in play once I fix the game event content formatting
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getRowFromGameEventFromPayload(
  event: GameEventFromPayload,
): GameEventRow {
  return {
    id: event.Id,
    turn: event.Turn,
    kind: 'Player action',
    type: getDisplayedType(event.Payload as PlayerActionPayload),
    details: getDisplayedDetails(event.Payload as PlayerActionPayload),
  }
}
