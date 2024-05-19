/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/class-methods-use-this */
import {
  clickButton,
  expectButtonToBeDisabled,
  expectButtonToBeEnabled,
  expectButtonsToBeDisabled,
  expectButtonsToBeEnabled,
  expectParagraph,
} from '../testUtils'

export class GameSessionControlPanelFixture {
  public async advance1Turn(expectGameOver = false): Promise<void> {
    await clickButton(
      'Advance 1 turn',
      expectGameOver ? 'Reset game' : 'Advance 1 turn',
    )
  }

  public async revert1Turn(): Promise<void> {
    await clickButton('Revert 1 turn', 'Advance 1 turn')
  }

  public async resetGame(): Promise<void> {
    await clickButton('Reset game', 'Advance 1 turn')
  }

  public assertNoGameSession(): void {
    expectParagraph('Current turn: N/A')
    expectButtonsToBeDisabled('Reset game', 'Reset turn')
  }

  public assertTurn1(): void {
    expectParagraph('Current turn: 1')
    expectButtonToBeEnabled('Reset game')
    expectButtonToBeDisabled('Revert 1 turn')
  }

  public assertTurn2(): void {
    expectParagraph('Current turn: 2')
    expectButtonsToBeEnabled('Reset game', 'Revert 1 turn')
  }
}
