/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import type { GameSessionDataType } from '../gameSession/GameSessionData'
import {
  defaultSettingsData,
  type SettingsDataType,
} from '../settings/Settings'
import type {
  StoredDataType,
  StoredDataTypeMap,
  StoredDataTypeName,
} from './StoredDataType'

export class StoredData {
  private data: StoredDataType

  public constructor() {
    this.data = loadDataFromLocalStorage()
  }

  public getGameSessionData(): GameSessionDataType | undefined {
    return this.data.gameSessionData
  }

  public getSettingsData(): SettingsDataType {
    return this.data.settings
  }

  public persistGameSessionData(newGameSessionData: GameSessionDataType): void {
    this.setInLocalStorage('gameSessionData', newGameSessionData)
    this.data = { ...this.data, gameSessionData: newGameSessionData }
  }

  public persistSettingsData(newSettingsData: SettingsDataType): void {
    this.setInLocalStorage('settingsData', newSettingsData)
    this.data = { ...this.data, settings: newSettingsData }
  }

  private setInLocalStorage<T extends StoredDataTypeName>(
    data: T,
    value: StoredDataTypeMap[T],
  ): void {
    localStorage.setItem(data, JSON.stringify(value))
  }
}

export function loadDataFromLocalStorage(): StoredDataType {
  const gameSessionData = loadGameSessionData()
  const settings = loadSettingsData()
  return { gameSessionData, settings }
}

export function loadGameSessionData(): GameSessionDataType | undefined {
  return load('gameSessionData')
}

export function loadSettingsData(): SettingsDataType {
  let loadedSettings = load('settingsData')
  if (loadedSettings === undefined) {
    console.log('No settings found in local storage. Using default settings.')
    loadedSettings = defaultSettingsData
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