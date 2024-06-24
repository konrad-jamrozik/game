import { Box } from '@mui/material'
import {
  DataGrid,
  type GridRenderCellParams,
  type GridColDef,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { Faction } from '../../lib/codesync/GameState'
import { missionSiteDifficultyFactionPowerDivisor } from '../../lib/codesync/ruleset'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  factionColors,
  factionNameGridColDef,
} from '../../lib/rendering/renderFactions'
import {
  defaultComponentMinWidth,
  sxClassesFromColors,
} from '../../lib/rendering/renderUtils'
import ManageFactionDialog from './ManageFactionDialog'

const boxHeight = 200
export function FactionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gs = gameSession.getCurrentGameStateUnsafe()
  const factions = gs?.Factions ?? []

  if (_.isEmpty(factions)) {
    return <></>
  }

  const rows: FactionRow[] = _.map(factions, (faction: Faction) => ({
    id: faction.Id,
    name: faction.Name,
    power: Math.floor(faction.Power / missionSiteDifficultyFactionPowerDivisor),
    intel: faction.IntelInvested,
  }))

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
        rows={rows}
        columns={columns(factions)}
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

function columns(factions: Faction[]): GridColDef<FactionRow>[] {
  return [
    factionNameGridColDef,
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
    {
      field: 'deploy',
      disableColumnMenu: true,
      sortable: false,
      headerName: '',
      width: 90,
      renderCell: (
        params: GridRenderCellParams<FactionRow>,
      ): React.JSX.Element => {
        const row: FactionRow = params.row

        const faction: Faction = _.find(factions, {
          Id: row.id,
        })!
        return <ManageFactionDialog faction={faction} />
      },
    },
  ]
}
