import { DominoGame } from './domino-game.js';
import { DominoDelegate } from './domino-delegate.js';
import { Player } from './domino-player.js';
import { DominoIcon } from './domino-icon.js';
import Utility from './domino-utility.js';

export class DominoController implements DominoDelegate {
  // start new game by drawing 7 tiles to each player
  game: DominoGame = new DominoGame(7);

  // User plays vs JavaScript
  user: Player = new Player('User');

  program: Player = new Player('JavaScript');

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
    this.game.delegate = this;

    this.game.addPlayer(this.user);
    this.game.addPlayer(this.program);

    this.addEventListeners();

    this.restartGame();
  }

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
        this.messageField.className = 'warning';
        this.messageField.innerHTML = `The game is finished. Player '${this.game.winner!.name}' has won! Restart the game!`;
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

  restartGame(): void {
    this.game.restart();
    this.updateViews();
    this.dominoLog.innerText = '';
  }

  /**
   * Redraws user stock and game line on each tile selection
   */
  updateViews(): void {
    this.userStock.innerText = '';
    this.playLine.innerText = '';
    // draw user stock and add event listeners to tiles on screen
    this.user.stock.forEach((tile) => {
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
              this.game.makeMove({ startFrom: 1 });
              this.updateViews();
            };
            setTimeout(makeMove, 2000);
          } else {
            this.messageField.className = 'warning';
            this.messageField.innerHTML = `The tile ${selection.tile} does not match the game line! <br>Try another one or Draw a new tile!`;
          }
          this.updateViews();
        } else {
          this.messageField.className = 'warning';
          this.messageField.innerHTML = `The game is over. ${this.game.winner!.name} has won. Restart the game!`;
        }
      });
    });
    // draw play line
    this.game.playLine.forEach((tile) => {
      DominoIcon.create({ stock: this.playLine, id: tile.id });
    });
  }

  /* ************** methods called on the different game states **************** */

  onStart(...tile: string[]) {
    this.dominoLog.innerText += `Now playing: ${this.game.players
      .map((p) => p.name)
      .join(', ')}`;
    this.dominoLog.innerText += `\nGame is starting with ${tile.join(' ')}`;
  }

  onNextMove(moveNumber: number) {
    this.dominoLog.innerText += `\n\nMove ${moveNumber} --------------------------------------------------------------------`;
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

  onWin(name: string, tilesLeft: number = 0) {
    this.messageField.className = 'info';
    this.messageField.classList.add('winner');
    this.messageField.innerHTML = `'${name}' has won!`;

    this.dominoLog.innerText += `\n${name} has won! `;
    if (tilesLeft > 0) {
      this.dominoLog.innerText += `${name} still has ${tilesLeft} tile${
        tilesLeft > 1 ? 's' : ''
      } in the stock, but the others have more.`;
    }
    this.updateViews();
  }
}

export default DominoController;
