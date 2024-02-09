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

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const rows: AgentRow[] = _.map(props.agents, getRow)

  return (
    <Box sx={{ height: tableHeight, width: 430 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 100,
            },
          },
          columns: {
            columnVisibilityModel: {
              missionsSurvived: false,
              turnHired: false,
              turnsInTraining: false,
            },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={onRowSelectionModelChange}
        rowHeight={30}
        sx={(theme) => ({
          bgcolor: theme.palette.background.default,
          '& .MuiDataGrid-footerContainer': {
            minHeight: '40px', // Reduce the height of the footer container
          },
        })}
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
  survivalSkill: number
  recoversIn: number
  missionsSurvived: number
  turnHired: number
  turnsInTraining: number
}

const defaultRowWidth = 100
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
    width: 70,
  },
  {
    field: 'recoversIn',
    headerName: 'Recv T#',
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
