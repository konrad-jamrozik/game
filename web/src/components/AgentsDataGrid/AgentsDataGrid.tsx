/* eslint-disable max-lines-per-function */
import { Box } from '@mui/material'
import {
  DataGrid,
  useGridApiRef,
  type GridColDef,
  type GridRowId,
  type GridRowSelectionModel,
  type GridValidRowModel,
  type GridRowParams,
} from '@mui/x-data-grid'
import _ from 'lodash'
import { useState } from 'react'
import { type GameSession, useGameSessionContext } from '../../lib/GameSession'
import type {
  Agent,
  AgentState,
  MissionSite,
} from '../../lib/codesync/GameState'
import {
  agentPlayerActionConditionMap,
  canBeSentOnMission,
  getSurvivalChanceNonNegative,
  getSurvivalSkill,
} from '../../lib/codesync/ruleset'
import { renderAgentStateCell } from '../../lib/rendering'
import {
  defaultComponentHeight,
  defaultComponentMinWidth,
} from '../../lib/utils'
import { AgentsDataGridToolbar } from './AgentsDataGridToolbar'
import type { BatchAgentPlayerActionOption } from './batchAgentPlayerActionOptions'

export type AgentsDataGridProps = {
  readonly missionSiteToDeploy?: MissionSite | undefined
  readonly rowSelectionModel?: GridRowSelectionModel
  readonly setRowSelectionModel?: React.Dispatch<
    React.SetStateAction<GridRowSelectionModel>
  >
}

export function AgentsDataGrid(props: AgentsDataGridProps): React.JSX.Element {
  const gameSession = useGameSessionContext()
  const [action, setAction] = useState<BatchAgentPlayerActionOption>('None')
  const deploymentDisplay = !_.isUndefined(props.missionSiteToDeploy)

  const agents: Agent[] = gameSession.isLoaded()
    ? filterAgents(gameSession, deploymentDisplay)
    : []

  const rows: AgentRow[] = _.map(agents, (agent) =>
    getRow(agent, deploymentDisplay ? props.missionSiteToDeploy : undefined),
  )

  const apiRef = useGridApiRef()

  // console.log(`agents ids: ${_.map(agents, (agent) => agent.Id).toString()}`)

  function getSelectedRowsIds(): number[] {
    const selectedRows: Map<GridRowId, GridValidRowModel> =
      apiRef.current.getSelectedRows()
    const selectedRowIds: GridRowId[] = [...selectedRows.keys()]
    return _.map(selectedRowIds, (gridRowId) => gridRowId as number)
  }

  function clearSelectedRows(): void {
    apiRef.current.setRowSelectionModel([])
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
        maxWidth: deploymentDisplay ? 488 : 550,
        width: '100%',
      }}
    >
      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        rowSelectionModel={props.rowSelectionModel!}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25,
            },
          },
          columns: {
            columnVisibilityModel: {
              survivalChance: deploymentDisplay,
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
                    {...{
                      getSelectedRowsIds,
                      clearSelectedRows,
                      action,
                      setAction,
                      gameSession,
                    }}
                  />
                ),
              }
            : {}
        }
        pageSizeOptions={[25]}
        checkboxSelection
        isRowSelectable={(params: GridRowParams<AgentRow>) =>
          isAgentRowSelectable(params, action, gameSession)
        }
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

function isAgentRowSelectable(
  params: GridRowParams<AgentRow>,
  action: BatchAgentPlayerActionOption,
  gameSession: GameSession,
): boolean {
  if (!gameSession.isLoaded()) {
    return false
  }

  const { survivalChance, id } = params.row
  if (!_.isUndefined(survivalChance) && survivalChance <= 0) {
    return false
  }

  if (action === 'None') {
    return true
  }

  const agents = gameSession.getAssets().Agents
  const rowAgent: Agent = _.find(agents, (agent) => agent.Id === id)!

  return agentPlayerActionConditionMap[action](rowAgent)
}

function filterAgents(
  gameSession: GameSession,
  deploymentDisplay: boolean,
): Agent[] {
  const gameStateAgents = gameSession.getAssets().Agents
  const agents = deploymentDisplay
    ? _.filter(gameStateAgents, canBeSentOnMission)
    : gameStateAgents
  return agents
}

export type AgentRow = {
  id: number
  state: AgentState
  survivalSkill: number
  survivalChance: number | undefined
  recoversIn: number
  missionsSurvived: number
  turnHired: number
  turnsInTraining: number
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 82 },
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
    field: 'survivalChance',
    headerName: 'Surv. %',
    width: 114,
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

function getRow(agent: Agent, missionSite?: MissionSite | undefined): AgentRow {
  return {
    id: agent.Id,
    state: agent.CurrentState,
    turnHired: agent.TurnHired,
    turnsInTraining: agent.TurnsInTraining,
    recoversIn: agent.RecoversIn,
    missionsSurvived: agent.MissionsSurvived,
    survivalSkill: getSurvivalSkill(agent),
    survivalChance: !_.isUndefined(missionSite)
      ? getSurvivalChanceNonNegative(agent, missionSite)
      : undefined,
  }
}
