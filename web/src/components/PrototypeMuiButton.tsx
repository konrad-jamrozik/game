import Button from '@mui/material/Button'

export type PrototypeMuiButtonProps = {
  readonly prop?: string
}

export function PrototypeMuiButton({
  prop = 'default value',
}: PrototypeMuiButtonProps): React.JSX.Element {
  return <Button variant="outlined">Hello world {prop}</Button>
}