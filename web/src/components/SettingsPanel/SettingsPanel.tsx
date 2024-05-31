/* eslint-disable sonarjs/no-duplicate-string */
import { Button, Card, CardContent, CardHeader, Switch } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { type Settings, useSettingsContext } from '../../lib/settings/Settings'
import { Label } from '../Label'

// kja redo settings panel using list:
// https://mui.com/material-ui/react-list/#switch
export function SettingsPanel(): React.JSX.Element {
  const settings: Settings = useSettingsContext()

  function handleIntroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setIntroEnabled(event.target.checked)
  }

  function handleOutroEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setOutroEnabled(event.target.checked)
  }

  function handleChartsEnabledChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    settings.setChartsEnabled(event.target.checked)
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
              checked={settings.introEnabled}
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
              checked={settings.outroEnabled}
              onChange={handleOutroEnabledChange}
              inputProps={{ 'aria-label': 'Show Outro' }}
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
            <Label typographyVariant="body1">Show charts</Label>
            <Switch
              checked={settings.chartsEnabled}
              onChange={handleChartsEnabledChange}
              inputProps={{ 'aria-label': 'Show charts' }}
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
