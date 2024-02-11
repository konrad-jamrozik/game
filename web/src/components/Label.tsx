import { Paper } from '@mui/material'

export type LabelProps = {
  children?: React.ReactNode
}
export function Label(props: LabelProps): React.JSX.Element {
  return (
    <Paper
      sx={{
        padding: '2px',
        paddingX: '10px',
        margin: '2px',
      }}
    >
      {props.children}
    </Paper>
  )
}
