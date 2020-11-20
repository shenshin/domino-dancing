import { DoninoInteractiveGame } from './domino-interactive-game.js';
import { DominoDelegate } from './domino-delegate.js';
import { DominoIcon } from './domino-icon.js';
import Utility from './domino-utility.js';

// ЗАНЯТЬСЯ БОЛЬЕЕ УДОБНЫМ html - CSS

/**
 * Connects Dominoes games model class DominoGame with it's
 * HTML representation
 */
class DominoController implements DominoDelegate {
  // start new game by drawing 7 tiles to each player
  game: DoninoInteractiveGame;

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
    this.game = new DoninoInteractiveGame(this);
    this.game.initialTiles = 3;
    this.game.addPlayers('User', 'Luna', 'Beatrix', 'Maxima');

    this.addEventListeners();

    this.restartGame();
  }

  /**
   * Adds event listeners to game buttons
   */
  addEventListeners() {
    const buttonPushed = (event: any) => {
      if (!this.game.findWinners()) {
        switch (event.target.id) {
          case 'miss-move':
            this.game.playerMissedMove();
            break;
          case 'draw-tile':
            if (this.game.stock.length === 0) {
              this.writeMessage('No more tiles in the stock! You miss the move.', 'warning');
              setTimeout(this.game.playerMissedMove.bind(this.game), 1000);
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
      this.restartGame();
    });
  }

  /**
   * Starts Dominoes from the beginning
   */
  restartGame(): void {
    this.writeMessage('Select a tile for the move:');
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
      DominoIcon.create(this.userStock, tile.id, 'vertical').addEventListener('click', (event) => {
        if (!this.game.findWinners()) {
          const selection = this.game.playerSelected(
            (event.target as any).id as string,
          );
          if (selection.isValid) {
            this.updateViews();
            // move goes to the next player
            if (!this.game.findWinners()) {
              this.writeMessage(`You selected ${selection.tile}<br>`);
              setTimeout(() => {
                this.game.javascriptMakesMove();
                this.updateViews();
              }, 2000);
            }
          } else {
            this.writeMessage(`The tile ${selection.tile} does not match the game line!<br>Try another one or Draw a new tile!`, 'warning');
          }
        } else {
          this.gameOverWarning();
        }
      });
    });
    // draw play line
    this.game.playLine.forEach((tile) => {
      const tileHTML = DominoIcon.create(this.playLine, tile.id, 'mixed');
      if (tile.id === this.game.firstTile.id) {
        tileHTML.classList.add('first-in-line');
      }
    });
  }

  private writeMessage(text: string, type: 'info' | 'warning' = 'info', large: boolean = false) {
    this.messageField.className = type;
    this.messageField.innerHTML = text;
    if (large) {
      this.messageField.classList.add('winner');
    } else {
      this.messageField.classList.remove('winner');
    }
  }

  private writeLog(text: string) {
    this.dominoLog.innerText += `\n${text}\n`;
  }

  private gameOverWarning() {
    const winners = this.game.findWinners();
    const many: boolean = winners!.length > 1;
    const names: string = winners!.map((w) => w.name).join(', ');
    this.writeMessage(`The game is finished. The winner${many ? 's are' : ' is'}: ${names} <br>Restart the game!`, 'warning');
  }

  /* ************** methods called on the different game states **************** */

  onStart(...tile: string[]) {
    this.writeLog(`Now playing: ${this.game.players
      .map((p) => p.name)
      .join(', ')}`);
    this.writeLog(`Game is starting with ${tile.join(' ')}`);
  }

  onNextMove(moveNumber: number) {
    this.writeLog(`Move ${moveNumber} --------------------------------------------------------------------`);
  }

  onSuccess(
    name: string,
    matching: string,
    connecting: string,
    board: string,
    playersStock: string,
  ) {
    this.writeMessage(`'${name}' played ${matching} to connect to tile ${connecting}.<br><br>Select a tile for your move:`);

    this.writeLog(`${name} plays ${matching} to connect to tile ${connecting} on the board.
    Board is now: ${board}
    ${playersStock}`);
  }

  onRepeat(playerName: string, newTile: string) {
    this.writeLog(`${playerName} can't play, drawing tile ${newTile}`);
  }

  onMiss(name: string) {
    const message = `${name} misses move`;
    this.writeMessage(message, 'warning');
    this.writeLog(message);
  }

  onWin(winnersNames: string[], tilesLeft: number = 0) {
    if (winnersNames.length === 1) {
      const name = winnersNames[0];
      const message = `${name} has won!`;
      this.writeMessage(message, 'info', true);
      this.writeLog(message);
      if (tilesLeft > 0) {
        const manyPlayers: boolean = this.game.players.length - 1 > 1;
        this.writeLog(`${name} still has ${tilesLeft} tile${
          tilesLeft > 1 ? 's' : ''
        } in the stock, but the other${manyPlayers ? 's have' : ' player has'} more.`);
      }
    } else if (winnersNames.length > 1) {
      const message = `DRAW! The players ${winnersNames.join(', ')} have ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} left each.`;
      this.writeMessage(message, 'info', true);
      this.writeLog(message);
    } else {
      throw new Error(`Unexpected number of winners in the game: ${winnersNames.length}`);
    }
    this.updateViews();
  }
}

// eslint-disable-next-line no-new
new DominoController();
