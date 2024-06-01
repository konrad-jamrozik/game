/* eslint-disable @typescript-eslint/class-methods-use-this */
import { clickButton, typeIntoElement } from '../test_lib/testUtils'

export class AgentsDataGridFixture {
  public async hire1Agent(): Promise<void> {
    await clickButton('Hire agents', 'Advance 1 turn')
  }

  public async hire10Agents(): Promise<void> {
    await this.setAgentsToHireCount(10)
    await clickButton('Hire agents', 'Advance 1 turn')
  }

  public async setAgentsToHireCount(agentsToHire: number): Promise<void> {
    await typeIntoElement('spinbutton', 'count', agentsToHire.toString())
  }
}
