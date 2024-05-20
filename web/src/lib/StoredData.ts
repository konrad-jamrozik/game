import _ from 'lodash'
import type { GameSessionDataType } from './GameSessionData'

export type SettingsType = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
}

export type StoredDataType = {
  readonly settings: SettingsType
  readonly gameSessionData?: GameSessionDataType | undefined
}

// kja move this data loading logic to its own class + load by iterating keys of StoredData type
export function loadDataFromLocalStorage(): StoredDataType {
  const gameSessionData = loadGameSessionData()
  const settings = loadSettings()
  return { gameSessionData, settings }
}

function loadGameSessionData(): GameSessionDataType | undefined {
  const storedGameSessionDataString: string | null =
    localStorage.getItem('gameSessionData')
  if (!_.isNil(storedGameSessionDataString)) {
    const gameSessionData: GameSessionDataType = JSON.parse(
      storedGameSessionDataString,
    ) as GameSessionDataType
    console.log('Loaded game session data from local storage', gameSessionData)
    return gameSessionData
    // eslint-disable-next-line no-else-return
  } else {
    console.log('No game session data found in local storage')
    return undefined
  }
}

export function loadSettings(): SettingsType {
  const storedSettingsString: string | null = localStorage.getItem('settings')
  if (!_.isNil(storedSettingsString)) {
    const settings: SettingsType = JSON.parse(
      storedSettingsString,
    ) as SettingsType
    console.log('Loaded settings from local storage', settings)
    return settings
    // eslint-disable-next-line no-else-return
  } else {
    console.log('No settings found in local storage. Using default settings.')

    return { introEnabled: true, outroEnabled: true }
  }
}

// kja issue when trying to store 300 turns:
// Uncaught (in promise) DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'gameSessionData' exceeded the quota.
// https://stackoverflow.com/questions/23977690/setting-the-value-of-dataurl-exceeded-the-quota
