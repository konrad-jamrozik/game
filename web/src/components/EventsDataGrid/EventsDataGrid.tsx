import { Box, type Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import {
  DataGrid,
  gridClasses,
  type GridCellParams,
  type GridColDef,
  type GridValidRowModel,
} from '@mui/x-data-grid'
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
    ? gameSession.getGameEvents() // ? _.filter(gameSession.getGameEvents(), (event) => event)
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
        (theme): SystemStyleObject<Theme> => ({
          height: defaultComponentHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 964,
          width: '100%',
          // future work: refactor
          [`& .${gridClasses.row}.odd`]: { backgroundColor: '#202020' },
          [`& .world-event`]: { color: theme.palette.secondary.dark },
          [`& .advance-time`]: { color: theme.palette.info.main },
          [`& .mission-site-expired`]: { color: theme.palette.error.main },
        }),
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
        getRowClassName={(params) =>
          params.row.turn % 2 === 0 ? 'even' : 'odd'
        }
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
    cellClassName: (
      params: GridCellParams<GridValidRowModel, string>,
    ): string => {
      const kindValue: string = params.value!
      // future work: refactor to use inverted map of playerActionNameToDisplayMap. See renderAssets for code to adapt.
      return kindValue === 'World Event' ? 'world-event' : ''
    },
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 190,
    disableColumnMenu: true,
    cellClassName: (
      params: GridCellParams<GridValidRowModel, string>,
    ): string => {
      const typeValue: string = params.value!
      // future work: refactor to use inverted map of playerActionNameToDisplayMap. See renderAssets for code to adapt.
      return typeValue === 'Advance time'
        ? 'advance-time'
        : typeValue === 'Mission site expired'
          ? 'mission-site-expired'
          : ''
    },
  },
  {
    field: 'details',
    headerName: 'Details',
    width: 450,
    disableColumnMenu: true,
  },
]

// In case I want to filter out empty reports
// function eventNotEmpty(event: GameEventWithTurn): boolean {
//   return !(event.Type === 'ReportEvent' && _.every(event.Ids, (id) => id === 0))
// }
