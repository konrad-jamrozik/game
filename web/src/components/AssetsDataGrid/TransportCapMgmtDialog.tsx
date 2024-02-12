import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import { getSx } from '../../lib/rendering'
import { transportCapBuyingCost } from '../../types/ruleset'
import { Label } from '../Label'

export type TransportCapMgmtDialogProps = {
  readonly rowName: string
  readonly money: number
  readonly maxTransportCapacity: number
}

export default function TransportCapMgmtDialog(
  props: TransportCapMgmtDialogProps,
): React.JSX.Element {
  const [open, setOpen] = useState<boolean>(false)

  function handleClickOpen(): void {
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function handleIncreaseTransportCap(): void {
    console.log("Clicked 'increase transport capacity'!")
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
              <Label>{props.money}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('MaxTransportCapacity')}>Current capacity</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{props.maxTransportCapacity}</Label>
            </Grid>
            <Grid xs={8}>
              <Label sx={getSx('Cost')}>Capacity increase cost</Label>
            </Grid>
            <Grid xs={4}>
              <Label>{transportCapBuyingCost(1)}</Label>
            </Grid>
            <Grid xs={12} display="flex" justifyContent="center">
              <Button variant="contained" onClick={handleIncreaseTransportCap}>
                Increase transport capacity
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
