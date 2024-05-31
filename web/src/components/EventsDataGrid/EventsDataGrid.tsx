import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/rendering/renderUtils'

export type Event = {
  readonly Id: number
  readonly Turn: number
  readonly Kind: EventKind
  readonly Description: string
}

type EventKind =
  | 'AgentHired'
  | 'AgentSacked'
  | 'AgentAssigned'
  | 'AgentRecalled'
  | 'MissionExpired'
  | 'MissionLaunched'
  | 'MissionSuccessful'
  | 'MissionFailed'

export function EventsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const events: Event[] = gameSession.isInitialized()
    ? gameSession.getEvents()
    : []

  const rows: EventRow[] = _.reverse(
    _.map(events, (event) => ({
      id: event.Id,
      turn: event.Turn,
      kind: event.Kind,
      description: event.Description,
    })),
  )

  return (
    <Box
      sx={[
        {
          height: defaultComponentHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 745,
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

export type EventRow = {
  readonly id: number
  readonly turn: number
  readonly kind: EventKind
  readonly description: string
}

const columns: GridColDef<EventRow>[] = [
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
    width: 130,
    disableColumnMenu: true,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 500,
    disableColumnMenu: true,
  },
]
