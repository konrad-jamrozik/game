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
  readonly eventLogEnabled: boolean
  readonly missionLogEnabled: boolean
}

export const defaultSettingsData: SettingsDataType = {
  introEnabled: true,
  outroEnabled: true,
  chartsEnabled: true,
  eventLogEnabled: true,
  missionLogEnabled: true,
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

  const [eventLogEnabled, setEventLogEnabled] = useState<boolean>(
    storedSettingsData.eventLogEnabled,
  )

  const [missionLogEnabled, setMissionLogEnabled] = useState<boolean>(
    storedSettingsData.missionLogEnabled,
  )

  return new Settings(
    storedData,
    introEnabled,
    setIntroEnabled,
    outroEnabled,
    setOutroEnabled,
    chartsEnabled,
    setChartsEnabled,
    eventLogEnabled,
    setEventLogEnabled,
    missionLogEnabled,
    setMissionLogEnabled,
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
    public readonly eventLogEnabled: boolean,
    private readonly setEventLogEnabled: React.Dispatch<
      React.SetStateAction<boolean>
    >,
    public readonly missionLogEnabled: boolean,
    private readonly setMissionLogEnabled: React.Dispatch<
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

  public updateEventLogEnabled(value: boolean): void {
    this.saveSettings({ eventLogEnabled: value })
    this.setEventLogEnabled(value)
  }

  public updateMissionLogEnabled(value: boolean): void {
    this.saveSettings({ missionLogEnabled: value })
    this.setMissionLogEnabled(value)
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
    this.setEventLogEnabled(defaultSettingsData.eventLogEnabled)
    this.setMissionLogEnabled(defaultSettingsData.missionLogEnabled)
  }

  private saveSettings({
    introEnabled,
    outroEnabled,
    chartsEnabled,
    eventLogEnabled,
    missionLogEnabled,
  }: {
    introEnabled?: boolean
    outroEnabled?: boolean
    chartsEnabled?: boolean
    eventLogEnabled?: boolean
    missionLogEnabled?: boolean
  }): void {
    const newSettingsData: SettingsDataType = {
      introEnabled: introEnabled ?? this.introEnabled,
      outroEnabled: outroEnabled ?? this.outroEnabled,
      chartsEnabled: chartsEnabled ?? this.chartsEnabled,
      eventLogEnabled: eventLogEnabled ?? this.eventLogEnabled,
      missionLogEnabled: missionLogEnabled ?? this.missionLogEnabled,
    }
    this.storedData.saveSettingsData(newSettingsData)
  }
}
