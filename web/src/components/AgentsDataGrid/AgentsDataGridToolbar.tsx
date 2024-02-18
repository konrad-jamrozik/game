import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Button } from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import type { GameSession } from '../../lib/GameSession'
import {
  AgentsActionDropdown,
  type AgentsActionDropdownProps,
} from './AgentsActionDropdown'

type AgentsDataGridToolbarProps = {
  getSelectedRowsIds: () => number[]
  gameSession: GameSession
} & AgentsActionDropdownProps

export function AgentsDataGridToolbar(
  props: AgentsDataGridToolbarProps,
): React.JSX.Element {
  const selectedRowIds: number[] = props.getSelectedRowsIds()

  async function handleHireAgent(): Promise<void> {
    console.log('Hire agent clicked!')
    await props.gameSession.applyPlayerAction('hireAgents')
    console.log('Hire agent DONE!')
  }

  function handleAct(): void {
    console.log(
      `Act on agents clicked! agents ` +
        `ids: ${selectedRowIds.toString()} (#${selectedRowIds.length}), action: ${props.action}`,
    )
  }

  // kja need to disable hireAgent button if not enough money
  const selectedAgentCount = selectedRowIds.length
  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleHireAgent}>
        Hire agent
      </Button>
      <Button
        color="primary"
        startIcon={<ChecklistIcon />}
        style={{ whiteSpace: 'pre' }}
        onClick={handleAct}
      >
        Act on <span style={{ width: '30px' }}>{selectedAgentCount}</span>{' '}
        agents
      </Button>
      <AgentsActionDropdown {...props} />
    </GridToolbarContainer>
  )
}
