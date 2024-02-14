import { Box } from '@mui/material'
import {
  DataGrid,
  useGridApiRef,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
  type GridValidRowModel,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { useState } from 'react'
import type { Agent, AgentState } from '../../lib/GameState'
import { renderAgentStateCell } from '../../lib/rendering'
import { canBeSentOnMission, getSurvivalSkill } from '../../lib/ruleset'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/utils'
import { AgentsDataGridToolbar } from './AgentsDataGridToolbar'

export type AgentsDataGridProps = {
  readonly agents: readonly Agent[]
  readonly deploymentDisplay?: boolean
  readonly rowSelectionModel?: GridRowSelectionModel
  readonly setRowSelectionModel?: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >
}

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const [action, setAction] = useState<string>('None')
  const deploymentDisplay: boolean = props.deploymentDisplay ?? false
  const agents = !deploymentDisplay
    ? props.agents
    : _.filter(props.agents, canBeSentOnMission)

  const rows: AgentRow[] = _.map(agents, getRow)

  const apiRef = useGridApiRef()

  function getSelectedRowsIds(): number[] {
    const selectedRows: Map<GridRowId, GridValidRowModel> =
      apiRef.current.getSelectedRows()
    const selectedRowIds: GridRowId[] = [...selectedRows.keys()]
    return _.map(selectedRowIds, (gridRowId) => gridRowId as number)
  }

  // https://mui.com/x/react-data-grid/row-selection/#controlled-row-selection
  function onRowSelectionModelChange(
    rowSelectionModel: GridRowSelectionModel,
  ): void {
    if (!_.isUndefined(props.setRowSelectionModel)) {
      props.setRowSelectionModel(rowSelectionModel)
    }
  }

  return (
    <Box
      sx={{
        height: !deploymentDisplay ? defaultComponentHeight : 460,
        minWidth: defaultComponentMinWidth,
        maxWidth: !deploymentDisplay ? 550 : 400,
        width: '100%',
      }}
    >
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
              recoversIn: !deploymentDisplay,
              missionsSurvived: false,
              turnHired: false,
              turnsInTraining: false,
            },
          },
        }}
        slots={
          !deploymentDisplay
            ? {
                toolbar: () => (
                  <AgentsDataGridToolbar
                    {...{ getSelectedRowsIds, action, setAction }}
                  />
                ),
              }
            : {}
        }
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        hideFooterSelectedRowCount={deploymentDisplay}
        disableRowSelectionOnClick
        {...(props.rowSelectionModel ?? {})}
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
