import { Paper, Typography, type SxProps, type Theme } from '@mui/material'

export type LabelProps = {
  sx?: SxProps<Theme>
  children?: React.ReactNode
}
export function Label(props: LabelProps): React.JSX.Element {
  const sx = props.sx ?? {}
  return (
    <Paper
      sx={{
        padding: '2px',
        paddingX: '10px',
        margin: '2px',
      }}
    >
      <Typography sx={sx}>{props.children}</Typography>
    </Paper>
  )
}
