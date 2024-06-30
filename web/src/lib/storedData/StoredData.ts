/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import * as LZString from 'lz-string'
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

  public resetGameSessionData(): void {
    this.removeFromLocalStorage('gameSessionData')
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
    key: T,
    value: StoredDataTypeMap[T],
  ): void {
    const json: string = JSON.stringify(value)

    // https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem
    // Max in Chrome is 5_000_000 bytes for the entire local storage. See storage.test.ts for details.
    const mustCompress = json.length >= 4_999_000
    const compressedJson: string | undefined = mustCompress
      ? LZString.compressToUTF16(json)
      : undefined

    console.log(
      `setInLocalStorage. key: '${key}'. json.length: ${json.length}, compressedJson.length: ${compressedJson?.length}.`,
    )
    try {
      if (mustCompress) {
        localStorage.setItem(`${key}_compressed`, compressedJson!)
        localStorage.setItem(`${key}_isCompressed`, 'true')
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, json)
        localStorage.removeItem(`${key}_compressed`)
        localStorage.setItem(`${key}_isCompressed`, 'false')
      }
    } catch (error: unknown) {
      if (error instanceof DOMException) {
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMException
        // See storage.test.ts for details.
        const errMsg =
          `Error setting item in local storage. Key: '${key}'. json.length: ${json.length}}, ` +
          `compressedJson.length: ${compressedJson?.length}. cause.message: ${error.message}`
        console.error(errMsg)
        throw new Error(errMsg, { cause: error })
      }
      throw error
    }
  }

  private removeFromLocalStorage<T extends StoredDataTypeName>(key: T): void {
    localStorage.removeItem(key)
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
  if (_.isUndefined(loadedSettings)) {
    console.log('No settings found in local storage. Using default settings.')
    loadedSettings = defaultSettingsData
  }
  return loadedSettings
}

function load<T extends StoredDataTypeName>(
  key: T,
): StoredDataTypeMap[T] | undefined {
  const isCompressed = localStorage.getItem(`${key}_isCompressed`) === 'true'

  const data = isCompressed
    ? LZString.decompressFromUTF16(localStorage.getItem(`${key}_compressed`)!)
    : localStorage.getItem(key)

  if (!_.isNil(data)) {
    const loadedData = JSON.parse(data) as StoredDataTypeMap[T]
    console.log(
      `Load from local storage data at key '${key}'. data.length: ${data.length}.`,
    )
    return loadedData
    // eslint-disable-next-line no-else-return
  } else {
    console.log(`Load from local storage data at key '${key}': undefined`)
    return undefined
  }
}
