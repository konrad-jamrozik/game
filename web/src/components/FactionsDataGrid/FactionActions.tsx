import { Stack } from '@mui/material'
import type { GameState } from '../../lib/codesync/GameState'
import SliderWithButton from '../SliderWithButton/SliderWithButton'
import type { ManageFactionDialogProps } from './ManageFactionDialog'

export function FactionActions(
  props: ManageFactionDialogProps & { gs: GameState },
): React.JSX.Element {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function investIntel(amount: number): void {
    console.log(`investIntel(${amount}) NOT IMPLEMENTED`)
  }

  return (
    <Stack direction="column" spacing={1} display="flex" alignItems="center">
      <SliderWithButton
        defaultValue={Math.floor(props.gs.Assets.Intel * 0.2)}
        onClick={async (intel: number) => {
          await Promise.resolve()
          investIntel(intel)
        }}
        minValue={0}
        maxValue={props.gs.Assets.Intel}
        iconName="Intel"
        label="Invest $TargetID intel"
      />
      <SliderWithButton
        defaultValue={Math.floor(props.gs.Assets.Intel * 0.5)}
        onClick={async (intel: number) => {
          await Promise.resolve()
          investIntel(intel)
        }}
        minValue={0}
        maxValue={props.gs.Assets.Intel}
        iconName="Intel"
        label="Invest $TargetID intel"
      />
    </Stack>
  )
}
