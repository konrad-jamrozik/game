import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type {
  Faction,
  Mission,
  MissionSite,
} from '../../lib/codesync/GameState'
import { getFaction, getMissionSite } from '../../lib/codesync/dereferencing'
import { useGameSessionContext } from '../../lib/gameSession/GameSession'
import {
  factionColors,
  factionNameGridColDef,
} from '../../lib/rendering/renderFactions'
import {
  missionStateColors,
  missionStateGridColDef,
} from '../../lib/rendering/renderMissionState'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
  sxClassesFromColors,
} from '../../lib/rendering/renderUtils'

export function MissionsDataGrid(): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const gs = gameSession.getCurrentGameStateUnsafe()
  const missionSites: MissionSite[] = gs?.MissionSites ?? []
  const missions: Mission[] = gs?.Missions ?? []
  const factions: Faction[] = gs?.Factions ?? []

  const rows: MissionRow[] = _.reverse(
    _.map(missions, (mission) => {
      const missionSite = getMissionSite(mission, missionSites)
      return getRow(mission, missionSite, factions)
    }),
  )

  return (
    <Box
      sx={[
        {
          height: defaultComponentHeight,
          minWidth: defaultComponentMinWidth,
          maxWidth: 784,
          width: '100%',
        },
        sxClassesFromColors(missionStateColors),
        sxClassesFromColors(factionColors),
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
export type MissionRow = {
  id: number
  turn: number
  state: string
  difficulty: number
  name: string
  agentsSent: number
  agentsTerminated: number
}

const columns: GridColDef<MissionRow>[] = [
  {
    field: 'id',
    headerName: 'Mission',
    width: 120,
  },
  {
    field: 'turn',
    headerName: 'Turn',
    width: 80,
    disableColumnMenu: true,
  },
  missionStateGridColDef,
  {
    field: 'difficulty',
    headerName: 'Difficulty',
    width: 110,
    disableColumnMenu: true,
  },
  factionNameGridColDef,
  {
    field: 'agentsSent',
    headerName: 'Agents sent',
    width: 125,
    disableColumnMenu: true,
  },
  {
    field: 'agentsTerminated',
    headerName: 'Agents lost',
    width: 125,
    disableColumnMenu: true,
  },
]

function getRow(
  mission: Mission,
  missionSite: MissionSite,
  factions: Faction[],
): MissionRow {
  return {
    id: mission.Id,
    turn: missionSite.TurnDeactivated!,
    state: mission.CurrentState,
    difficulty: missionSite.Difficulty,
    name: getFaction(missionSite, factions).Name,
    agentsSent: mission.AgentsSent,
    agentsTerminated: mission.AgentsTerminated,
  }
}
