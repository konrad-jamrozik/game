import { Box, type Theme } from '@mui/material'
import type { SystemStyleObject } from '@mui/system'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type {
  Faction,
  FactionName,
  GameState,
  MissionSite,
} from '../../lib/codesync/GameState'
import { getFaction } from '../../lib/codesync/dereferencing'
import { isActive } from '../../lib/codesync/ruleset'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  factionColors,
  factionNameGridColDef,
} from '../../lib/rendering/renderFactions'
import {
  defaultComponentMinWidth,
  sxClassesFromColors,
} from '../../lib/rendering/renderUtils'
import DeployMissionDialog from './DeployMissionDialog'

const gridHeight = 330

export function MissionSitesDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const rows = gameSession.isInitialized()
    ? getRows(gameSession.getCurrentGameState())
    : []

  const columns = getColumns(gameSession.getCurrentGameStateUnsafe())

  return (
    <Box
      sx={{
        height: gridHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 530,
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        hideFooterPagination={true}
        sx={[
          sxClassesFromColors(factionColors),
          (theme): SystemStyleObject<Theme> => ({
            bgcolor: theme.palette.background.default,
          }),
        ]}
      />
    </Box>
  )
}

function getColumns(gs?: GameState): GridColDef<MissionSiteRow>[] {
  const missionSites = gs?.MissionSites ?? []
  const factions = gs?.Factions ?? []
  return [
    {
      field: 'id',
      headerName: 'Site',
      disableColumnMenu: true,
      width: 80,
    },
    factionNameGridColDef,
    {
      field: 'difficulty',
      headerName: 'Difficulty',
      disableColumnMenu: true,
      width: 110,
    },
    {
      field: 'expiresIn',
      headerName: 'Exp T#',
      disableColumnMenu: true,
      width: 95,
    },
    {
      field: 'deploy',
      disableColumnMenu: true,
      sortable: false,
      headerName: '',
      width: 90,
      renderCell: (
        params: GridRenderCellParams<MissionSiteRow>,
      ): React.JSX.Element => {
        const row: MissionSiteRow = params.row

        const missionSite: MissionSite = _.find(missionSites, {
          Id: row.id,
        })!
        const faction: Faction = getFaction(missionSite, factions)

        return (
          <DeployMissionDialog missionSite={missionSite} faction={faction} />
        )
      },
    },
  ]
}

// https://mui.com/x/api/data-grid/data-grid/
function onRowSelectionModelChange(
  rowSelectionModel: GridRowSelectionModel,
  details: GridCallbackDetails,
): void {
  console.log('rowSelectionModel:', rowSelectionModel)
  console.log('details:', details)
}

type MissionSiteRow = {
  id: number
  faction: FactionName
  difficulty: number
  expiresIn: number
}

function getRows(gs: GameState): MissionSiteRow[] {
  const missionSites = gs.MissionSites
  const factions = gs.Factions
  const activeMissionSites: MissionSite[] = _.filter(
    missionSites,
    (missionSite) => isActive(missionSite),
  )

  return _.map(activeMissionSites, (missionSite) => {
    const faction = getFaction(missionSite, factions)
    return {
      id: missionSite.Id,
      faction: faction.Name,
      difficulty: missionSite.Difficulty,
      expiresIn: missionSite.ExpiresIn!,
    }
  })
}
