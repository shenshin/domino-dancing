import { DoninoInteractiveGame } from './domino-interactive-game.js';
import { DominoDelegate } from './domino-delegate.js';
import { DominoIcon } from './domino-icon.js';
import Utility from './domino-utility.js';

/**
 * Connects Dominoes games model class DominoGame with it's
 * HTML representation
 */
class DominoController implements DominoDelegate {
  // start new game by drawing 7 tiles to each player
  game: DoninoInteractiveGame = new DoninoInteractiveGame({ delegate: this, tilesNumber: 7 });

  // HTML references
  userStock: HTMLElement = Utility.getElement('user-stock');

  playLine: HTMLElement = Utility.getElement('play-line');

  messageField: HTMLElement = Utility.getElement('message');

  dominoLog: HTMLElement = Utility.getElement('domino-log');

  restartButton: HTMLElement = Utility.getElement('restart');

  missMoveButton: HTMLElement = Utility.getElement('miss-move');

  drawTileButton: HTMLElement = Utility.getElement('draw-tile');

  simulateButton: HTMLElement = Utility.getElement('simulate');

  constructor() {
    this.game.addPlayers('User', 'Luna', 'Beatrix');

    this.addEventListeners();

    this.restartGame();
  }

  /**
   * Adds event listeners to game buttons
   */
  addEventListeners() {
    const buttonPushed = (event: any) => {
      if (!this.game.gameOver) {
        switch (event.target.id) {
          case 'miss-move':
            this.game.playerMissedMove();
            break;
          case 'draw-tile':
            if (this.game.stock.length === 0) {
              this.messageField.className = 'warning';
              this.messageField.innerHTML = 'No more tiles in the stock! You miss the move.';
              setTimeout(this.game.playerDrawsTile.bind(this.game), 1000);
            } else {
              this.game.playerDrawsTile();
            }
            break;
          case 'simulate':
            this.game.runSimulation();
            break;
          default:
        }
        this.updateViews();
      } else {
        this.gameOverWarning();
      }
    };
    [
      this.missMoveButton,
      this.drawTileButton,
      this.simulateButton,
    ].forEach((button) => button.addEventListener('click', buttonPushed));

    this.restartButton.addEventListener('click', () => {
      this.messageField.innerHTML = 'Select a tile for the move:';
      this.messageField.className = 'info';
      this.restartGame();
    });
  }

  /**
   * Starts Dominoes from the beginning
   */
  restartGame(): void {
    this.game.restart();
    this.updateViews();
    this.dominoLog.innerText = '';
  }

  /**
   * Redraws user stock and game line on each tile selection.
   * Adds event listeners to tiles
   */
  updateViews(): void {
    this.userStock.innerText = '';
    this.playLine.innerText = '';
    // draw user stock and add event listeners to tiles on screen
    this.game.players[0].stock.forEach((tile) => {
      DominoIcon.create({
        stock: this.userStock,
        id: tile.id,
      }).addEventListener('click', (event) => {
        if (!this.game.gameOver) {
          const selection = this.game.playerSelected(
            (event.target as any).id as string,
          );
          if (selection.isValid) {
            this.messageField.className = 'info';
            this.messageField.innerHTML = `You selected ${selection.tile}<br><br>`;
            // move goes to the next player
            const makeMove = () => {
              this.game.javascriptMakesMove();
              this.updateViews();
            };
            setTimeout(makeMove, 2000);
          } else {
            this.messageField.className = 'warning';
            this.messageField.innerHTML = `The tile ${selection.tile} does not match the game line! <br>Try another one or Draw a new tile!`;
          }
          this.updateViews();
        } else {
          this.gameOverWarning();
        }
      });
    });
    // draw play line
    this.game.playLine.forEach((tile) => {
      DominoIcon.create({ stock: this.playLine, id: tile.id });
    });
  }

  private gameOverWarning() {
    this.messageField.className = 'warning';
    const many: boolean = this.game.winners!.length > 0;
    const winners: string = this.game.winners!.map((w) => w.name).join(', ');
    this.messageField.innerHTML = `The game is finished. The winner${many ? 's are' : ' is'}: ${winners} Restart the game!`;
  }

  /* ************** methods called on the different game states **************** */

  onStart(...tile: string[]) {
    this.dominoLog.innerText += `Now playing: ${this.game.players
      .map((p) => p.name)
      .join(', ')}`;
    this.dominoLog.innerText += `\nGame is starting with ${tile.join(' ')}\n`;
  }

  onNextMove(moveNumber: number) {
    this.dominoLog.innerText += `\nMove ${moveNumber} --------------------------------------------------------------------\n`;
  }

  onSuccess(
    name: string,
    matching: string,
    connecting: string,
    board: string,
    playersStock: string,
  ) {
    this.messageField.className = 'info';
    this.messageField.innerHTML = `'${name}' played ${matching} to connect to tile ${connecting}.<br><br>Select a tile for your move:`;

    this.dominoLog.innerText += `\n${name} plays ${matching} to connect to tile ${connecting} on the board
Board is now: ${board}
${playersStock}\n`;
  }

  onRepeat(playerName: string, newTile: string) {
    this.dominoLog.innerText += `\n${playerName} can't play, drawing tile ${newTile}`;
  }

  onMiss(name: string) {
    const message = `${name} misses move`;
    this.messageField.className = 'warning';
    this.messageField.innerHTML = message;

    this.dominoLog.innerText += `\n${message}`;
  }

  onWin(winnersNames: string[], tilesLeft: number = 0) {
    this.messageField.className = 'info';
    this.messageField.classList.add('winner');
    if (winnersNames.length === 1) {
      const name = winnersNames[0];
      this.messageField.innerHTML = `'${name}' has won!`;
      this.dominoLog.innerText += `\n${name} has won! `;
      if (tilesLeft > 0) {
        const manyPlayers: boolean = this.game.players.length - 1 > 1;
        this.dominoLog.innerText += `${name} still has ${tilesLeft} tile${
          tilesLeft > 1 ? 's' : ''
        } in the stock, but the other${manyPlayers ? 's have' : ' player has'} more.`;
      }
    } else if (winnersNames.length > 1) {
      const message = `DRAW! The players ${winnersNames.join(', ')} have ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} left each.`;
      this.messageField.innerHTML = message;
      this.dominoLog.innerText += `\n${message}`;
    } else {
      throw new Error(`Unexpected number of winners in the game: ${winnersNames.length}`);
    }
    this.updateViews();
  }
}

// eslint-disable-next-line no-new
new DominoController();
