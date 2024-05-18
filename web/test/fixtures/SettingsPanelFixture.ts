/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'

export class SettingsPanelFixture {
  public async disableShowIntro(): Promise<void> {
    await new Promise<void>((resolve) => {
      console.log('SettingsPanelFixture.disableShowIntro')
      resolve()
    })
  }

  public assertShowIntro(enabled: boolean): void {
    console.log(`SettingsPanelFixture.assertShowIntro(${enabled})`)
  }
}
