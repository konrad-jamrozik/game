import {
  ListItem,
  ListItemText,
  Switch,
  type SxProps,
  type Theme,
} from '@mui/material'
import _ from 'lodash'
import type React from 'react'

type ListItemWithSwitchProps = {
  labelText: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sx?: SxProps<Theme>
}

export function ListItemWithSwitch({
  labelText,
  checked,
  onChange,
  sx,
}: ListItemWithSwitchProps): React.JSX.Element {
  return (
    <ListItemSx sx={sx ?? {}}>
      <ListItemText
        id={`switch-list-${_.camelCase(labelText)}`}
        primary={labelText}
      />
      <Switch
        edge="end"
        checked={checked}
        onChange={onChange}
        inputProps={{
          'aria-labelledby': `switch-list-${_.camelCase(labelText)}`,
        }}
      />
    </ListItemSx>
  )
}

export function ListItemSx({
  sx,
  children,
}: {
  sx?: SxProps<Theme>
  children: React.ReactNode
}): React.JSX.Element {
  return <ListItem sx={{ height: 32, ...sx }}>{children}</ListItem>
}
