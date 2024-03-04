import { Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import _ from 'lodash'
import type { GameResult } from '../lib/GameSession'

export type OutroDialogProps = {
  readonly gameResult: GameResult | undefined
  readonly showOutro: boolean
  readonly setShowOutro: React.Dispatch<React.SetStateAction<boolean>>
}

export default function OutroDialog(
  props: OutroDialogProps,
): React.JSX.Element {
  function handleClose(): void {
    props.setShowOutro(false)
  }

  return (
    <Dialog open={props.showOutro} onClose={handleClose}>
      <DialogTitle
        sx={{
          // bgcolor: '#603050',
          display: 'flex',
          justifyContent: 'center',
          typography: 'h5',
        }}
      >
        {'Situation Report'}
      </DialogTitle>
      <DialogContent sx={{ maxWidth: '550px', paddingBottom: '0px' }}>
        {contentTypographies(
          props.gameResult === 'won'
            ? contentGameWon
            : props.gameResult === 'lost'
              ? contentGameLost
              : ['N/A'],
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '20px' }}>
        <Button variant={'contained'} onClick={handleClose}>
          {props.gameResult === 'won'
            ? 'I shall rest'
            : props.gameResult === 'lost'
              ? 'I am sorry'
              : 'N/A'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const contentGameWon: string[] = [
  `Thanks to your efforts "Solpar" has successfully secured and contained all the major threats to humankind, protecting the world.`,
  `The Secret War is over. You can take your well-deserved rest... for now.`,
]

const contentGameLost: string[] = [
  `With the termination of "Solpar" organization, the humankind started to slowly, but surely, losing the Secret War.`,
  `Eventually, the last remnants of human civilization have crumbled.`,
]

function contentTypographies(content: string[]): React.JSX.Element[] {
  return _.map(content, (paragraph: string, index: number) => (
    <Typography key={index} textAlign={'center'} paddingBottom={'20px'}>
      {paragraph}
    </Typography>
  ))
}
