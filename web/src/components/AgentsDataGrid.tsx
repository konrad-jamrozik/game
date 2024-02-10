import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Box, Button, MenuItem, TextField } from '@mui/material'
import {
  DataGrid,
  GridToolbarContainer,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowSelectionModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { useState } from 'react'
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
    <Box sx={{ height: tableHeight, width: 550 }}>
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
        slots={{
          toolbar,
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

function handleHireAgent(): void {
  console.log('Hire agent clicked!')
}

function toolbar(): React.JSX.Element {
  // kja hook it up to selection model
  const agCount = 999
  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleHireAgent}>
        Hire agent
      </Button>
      <Button
        color="primary"
        startIcon={<ChecklistIcon />}
        style={{ whiteSpace: 'pre' }}
      >
        Act on <span style={{ width: '25px' }}>{agCount}</span> agents
      </Button>
      <ActionDropdown />
    </GridToolbarContainer>
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

const options = [
  'None',
  'Assign to income gen.',
  'Assign to intel gath.',
  'Assign to training',
  'Recall',
  'Sack',
]

function ActionDropdown(): React.JSX.Element {
  const [action, setAction] = useState<string>('None')

  function handleChange(event: React.ChangeEvent): void {
    const target = event.target as HTMLInputElement
    console.log(`"action" is: ${action}`)
    console.log(`Set "action" to ${target.value}`)
    setAction(target.value)
  }

  return (
    <Box width={210} marginY={1}>
      <TextField
        fullWidth
        size="small"
        id="action-textfield-select"
        select
        label="Action"
        defaultValue={'None'}
        onChange={handleChange}
      >
        {_.map(options, (option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
