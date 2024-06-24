import { Stack, type SxProps, type Theme, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Fragment, useState } from 'react'
import type { Faction } from '../../lib/codesync/GameState'
import { getSx } from '../../lib/rendering/renderUtils'

export type ManageFactionDialogProps = {
  readonly faction: Faction
}

export default function DeployMissionDialog(
  props: ManageFactionDialogProps,
): React.JSX.Element {
  // const gameSession: GameSession = useGameSessionContext()
  const [open, setOpen] = useState<boolean>(false)

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
          <Stack
            direction={'row'}
            spacing={2}
            alignItems={'flex-start'}
          ></Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
