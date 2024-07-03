import { Paper, Typography, type SxProps, type Theme } from '@mui/material'
import type { Variant } from '@mui/material/styles/createTypography'

export type LabelProps = {
  sx?: SxProps<Theme>
  typographyVariant?: Variant | undefined
  children?: React.JSX.Element
}
export function Label(props: LabelProps): React.JSX.Element {
  const sx = props.sx ?? {}
  return (
    <Paper
      sx={{
        padding: '2px',
        paddingX: '10px',
        margin: '2px',
        ...sx,
      }}
    >
      <Typography variant={props.typographyVariant!}>
        {props.children}
      </Typography>
    </Paper>
  )
}
