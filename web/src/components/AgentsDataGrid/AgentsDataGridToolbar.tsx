import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Button } from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { AgentsActionDropdown } from './AgentsActionDropdown'

type AgentsDataGridToolbarProps = {
  getSelectedRowsIds: () => number[]
  readonly action: string
  readonly setAction: React.Dispatch<React.SetStateAction<string>>
}

export function AgentsDataGridToolbar(
  props: AgentsDataGridToolbarProps,
): React.JSX.Element {
  const selectedRowIds: number[] = props.getSelectedRowsIds()

  function handleHireAgent(): void {
    console.log('Hire agent clicked!')
    console.log('toolbar selectedRowIds:', selectedRowIds)
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
      >
        Act on <span style={{ width: '30px' }}>{selectedAgentCount}</span>{' '}
        agents
      </Button>
      <AgentsActionDropdown {...props} />
    </GridToolbarContainer>
  )
}
