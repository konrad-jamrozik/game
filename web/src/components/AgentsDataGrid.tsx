import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import _ from 'lodash'
import type { Agent } from '../types/GameState'

export type AgentsDataGridProps = {
  readonly agents: readonly Agent[]
}

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const rows: AgentRow[] = _.map(props.agents, (agent) => ({
    id: agent.Id,
    state: agent.CurrentState,
  }))

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
      />
    </Box>
  )
}

type AgentRow = { id: number; state: string }

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'state',
    headerName: 'State',
    width: 150,
    editable: false,
  },
]
