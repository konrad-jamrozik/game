/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'

export class IntroDialogFixture {
  public async close(): Promise<void> {
    await new Promise<void>((resolve) => {
      console.log('IntroDialogFixture.close')
      resolve()
    })
  }

  public assertVisible(isVisible: boolean): void {
    console.log(`IntroDialogFixture.assertVisible(${isVisible})`)
  }
}
