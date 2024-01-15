export interface PrototypeApiCallProps {
  readonly prop?: string
}

export function PrototypeApiCall({
  prop = 'default value',
}: PrototypeApiCallProps): JSX.Element {
  return <div>PrototypeApiCall {prop}</div>
}

