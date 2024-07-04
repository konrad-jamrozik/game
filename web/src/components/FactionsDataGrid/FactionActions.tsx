import { Stack } from '@mui/material'
import type { GameState } from '../../lib/codesync/GameState'
import { startTiming } from '../../lib/dev'
import type { GameSession } from '../../lib/gameSession/GameSession'
import SliderWithButton from '../utilities/SliderWithButton'
import type { ManageFactionDialogProps } from './ManageFactionDialog'

export function FactionActions(
  props: ManageFactionDialogProps & { gameSession: GameSession; gs: GameState },
): React.JSX.Element {
  async function investIntel(amount: number): Promise<void> {
    console.log(`Executing investIntel(). Resetting elapsed time.`)
    startTiming()
    await props.gameSession.investIntel(props.faction.Id, amount)
  }

  return (
    <Stack direction="column" spacing={1} display="flex" alignItems="center">
      <SliderWithButton
        defaultValue={Math.floor(props.gs.Assets.Intel * 0.2)}
        onClick={investIntel}
        minValue={0}
        maxValue={props.gs.Assets.Intel}
        iconName="Intel"
        label="Invest $TargetID intel"
        loading={props.gameSession.loading}
      />
    </Stack>
  )
}
