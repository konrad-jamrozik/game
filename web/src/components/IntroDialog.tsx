import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import _ from 'lodash'

export type IntroDialogProps = {
  readonly showIntro: boolean
  readonly setShowIntro: React.Dispatch<React.SetStateAction<boolean>>
}

/**
 * Intro dialog to show when the game is opened for the first time.
 *
 * The exact rules for when to show the intro dialog are as follows:
 *
 * - The dialog will be shown if:
 *   - (the setting of 'introEnabled' is true)
 *   - AND
 *     - (the game session is not loaded upon opening the game window
 *     - OR the game has been reset via appropriate button in GameSessionControlPanel)
 *
 * The 'introEnabled' setting:
 * - Is loaded from local storage upon opening the game window.
 * - Is saved to local storage by changing the appropriate setting in SettingsPanel.
 * - Defaults to 'true' if it was never saved to local storage.
 
 */
export default function IntroDialog(
  props: IntroDialogProps,
): React.JSX.Element {
  function handleClose(): void {
    props.setShowIntro(false)
  }

  return (
    <Dialog open={props.showIntro} onClose={handleClose}>
      <DialogTitle
        sx={{
          // bgcolor: '#603050',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {'Situation Report'}
      </DialogTitle>
      <DialogContent sx={{ maxWidth: '500px' }}>
        {contentTypographies()}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant={'contained'}
          onClick={handleClose}
        >{`I accept the responsibility`}</Button>
      </DialogActions>
    </Dialog>
  )
}

const content: string[] = [
  `The year is 2030. Humanity is waging a secret war against enemies numerous and unknown.
You take the helm of a clandestine organization known as "The Solemn Participants", or "Solpar".`,
  `Your mission is to discover, infiltrate, prioritize and neutralize the gravest threats to the human race.`,
  `Your mission is to participate in the secret war.`,
]

function contentTypographies(): React.JSX.Element[] {
  return _.map(content, (paragraph: string, index: number) => (
    <Typography key={index} textAlign={'center'} gutterBottom={true}>
      {paragraph}
    </Typography>
  ))
}
