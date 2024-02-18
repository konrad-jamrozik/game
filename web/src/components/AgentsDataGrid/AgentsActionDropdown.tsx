import { Box, MenuItem, TextField } from '@mui/material'
import _ from 'lodash'
import {
  type BatchAgentPlayerActionOption,
  batchAgentPlayerActionOptionLabel,
} from './batchAgentPlayerActionOptions'
export type AgentsActionDropdownProps = {
  readonly action: string
  readonly setAction: React.Dispatch<
    React.SetStateAction<BatchAgentPlayerActionOption>
  >
}

export function AgentsActionDropdown(
  props: AgentsActionDropdownProps,
): React.JSX.Element {
  function handleChange(event: React.ChangeEvent): void {
    const target = event.target as HTMLInputElement
    console.log(`"action" is: ${props.action}`)
    console.log(`Set "action" to ${target.value}`)
    props.setAction(target.value as BatchAgentPlayerActionOption)
  }

  return (
    <Box width={210} marginY={1} marginX={0.5}>
      <TextField
        fullWidth
        size="small"
        id="action-textfield-select"
        select
        label="Action"
        defaultValue={props.action}
        value={props.action}
        onChange={handleChange}
      >
        {_.map(Object.entries(batchAgentPlayerActionOptionLabel), (option) => (
          <MenuItem key={option[0]} value={option[0]}>
            {option[1]}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
