import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { Fragment, useState } from 'react'

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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="transportCap-dialog-title"
        aria-describedby="transportCap-dialog-description"
      >
        <DialogTitle id="transportCap-dialog-title">
          {'Manage transport capacity'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="transportCap-dialog-description">
            Placeholder for transport capacity management
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
