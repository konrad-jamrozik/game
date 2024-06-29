import { Stack, Typography, type SxProps, type Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import _ from 'lodash'
import { Fragment, useState } from 'react'
import type { Faction } from '../../lib/codesync/GameState'
import {
  useGameSessionContext,
  type GameSession,
} from '../../lib/gameSession/GameSession'
import { getSx } from '../../lib/rendering/renderUtils'
import { FactionActions } from './FactionActions'
import { FactionDetails } from './FactionDetails'

export type ManageFactionDialogProps = {
  readonly faction: Faction
}

export default function DeployMissionDialog(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const [open, setOpen] = useState<boolean>(false)

  const gs = gameSession.getCurrentGameStateUnsafe()

  if (_.isUndefined(gs)) {
    return <></>
  }

  function handleOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  const factionNameSx: SxProps<Theme> = [
    getSx(props.faction.Name),
    {
      fontWeight: 'bold',
      borderRadius: '20px',
      paddingX: '12px',
      backgroundColor: '#000',
    },
  ]
  return (
    <Fragment>
      <Button
        variant="text"
        color="primary"
        sx={{ padding: '0px' }}
        onClick={handleOpen}
      >
        Manage
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        fullWidth={false}
      >
        <DialogTitle
          sx={{
            // bgcolor: '#603050',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          Manage&nbsp;
          <Typography variant="inherit" sx={factionNameSx}>
            {` ${props.faction.Name} `}
          </Typography>
          &nbsp;faction
        </DialogTitle>
        <DialogContent
          sx={{
            // bgcolor: '#205050',
            padding: '10px',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <FactionDetails {...props} />
            <FactionActions {...{ ...props, gs }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
