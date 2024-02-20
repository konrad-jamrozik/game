import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Button } from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import type { GameSession } from '../../lib/GameSession'
import {
  AgentsActionDropdown,
  type AgentsActionDropdownProps,
} from './AgentsActionDropdown'
import type { BatchAgentPlayerActionOption } from './batchAgentPlayerActionOptions'

type AgentsDataGridToolbarProps = {
  getSelectedRowsIds: () => number[]
  clearSelectedRows: () => void
  gameSession: GameSession
} & AgentsActionDropdownProps

export function AgentsDataGridToolbar(
  props: AgentsDataGridToolbarProps,
): React.JSX.Element {
  const selectedRowIds: number[] = props.getSelectedRowsIds()

  async function handleHireAgent(): Promise<void> {
    await props.gameSession.applyPlayerAction('HireAgents')
  }

  async function handleBatchAgentPlayerAction(): Promise<void> {
    const action = props.action as Exclude<BatchAgentPlayerActionOption, 'None'>
    console.log(
      `Act on agents clicked! agents ` +
        `ids: ${selectedRowIds.toString()} (#${selectedRowIds.length}), action: ${action}`,
    )
    const success = await props.gameSession.applyPlayerAction(
      action,
      selectedRowIds,
    )
    if (success && action === 'SackAgents') {
      console.log(`props.clearSelectedRows()`)
      props.clearSelectedRows()
    }
  }

  const selectedAgentCount = selectedRowIds.length
  return (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleHireAgent}
        disabled={!props.gameSession.canHire1Agent()}
      >
        Hire agent
      </Button>
      <Button
        color="primary"
        startIcon={<ChecklistIcon />}
        style={{ whiteSpace: 'pre' }}
        onClick={handleBatchAgentPlayerAction}
        disabled={selectedAgentCount === 0 || props.action === 'None'}
      >
        Act on agents
      </Button>
      <AgentsActionDropdown {...props} />
    </GridToolbarContainer>
  )
}
