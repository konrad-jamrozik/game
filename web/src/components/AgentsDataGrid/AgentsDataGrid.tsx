import { Box } from '@mui/material'
import {
  DataGrid,
  useGridApiRef,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
  type GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { useState } from 'react'
import { renderAgentStateCell } from '../../lib/rendering'
import { defaultComponentHeight } from '../../lib/utils'
import type { Agent, AgentState } from '../../types/GameState'
import { getSurvivalSkill } from '../../types/ruleset'
import { AgentsDataGridToolbar } from './AgentsDataGridToolbar'

export type AgentsDataGridProps = {
  readonly agents: readonly Agent[]
}

const tableHeight = defaultComponentHeight

// https://mui.com/x/react-data-grid/row-selection/#controlled-row-selection
function onRowSelectionModelChange(
  rowSelectionModel: GridRowSelectionModel,
  details: GridCallbackDetails,
): void {
  console.log('rowSelectionModel:', rowSelectionModel, 'details:', details)
}

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const rows: AgentRow[] = _.map(props.agents, getRow)
  const [action, setAction] = useState<string>('None')

  const apiRef = useGridApiRef()

  function getSelectedRowsIds(): number[] {
    const selectedRows: Map<GridRowId, GridValidRowModel> =
      apiRef.current.getSelectedRows()
    const selectedRowIds: GridRowId[] = [...selectedRows.keys()]
    return _.map(selectedRowIds, (gridRowId) => gridRowId as number)
  }

  return (
    <Box sx={{ height: tableHeight, width: 550 }}>
      <DataGrid
        apiRef={apiRef}
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
        slots={{
          toolbar: () => (
            <AgentsDataGridToolbar
              {...{ getSelectedRowsIds, action, setAction }}
            />
          ),
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

export type AgentRow = {
  id: number
  state: AgentState
  survivalSkill: number
  recoversIn: number
  missionsSurvived: number
  turnHired: number
  turnsInTraining: number
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'state',
    headerName: 'State',
    width: 120,
    renderCell: renderAgentStateCell,
  },
  {
    field: 'survivalSkill',
    headerName: 'Skill',
    width: 100,
  },
  {
    field: 'recoversIn',
    headerName: 'Recv T#',
    width: 120,
  },
  {
    field: 'missionsSurvived',
    headerName: 'Missions#',
    width: 120,
  },
  {
    field: 'turnHired',
    headerName: 'Turn Hired',
    width: 120,
  },
  {
    field: 'turnsInTraining',
    headerName: 'Training T#',
    width: 130,
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