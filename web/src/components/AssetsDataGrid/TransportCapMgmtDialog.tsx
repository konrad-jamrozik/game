import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import { type GameSession, useGameSessionContext } from '../../lib/GameSession'
import { getSx } from '../../lib/rendering'
import { transportCapBuyingCost } from '../../lib/ruleset'
import { Label } from '../Label'

export type TransportCapMgmtDialogProps = {
  readonly rowName: string
}

export default function TransportCapMgmtDialog(
  props: TransportCapMgmtDialogProps,
): React.JSX.Element {
  const gameSession: GameSession = useGameSessionContext()
  const assets = gameSession.getCurrentStateUnsafe()?.Assets
  const [open, setOpen] = useState<boolean>(false)

  function handleClickOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  async function handleBuy1TransportCap(): Promise<void> {
    await gameSession.applyPlayerAction('buyTransportCap')
  }

  return (
    <Fragment>
      <Button
        variant="text"
        color="primary"
        onClick={() => {
          console.log(`Clicked! ${JSON.stringify(props.rowName, undefined, 2)}`)
          handleClickOpen()
        }}
      >
        Manage
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          id="transportCap-dialog-title"
          sx={{
            // bgcolor: '#603050',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {'Manage transport capacity'}
        </DialogTitle>
        <DialogContent
          sx={{
            // bgcolor: '#205050',
            width: '320px',
            padding: '10px',
          }}
        >
          <Grid
            container
            spacing={1}
            // bgcolor="rgba(100,100,100,0.5)"
          >
            <Grid xs={8}>
              <Label sx={getSx('Money')}>Money</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{assets?.Money}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('MaxTransportCapacity')}>Max capacity</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{assets?.MaxTransportCapacity}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('CurrentTransportCapacity')}>
                Current capacity
              </Label>
            </Grid>
            <Grid xs={4}>
              <Label>{assets?.CurrentTransportCapacity}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('Cost')}>Capacity increase cost</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{transportCapBuyingCost(1)}</Label>
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              <Button
                variant="contained"
                onClick={handleBuy1TransportCap}
                disabled={!gameSession.canBuy1TransportCap()}
              >
                Buy transport capacity
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
