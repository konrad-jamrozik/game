import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Unstable_Grid2'
import { Fragment, useState } from 'react'
import { getSx } from '../lib/rendering'
import { Label } from './Label'

export type TransportCapMgmtDialogProps = {
  readonly rowName: string
  //   readonly open: boolean
  //   readonly setOpen: React.Dispatch<React.SetStateAction<boolean>>
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
          <DialogContentText
            // bgcolor={'#209000'}
            id="transportCap-dialog-description"
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
                <Label>300</Label>
              </Grid>
              <Grid xs={8}>
                <Label sx={getSx('MaxTransportCapacity')}>
                  Current capacity
                </Label>
              </Grid>
              <Grid xs={4}>
                <Label>8</Label>
              </Grid>
              <Grid xs={8}>
                <Label sx={getSx('Cost')}>Capacity increase cost</Label>
              </Grid>
              <Grid xs={4}>
                <Label>200</Label>
              </Grid>
              <Grid xs={12} display="flex" justifyContent="center">
                <Button variant="contained">Increase transport capacity</Button>
              </Grid>
            </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
