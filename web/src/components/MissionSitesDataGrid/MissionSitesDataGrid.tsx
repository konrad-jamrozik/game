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
  const gs = gameSession.getCurrentGameStateUnsafe()
  const missionSites = gs?.MissionSites ?? []
  const factions = gs?.Factions ?? []
  const rows: MissionSiteRow[] = getRows(missionSites, factions)

  const columns: GridColDef<MissionSiteRow>[] = [
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
      ): React.JSX.Element | undefined => {
        const row: MissionSiteRow = params.row

        const missionSite: MissionSite | undefined = _.find(missionSites, {
          Id: row.id,
        })
        const faction: Faction | undefined = !_.isUndefined(missionSite)
          ? getFaction(missionSite, factions)
          : undefined

        return (
          <DeployMissionDialog missionSite={missionSite} faction={faction} />
        )
      },
    },
  ]

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
  name: FactionName
  difficulty: number
  expiresIn: number
}

function getRows(
  missionSites: MissionSite[],
  factions: Faction[],
): MissionSiteRow[] {
  const activeMissionSites: MissionSite[] = _.filter(
    missionSites,
    (missionSite) => isActive(missionSite),
  )

  return _.map(activeMissionSites, (missionSite) => {
    const faction = getFaction(missionSite, factions)
    return {
      id: missionSite.Id,
      name: faction.Name,
      difficulty: missionSite.Difficulty,
      expiresIn: missionSite.ExpiresIn!,
    }
  })
}
