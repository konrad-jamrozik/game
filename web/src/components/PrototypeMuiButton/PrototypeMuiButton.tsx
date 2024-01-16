import Button from '@mui/material/Button'

export interface PrototypeMuiButtonProps {
  readonly prop?: string
}

export function PrototypeMuiButton({
  prop = 'default value',
}: PrototypeMuiButtonProps): React.ReactElement {
  return <Button variant="outlined">Hello world {prop}</Button>
}
