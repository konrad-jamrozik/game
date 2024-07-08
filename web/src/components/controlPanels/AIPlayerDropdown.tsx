import { Box, MenuItem, TextField } from '@mui/material'
import _ from 'lodash'
import type { AIPlayerName } from '../../lib/codesync/aiPlayer'
import { aiPlayerOptionLabel } from './aiPlayerOptions'

export type AIPlayerDropdownProps = {
  readonly aiPlayer: AIPlayerName
  readonly setAiPlayer: React.Dispatch<React.SetStateAction<AIPlayerName>>
}

export function AIPlayerDropdown(
  props: AIPlayerDropdownProps,
): React.JSX.Element {
  function handleChange(event: React.ChangeEvent): void {
    const target = event.target as HTMLInputElement
    console.log(`"aiPlayer" is: ${props.aiPlayer}`)
    console.log(`Set "aiPlayer" to ${target.value}`)
    props.setAiPlayer(target.value as AIPlayerName)
  }

  return (
    <Box width={188}>
      <TextField
        fullWidth
        size="small"
        id="aiPlayer-textfield-select"
        select
        label="AI Player"
        defaultValue={props.aiPlayer}
        value={props.aiPlayer}
        onChange={handleChange}
      >
        {_.map(Object.entries(aiPlayerOptionLabel), (option) => (
          <MenuItem key={option[0]} value={option[0]}>
            {option[1]}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}
