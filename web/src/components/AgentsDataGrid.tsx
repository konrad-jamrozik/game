import { Box } from '@mui/material'
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import type { Agent, AgentState } from '../types/GameState'

export type AgentsDataGridProps = {
  readonly agents: readonly Agent[]
}

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const rows: AgentRow[] = _.map(props.agents, getRow)

  return (
    <Box sx={{ height: 400, width: '100%' }}>
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

type AgentRow = {
  id: number
  state: AgentState
  turnHired: number
  turnsInTraining: number
  recoversIn: number
  missionsSurvived: number
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'state',
    headerName: 'State',
    width: 150,
  },
  {
    field: 'turnHired',
    headerName: 'Turn Hired',
    width: 150,
  },
  {
    field: 'turnsInTraining',
    headerName: 'Training T#',
    width: 150,
  },
  {
    field: 'recoversIn',
    headerName: 'Recovers In',
    width: 150,
  },
  {
    field: 'missionsSurvived',
    headerName: 'Missions#',
    width: 150,
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
  }
}
