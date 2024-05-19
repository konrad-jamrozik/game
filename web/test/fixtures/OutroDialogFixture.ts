/* eslint-disable @typescript-eslint/class-methods-use-this */
import _ from 'lodash'
import {
  type HTMLElementVisibility,
  expectHeader2,
  clickButtonAndWaitForItToDisappear,
} from '../testUtils'

export class OutroDialogFixture {
  public async close(): Promise<void> {
    await clickButtonAndWaitForItToDisappear('I am sorry')
  }

  public assertVisibility(
    htmlElementVisibility?: HTMLElementVisibility,
    waitForElement = false,
  ): void {
    expectHeader2('Situation Report', htmlElementVisibility, waitForElement)
  }
}
