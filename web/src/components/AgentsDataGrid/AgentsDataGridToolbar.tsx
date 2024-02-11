import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Button } from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import {
  AgentsActionDropdown,
  type AgentsActionDropdownProps,
} from './AgentsActionDropdown'

type AgentsDataGridToolbarProps = {
  getSelectedRowsIds: () => number[]
} & AgentsActionDropdownProps

export function AgentsDataGridToolbar(
  props: AgentsDataGridToolbarProps,
): React.JSX.Element {
  const selectedRowIds: number[] = props.getSelectedRowsIds()

  function handleHireAgent(): void {
    console.log('Hire agent clicked!')
    console.log('toolbar selectedRowIds:', selectedRowIds)
  }

  function handleAct(): void {
    console.log(
      `Act on agents clicked! agents ` +
        `ids: ${selectedRowIds.toString()} (#${selectedRowIds.length}), action: ${props.action}`,
    )
  }

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
