import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Mission, MissionSite } from '../../lib/codesync/GameState'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import { renderMissionStateCell } from '../../lib/rendering/renderingUtils'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/utils'

export function MissionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()

  const missions: Mission[] = gameSession.isInitialized()
    ? gameSession.getCurrentGameState().Missions
    : []

  const missionSites: MissionSite[] = gameSession.isInitialized()
    ? gameSession.getCurrentGameState().MissionSites
    : []

  const rows: MissionRow[] = _.reverse(
    _.map(missions, (mission) => {
      const missionSite = getMissionSite(mission, missionSites)
      return getRow(mission, missionSite)
    }),
  )

  return (
    <Box
      sx={{
        height: defaultComponentHeight,
        minWidth: defaultComponentMinWidth,
        maxWidth: 650,
        width: '100%',
      }}
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
export type MissionRow = {
  id: number
  state: string
  difficulty: number
  agentsSent: number
  agentsTerminated: number
}

const columns: GridColDef[] = [
  {
    field: 'id',
    headerName: 'Mission',
    width: 130,
  },
  {
    field: 'state',
    headerName: 'State',
    width: 90,
    disableColumnMenu: true,
    renderCell: renderMissionStateCell,
  },
  {
    field: 'difficulty',
    headerName: 'Difficulty',
    width: 130,
    disableColumnMenu: true,
  },
  {
    field: 'agentsSent',
    headerName: 'Agents sent',
    width: 130,
    disableColumnMenu: true,
  },
  {
    field: 'agentsTerminated',
    headerName: 'Agents lost',
    width: 130,
    disableColumnMenu: true,
  },
]

function getRow(mission: Mission, missionSite: MissionSite): MissionRow {
  return {
    id: mission.Id,
    state: mission.CurrentState,
    difficulty: missionSite.Difficulty,
    agentsSent: mission.AgentsSent,
    agentsTerminated: mission.AgentsTerminated,
  }
}

function getMissionSite(
  mission: Mission,
  missionSites: MissionSite[],
): MissionSite {
  const missionSite = _.find(
    missionSites,
    (site) => site.Id === mission.$Id_Site,
  )

  /* c8 ignore start */
  if (!missionSite) {
    throw new Error(`Mission site with id ${mission.$Id_Site} not found.`)
  }
  /* c8 ignore stop */

  return missionSite
}
