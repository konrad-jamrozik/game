/* eslint-disable @typescript-eslint/max-params */
/* eslint-disable @typescript-eslint/parameter-properties */
import _ from 'lodash'
import { useContext, useState } from 'react'
import { SettingsContext } from '../../components/SettingsProvider'
import type { StoredData } from '../storedData/StoredData'

export type SettingsDataType = {
  readonly introEnabled: boolean
  readonly outroEnabled: boolean
  readonly chartsEnabled: boolean
}

export const defaultSettingsData: SettingsDataType = {
  introEnabled: true,
  outroEnabled: true,
  chartsEnabled: true,
}

export function useSettingsContext(): Settings {
  return useContext(SettingsContext)
}

export function useSettings(storedData: StoredData): Settings {
  const storedSettingsData: SettingsDataType = storedData.getSettingsData()
  const [introEnabled, setIntroEnabled] = useState<boolean>(
    storedSettingsData.introEnabled,
  )
  const [outroEnabled, setOutroEnabled] = useState<boolean>(
    storedSettingsData.outroEnabled,
  )
  const [chartsEnabled, setChartsEnabled] = useState<boolean>(
    storedSettingsData.chartsEnabled,
  )

  return new Settings(
    storedData,
    introEnabled,
    setIntroEnabled,
    outroEnabled,
    setOutroEnabled,
    chartsEnabled,
    setChartsEnabled,
  )
}

export class Settings {
  public constructor(
    private readonly storedData: StoredData,
    public readonly introEnabled: boolean,
    private readonly setIntroEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    public readonly outroEnabled: boolean,
    private readonly setOutroEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    public readonly chartsEnabled: boolean,
    private readonly setChartsEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
  ) {}

  public updateIntroEnabled(value: boolean): void {
    this.saveSettings({ introEnabled: value })
    this.setIntroEnabled(value)
  }

  public updateOutroEnabled(value: boolean): void {
    this.saveSettings({ outroEnabled: value })
    this.setOutroEnabled(value)
  }

  public updateChartsEnabled(value: boolean): void {
    this.saveSettings({ chartsEnabled: value })
    this.setChartsEnabled(value)
  }

  public saveOnExit(): void {
    console.log('Settings.saveOnExit()')
    this.saveSettings({})
  }

  public reset(): void {
    console.log('Settings.reset()')
    this.storedData.resetSettingsData()
    this.setIntroEnabled(defaultSettingsData.introEnabled)
    this.setOutroEnabled(defaultSettingsData.outroEnabled)
    this.setChartsEnabled(defaultSettingsData.chartsEnabled)
  }

  private saveSettings({
    introEnabled,
    outroEnabled,
    chartsEnabled,
  }: {
    introEnabled?: boolean
    outroEnabled?: boolean
    chartsEnabled?: boolean
  }): void {
    const newSettingsData: SettingsDataType = {
      introEnabled: introEnabled ?? this.introEnabled,
      outroEnabled: outroEnabled ?? this.outroEnabled,
      chartsEnabled: chartsEnabled ?? this.chartsEnabled,
    }
    this.storedData.saveSettingsData(newSettingsData)
  }
}
