/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import {
  type HTMLElementVisibility,
  expectHeader2,
  clickButtonAndWaitForItToDisappear,
} from '../testUtils'

export class IntroDialogFixture {
  public async close(): Promise<void> {
    await clickButtonAndWaitForItToDisappear('I accept the responsibility')
  }

  public assertVisibility(htmlElementVisibility?: HTMLElementVisibility): void {
    expectHeader2('Situation Report', htmlElementVisibility)
  }
}
