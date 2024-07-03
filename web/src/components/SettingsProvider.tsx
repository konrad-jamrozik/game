import { createContext } from 'react'
import { type Settings, useSettings } from '../lib/settings/Settings'
import type { StoredData } from '../lib/storedData/StoredData'

export const SettingsContext = createContext<Settings>(undefined!)

export type SettingsProviderProps = {
  children: React.JSX.Element
  storedData: StoredData
}

export function SettingsProvider(
  props: SettingsProviderProps,
): React.JSX.Element {
  console.log(`render SettingsProvider.tsx`)
  const settings = useSettings(props.storedData)
  return (
    <SettingsContext.Provider value={settings}>
      {props.children}
    </SettingsContext.Provider>
  )
}
