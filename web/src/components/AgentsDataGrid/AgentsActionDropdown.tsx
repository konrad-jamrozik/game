import { Box, MenuItem, TextField } from '@mui/material'
import _ from 'lodash'

export type AgentsActionDropdownProps = {
  readonly action: string
  readonly setAction: React.Dispatch<React.SetStateAction<string>>
}

export function AgentsActionDropdown(
  props: AgentsActionDropdownProps,
): React.JSX.Element {
  function handleChange(event: React.ChangeEvent): void {
    const target = event.target as HTMLInputElement
    console.log(`"action" is: ${props.action}`)
    console.log(`Set "action" to ${target.value}`)
    props.setAction(target.value)
  }

  return (
    <Box width={210} marginY={1}>
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
        {_.map(options, (option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

const options = [
  'None',
  'Assign to income gen.',
  'Assign to intel gath.',
  'Assign to training',
  'Deploy on a mission',
  'Recall',
  'Sack',
]
