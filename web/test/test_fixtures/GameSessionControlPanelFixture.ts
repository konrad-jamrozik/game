/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/class-methods-use-this */
import {
  clickButton,
  expectButtonToBeDisabled,
  expectButtonToBeEnabled,
  expectButtonsToBeDisabled,
  expectButtonsToBeEnabled,
  expectParagraph,
  typeIntoElement,
} from '../test_lib/testUtils'

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
  public async resetTurn(): Promise<void> {
    await clickButton('Reset turn', 'Advance 1 turn')
  }

  public async resetGame(): Promise<void> {
    await clickButton('Reset game', 'Advance 1 turn')
  }

  public async delegateTurnsToAi(
    startTurn: number,
    targetTurn: number,
  ): Promise<void> {
    await this.setStartTurn(startTurn)
    await this.setTargetTurn(targetTurn)
    await this.clickDelegateTurnsToAi()
    this.assertTurn(targetTurn)
  }

  public async setStartTurn(startTurn: number): Promise<void> {
    await typeIntoElement('spinbutton', 'start', startTurn.toString())
  }

  public async setTargetTurn(targetTurn: number): Promise<void> {
    await typeIntoElement('spinbutton', 'target', targetTurn.toString())
  }

  public async clickDelegateTurnToAi(expectGameOver = false): Promise<void> {
    await clickButton(
      'Delegate 1 turn to AI',
      expectGameOver ? 'Reset game' : 'Advance 1 turn',
    )
  }

  public async clickDelegateTurnsToAi(expectGameOver = false): Promise<void> {
    await clickButton(
      'Delegate turns to AI:',
      expectGameOver ? 'Reset game' : 'Advance 1 turn',
    )
  }

  public assertNoGameSession(): void {
    expectParagraph('Current turn: N/A')
    expectButtonsToBeDisabled('Reset game', 'Reset turn')
  }

  public assertTurn1(playerMadeActions = false): void {
    expectParagraph('Current turn: 1')
    expectButtonToBeEnabled('Reset game')
    if (playerMadeActions) {
      expectButtonToBeEnabled('Reset turn')
    } else {
      expectButtonToBeDisabled('Revert 1 turn')
    }
  }

  public assertTurn2(playerMadeActions = false): void {
    this.assertTurn(2, playerMadeActions)
  }

  public assertTurn(turn: number, playerMadeActions?: boolean): void {
    if (turn < 2) {
      throw new Error('Turn must be 2 or greater')
    }
    expectParagraph(`Current turn: ${turn}`)
    const turnReversalButton =
      playerMadeActions ?? false ? 'Reset turn' : 'Revert 1 turn'
    expectButtonsToBeEnabled('Reset game', turnReversalButton)
  }
}
