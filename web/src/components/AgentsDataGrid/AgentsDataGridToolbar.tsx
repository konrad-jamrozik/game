import AddIcon from '@mui/icons-material/Add'
import ChecklistIcon from '@mui/icons-material/Checklist'
import { Button, Stack, TextField } from '@mui/material'
import { GridToolbarContainer } from '@mui/x-data-grid'
import { useState } from 'react'
import { agentHireCost } from '../../lib/codesync/ruleset'
import type { GameSession } from '../../lib/gameSession/GameSession'
import { Label } from '../utilities/Label'
import {
  AgentsActionDropdown,
  type AgentsActionDropdownProps,
} from './AgentsActionDropdown'
import type { BatchAgentPlayerActionOption } from './batchAgentPlayerActionOptions'

const paddingTop = '4px'
const stackRowPaddingY = '2px'
const buttonHeight = '40px'

type AgentsDataGridToolbarProps = {
  getSelectedRowsIds: () => number[]
  clearSelectedRows: () => void
  gameSession: GameSession
} & AgentsActionDropdownProps

export function AgentsDataGridToolbar(
  props: AgentsDataGridToolbarProps,
): React.JSX.Element {
  const selectedRowIds: number[] = props.getSelectedRowsIds()
  const [agentsToHireCount, setAgentsToHireCount] = useState(1)

  async function handleHireAgent(): Promise<void> {
    await props.gameSession.hireAgents(agentsToHireCount)
  }

  async function handleBatchAgentPlayerAction(): Promise<void> {
    const action = props.action as Exclude<BatchAgentPlayerActionOption, 'None'>
    console.log(
      `Act on agents clicked! agents ` +
        `ids: ${selectedRowIds.toString()} (#${selectedRowIds.length}), action: ${action}`,
    )
    const success = await props.gameSession.applyBatchAgentPlayerAction(
      action,
      selectedRowIds,
    )
    if (success && action === 'SackAgentsPlayerAction') {
      console.log(`props.clearSelectedRows()`)
      props.clearSelectedRows()
    }
  }

  const selectedAgentCount = selectedRowIds.length
  return (
    <GridToolbarContainer>
      <Stack direction="column" paddingTop={paddingTop}>
        <Stack direction="row" paddingY={stackRowPaddingY} alignItems="center">
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleHireAgent}
            disabled={!props.gameSession.canHireAgents(agentsToHireCount)}
            sx={{ marginRight: '4px', height: buttonHeight }}
          >
            Hire agents
          </Button>
          {agentsToHireCountTextField(agentsToHireCount, setAgentsToHireCount)}
          <Label>Cost: {agentsToHireCount * agentHireCost}</Label>
        </Stack>
        <Stack direction="row" paddingY={stackRowPaddingY} alignItems="center">
          <Button
            color="primary"
            startIcon={<ChecklistIcon />}
            style={{ whiteSpace: 'pre' }}
            onClick={handleBatchAgentPlayerAction}
            disabled={selectedAgentCount === 0 || props.action === 'None'}
            sx={{ height: buttonHeight }}
          >
            Act on agents
          </Button>
          <AgentsActionDropdown {...props} />
        </Stack>
      </Stack>
    </GridToolbarContainer>
  )
}

function agentsToHireCountTextField(
  agentsToHireCount: number,
  setAgentsToHireCount: React.Dispatch<React.SetStateAction<number>>,
): React.JSX.Element {
  return (
    <TextField
      id="textfield-agentsToHireCount"
      label="Count"
      type="number"
      size="small"
      value={agentsToHireCount}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setAgentsToHireCount(event.target.valueAsNumber)
      }}
      InputLabelProps={{
        shrink: true,
      }}
      inputProps={{
        min: 1,
        max: 100,
        step: 1,
      }}
      sx={{ paddingRight: '5px' }}
    />
  )
}
