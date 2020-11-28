import DoninoInteractiveGame from './domino-interactive-game.js';
import DominoDelegate from './domino-delegate.js';
import DominoIcon from './domino-icon.js';
import Utility from './domino-utility.js';
import Tile from './domino-tile.js';

/**
 * Connects Dominoes games model class DominoGame with it's
 * HTML representation
 */
class DominoController implements DominoDelegate {
  // game model
  game: DoninoInteractiveGame;

  // HTML references to text and buttons
  userStock: HTMLElement = Utility.getElement('user-stock');

  playLine: HTMLElement = Utility.getElement('play-line');

  messageField: HTMLElement = Utility.getElement('message');

  dominoLog: HTMLElement = Utility.getElement('domino-log');

  restartButton: HTMLElement = Utility.getElement('restart');

  missMoveButton: HTMLElement = Utility.getElement('miss-move');

  drawTileButton: HTMLElement = Utility.getElement('draw-tile');

  simulateButton: HTMLElement = Utility.getElement('simulate');

  numberOfPlayersInput = Utility.getElement('number-of-players') as HTMLInputElement;

  tilesPerPlayerInput = Utility.getElement('tiles-per-player') as HTMLInputElement;

  /** Temporary storage to save messages received from the players during one move */
  messagesStack: string = '';

  constructor() {
    // create new game and set this class as a delegate of dame model
    this.game = new DoninoInteractiveGame(this);
    this.addButtonsEventListeners();
    this.addInputsEventListeners();
    this.restartGame();
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
      this.createUsersTile(tile.id);
    });
    // draw play line
    this.game.playLine.forEach((tile) => {
      const tileHTML = DominoIcon.create(this.playLine, tile.id, 'mixed');
      if (tile.id === this.game.firstTile.id) {
        tileHTML.classList.add('first-in-line');
      }
    });
  }

  private addInputsEventListeners() {
    const parse = (e: Event): number => parseInt((e.target as HTMLInputElement).value, 10);
    this.numberOfPlayersInput.addEventListener('change', (e: Event) => {
      this.game.numberOfPlayers = parse(e);
      this.restartGame();
    });
    this.tilesPerPlayerInput.addEventListener('change', (e: Event) => {
      this.game.tilesPerPlayer = parse(e);
      this.restartGame();
    });
  }

  /**
   * Adds event listeners to game buttons
   */
  private addButtonsEventListeners() {
    const buttonPushed = (event: any) => {
      if (!this.game.findWinners()) {
        switch (event.target.id) {
          case 'miss-move':
            this.game.playerMissedMove();
            break;
          case 'draw-tile':
            if (this.game.stock.length === 0) {
              this.writeMessage('No more tiles in the stock! You miss the move.', true, 'warning');
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
        this.sendGameOverWarning();
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

  private createUsersTile(id: string) {
    DominoIcon.create(this.userStock, id, 'vertical').addEventListener('click', (event) => {
      if (!this.game.findWinners()) {
        const selection = this.game.playerSelected(
          (event.target as any).id as string,
        );
        if (selection.isValid) {
          this.updateViews();
          if (!this.game.findWinners()) {
            this.writeMessage(`You played ${selection.tile}<br>`);
            // move goes to the next player
            setTimeout(() => {
              this.game.javascriptMakesMove();
              this.updateViews();
            }, 2000);
          }
        } else {
          this.writeMessage(`The tile ${selection.tile} does not match the game line!<br>Try another one or Draw a new tile!`, true, 'warning');
        }
      } else {
        this.sendGameOverWarning();
      }
    });
  }

  private writeMessage(text: string, isLast: boolean = true, type: 'info' | 'warning' = 'info', large: boolean = false) {
    if (large) {
      this.messagesStack = ''; // remove pevious messages if big text
    }
    this.messagesStack += text;
    if (isLast) {
      this.messageField.className = type;
      this.messageField.innerHTML = this.messagesStack;
      if (large) {
        this.messageField.classList.add('winner');
      } else {
        this.messageField.classList.remove('winner');
      }
      this.messagesStack = '';
    }
  }

  private writeLog(text: string) {
    this.dominoLog.innerText += `\n${text}\n`;
  }

  private sendGameOverWarning() {
    const winners = this.game.findWinners()!;
    const many: boolean = winners.length > 1;
    const names: string = winners.map((w) => w.name).join(', ');
    this.writeMessage(`The game is finished. The winner${many ? 's are' : ' is'}: ${names} <br>Restart the game!`, true, 'warning');
  }

  /* ************** methods called on the different game states **************** */

  onStart() {
    this.writeLog(`Now playing: ${this.game.players
      .map((p) => p.name)
      .join(', ')}`);
    this.writeLog(`Game is starting with ${this.game}`);
  }

  onNextMove() {
    this.writeLog(`Move ${this.game.currentMove} --------------------------------------------------------------------`);
  }

  onSuccess(
    matching: Tile,
    connecting: Tile,
    isLastPlayer: boolean,
  ) {
    const player = this.game.currentPlayer!;
    const message = `'${player.name}' played ${matching} to connect to tile ${connecting}.<br>${isLastPlayer ? 'Select a tile for the move:' : ''}`;
    this.writeMessage(message, isLastPlayer);
    this.writeLog(
      `${player.name} plays ${matching} to connect to tile ${connecting} on the board.\nBoard is now: ${this.game}\n${player}`,
    );
    this.updateViews();
  }

  onRepeat(newTile: Tile) {
    const message = `${this.game.currentPlayer!.name} can't play, drawing tile ${newTile}`;
    this.writeMessage(`${message}<br>`, false, 'warning');
    this.writeLog(message);
    this.updateViews();
  }

  onMiss(isLastPlayer: boolean) {
    const message = `${this.game.currentPlayer!.name} misses move`;
    this.writeMessage(`${message}<br>${isLastPlayer ? 'Select a tile for the move:' : ''}`, isLastPlayer, 'warning');
    this.writeLog(message);
    this.updateViews();
  }

  onWin() {
    const winners = this.game.findWinners()!;
    const winnersNames: string[] = winners.map((w) => w.name);
    const tilesLeft: number = winners[0].stockLength;
    if (winnersNames.length === 1) {
      const [name] = winnersNames;
      const message = `${name} has won!`;
      this.writeMessage(message, true, 'info', true);
      this.writeLog(message);
      if (tilesLeft > 0) {
        const manyPlayers: boolean = this.game.players.length - 1 > 1;
        this.writeLog(`${name} still has ${tilesLeft} tile${
          tilesLeft > 1 ? 's' : ''
        } in the stock, but the other${manyPlayers ? 's have' : ' player has'} more.`);
      }
    } else if (winnersNames.length > 1) {
      const message = `DRAW! The players ${winnersNames.join(', ')} have ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} left each.`;
      this.writeMessage(message, true, 'info', true);
      this.writeLog(message);
    } else {
      throw new Error(`Unexpected number of winners in the game: ${winnersNames.length}`);
    }
    this.updateViews();
  }
}

// eslint-disable-next-line no-new
new DominoController();
