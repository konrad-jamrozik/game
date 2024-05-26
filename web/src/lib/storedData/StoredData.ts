/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import type { GameSessionDataType } from '../gameSession/GameSessionData'
import type {
  SettingsType,
  StoredDataType,
  StoredDataTypeMap,
  StoredDataTypeName,
} from './StoredDataType'

export class StoredData {
  private data!: StoredDataType

  public constructor() {
    this.reload()
  }

  public reload(): void {
    this.data = loadDataFromLocalStorage()
  }

  public getGameSessionData(): GameSessionDataType | undefined {
    return this.data.gameSessionData
  }

  public getSettings(): SettingsType {
    return this.data.settings
  }

  public persistIntroEnabled(enabled: boolean): void {
    // kja abstract setting settings logic
    const newSettings: SettingsType = {
      ...this.getSettings(),
      introEnabled: enabled,
    }
    localStorage.setItem('settings', JSON.stringify(newSettings))
    // Note: at this point this.getSettings() will still return the old settings.
    // Call .reload() to update them.
  }

  public persistOutroEnabled(enabled: boolean): void {
    // kja abstract setting settings logic
    const newSettings: SettingsType = {
      ...this.getSettings(),
      outroEnabled: enabled,
    }
    localStorage.setItem('settings', JSON.stringify(newSettings))
    // Note: at this point this.getSettings() will still return the old settings.
    // Call .reload() to update them.
  }

  public persistGameSessionData(data: GameSessionDataType): void {
    localStorage.setItem('gameSessionData', JSON.stringify(data))
    // Note: at this point this.getGameSessionData() will still return the old data.
    // Call .reload() to update it.
  }
}

export function loadDataFromLocalStorage(): StoredDataType {
  const gameSessionData = loadGameSessionData()
  const settings = loadSettings()
  return { gameSessionData, settings }
}

export function loadGameSessionData(): GameSessionDataType | undefined {
  return load('gameSessionData')
}

export function loadSettings(): SettingsType {
  let loadedSettings = load('settings')
  if (loadedSettings === undefined) {
    console.log('No settings found in local storage. Using default settings.')
    loadedSettings = { introEnabled: true, outroEnabled: true }
  }
  return loadedSettings
}

function load<T extends StoredDataTypeName>(
  key: T,
): StoredDataTypeMap[T] | undefined {
  // Your loading logic here
  // For example, if you're loading from local storage:
  const data: string | null = localStorage.getItem(key)
  if (!_.isNil(data)) {
    const loadedData = JSON.parse(data) as StoredDataTypeMap[T]
    console.log(`Load from local storage data at key '${key}':`, loadedData)
    return loadedData
    // eslint-disable-next-line no-else-return
  } else {
    console.log(`Load from local storage data at key '${key}': undefined`)
    return undefined
  }
}

// kja issue when trying to store 300 turns:
// Uncaught (in promise) DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'gameSessionData' exceeded the quota.
// https://stackoverflow.com/questions/23977690/setting-the-value-of-dataurl-exceeded-the-quota

// Recommendations:
// https://chatgpt.com/share/b1109c2f-306b-441b-b690-f05435902fc2
// https://github.com/marcuswestin/store.js#list-of-all-plugins
// Related, from React doc: https://github.com/immerjs/immer
