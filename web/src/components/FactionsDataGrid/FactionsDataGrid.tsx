import { Box } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import { factionColors } from '../../lib/rendering/renderFactions'
import {
  defaultComponentMinWidth,
  sxClassesFromColors,
} from '../../lib/rendering/renderUtils'
import { getColumns, getRows } from './factionsDataGridData'

const boxHeight = 200

export function FactionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gs = gameSession.getCurrentGameStateUnsafe()
  const factions = gs?.Factions ?? []

  return (
    <Box
      sx={[
        {
          height: boxHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 964,
          width: '100%',
        },
        sxClassesFromColors(factionColors),
      ]}
    >
      <DataGrid
        rows={getRows(factions)}
        columns={getColumns(factions)}
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
