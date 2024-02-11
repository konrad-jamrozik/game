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
// eslint-disable-next-line no-lone-blocks
{
  // kja typography copied over from rendering.tsx / renderAssetNameCell
  // Can be copied over {props.childredn}
  // <Typography style={{ color: 'darkGreen' }}>{props.children}</Typography>
  //
  //<Typography style={style}>{displayedValue}</Typography>style = { color: assetsColors[assetName] } */
}
