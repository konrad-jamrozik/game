import { Button, Card, CardContent, CardHeader, Switch } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import _ from 'lodash'
import type { StoredData } from '../../lib/StoredData'
import { Label } from '../Label'

export type SettingsPanelProps = {
  storedData: StoredData
  introEnabled: boolean
  setIntroEnabled: React.Dispatch<React.SetStateAction<boolean>>
  outroEnabled: boolean
  setOutroEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

export function SettingsPanel(props: SettingsPanelProps): React.JSX.Element {
  function handleIntroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    props.setIntroEnabled(event.target.checked)
    props.storedData.setIntroEnabled(event.target.checked)
  }

  function handleOutroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    props.setOutroEnabled(event.target.checked)
    props.storedData.setOutroEnabled(event.target.checked)
  }

  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: '0px' }} />
      <CardContent sx={{ padding: '14px', maxWidth: '250px' }}>
        <Grid container spacing={1}>
          <Grid
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              //backgroundColor: 'rgb(64, 0, 0)',
            }}
          >
            <Label typographyVariant="body1">Show intro</Label>
            <Switch
              checked={props.introEnabled}
              onChange={handleIntroEnabledChange}
              inputProps={{ 'aria-label': 'Show Intro' }}
            />
          </Grid>
          <Grid
            xs={12}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
              //backgroundColor: 'rgb(64, 32, 0)',
            }}
          >
            <Label typographyVariant="body1">Show outro</Label>
            <Switch
              checked={props.outroEnabled}
              onChange={handleOutroEnabledChange}
              inputProps={{ 'aria-label': 'Show Outro' }}
            />
          </Grid>
          <Grid xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                localStorage.clear()
                console.log('Cleared local storage')
              }}
            >
              Clear local storage
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
