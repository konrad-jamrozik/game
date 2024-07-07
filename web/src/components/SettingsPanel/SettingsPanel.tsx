import {
  Button,
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Switch,
} from '@mui/material'
import { useSettingsContext, type Settings } from '../../lib/settings/Settings'

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

  // MUI components usage based on: https://mui.com/material-ui/react-list/#switch
  return (
    <Card variant="outlined">
      <CardHeader title="Settings" sx={{ paddingBottom: '0px' }} />
      <List sx={{ width: '100%', maxWidth: 360, paddingTop: '0px' }}>
        <ListItem>
          <ListItemText id="switch-list-introEnabled" primary="Show intro" />
          <Switch
            edge="end"
            checked={settings.introEnabled}
            onChange={handleIntroEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-introEnabled',
            }}
          />
        </ListItem>
        <ListItem>
          <ListItemText id="switch-list-outroEnabled" primary="Show outro" />
          <Switch
            edge="end"
            checked={settings.outroEnabled}
            onChange={handleOutroEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-outroEnabled',
            }}
          />
        </ListItem>
        <ListItem>
          <ListItemText id="switch-list-chartsEnabled" primary="Show charts" />
          <Switch
            edge="end"
            checked={settings.chartsEnabled}
            onChange={handleChartsEnabledChange}
            inputProps={{
              'aria-labelledby': 'switch-list-chartsEnabled',
            }}
          />
        </ListItem>
        <ListItem>
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
        </ListItem>
      </List>
    </Card>
  )
}

// kja clear local storage no longer works, as the storage will be overridden on exit.
// Need to reset settings instead.
