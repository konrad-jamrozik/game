import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/rendering/renderUtils'

export type GameEvent = {
  readonly Id: number
  readonly Turn: number
  readonly Kind: GameEventKind
  readonly Description: string
}

type GameEventKind =
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

  const gameEvents: GameEvent[] = gameSession.isInitialized()
    ? gameSession.getGameEvents()
    : []

  const rows: GameEventRow[] = _.reverse(
    _.map(gameEvents, (event) => ({
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

export type GameEventRow = {
  readonly id: number
  readonly turn: number
  readonly kind: GameEventKind
  readonly description: string
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
