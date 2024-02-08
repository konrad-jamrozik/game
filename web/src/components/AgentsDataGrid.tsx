import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { renderAgentStateCell } from '../lib/rendering'
import { defaultComponentHeight } from '../lib/utils'
import type { Agent, AgentState } from '../types/GameState'
import { getSurvivalSkill } from '../types/ruleset'

export type AgentsDataGridProps = {
  readonly agents: readonly Agent[]
}

const tableHeight = defaultComponentHeight
const defaultRowWidth = 110
export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const rows: AgentRow[] = _.map(props.agents, getRow)

  return (
    <Box sx={{ height: tableHeight, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        sx={{
          '& .MuiDataGrid-footerContainer': {
            minHeight: '40px', // Reduce the height of the footer container
          },
        }}
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

export type AgentRow = {
  id: number
  state: AgentState
  turnHired: number
  turnsInTraining: number
  recoversIn: number
  missionsSurvived: number
  survivalSkill: number
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Agent ID', width: 90 },
  {
    field: 'state',
    headerName: 'State',
    width: defaultRowWidth,
    renderCell: renderAgentStateCell,
  },
  {
    field: 'survivalSkill',
    headerName: 'Skill',
    width: defaultRowWidth,
  },
  {
    field: 'recoversIn',
    headerName: 'Recovers In',
    width: defaultRowWidth,
  },
  {
    field: 'missionsSurvived',
    headerName: 'Missions#',
    width: defaultRowWidth,
  },
  {
    field: 'turnHired',
    headerName: 'Turn Hired',
    width: defaultRowWidth,
  },
  {
    field: 'turnsInTraining',
    headerName: 'Training T#',
    width: defaultRowWidth,
  },
]

function getRow(agent: Agent): AgentRow {
  return {
    id: agent.Id,
    state: agent.CurrentState,
    turnHired: agent.TurnHired,
    turnsInTraining: agent.TurnsInTraining,
    recoversIn: agent.RecoversIn,
    missionsSurvived: agent.MissionsSurvived,
    survivalSkill: getSurvivalSkill(agent),
  }
}
