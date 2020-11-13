import { DominoGame } from './domino-game.js';
import { DominoIcon } from './domino-icon.js';
import Utility from './domino-utility.js';
class DominoController {
    constructor() {
        this.game = new DominoGame(7);
        this.userStock = Utility.getElement('user-stock');
        this.playLine = Utility.getElement('play-line');
        this.messageField = Utility.getElement('message');
        this.dominoLog = Utility.getElement('domino-log');
        this.restartButton = Utility.getElement('restart');
        this.missMoveButton = Utility.getElement('miss-move');
        this.drawTileButton = Utility.getElement('draw-tile');
        this.simulateButton = Utility.getElement('simulate');
        this.game.delegate = this;
        this.game.addPlayers('User', 'JavaScript');
        this.addEventListeners();
        this.restartGame();
    }
    addEventListeners() {
        const buttonPushed = (event) => {
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
                        }
                        else {
                            this.game.playerDrawsTile();
                        }
                        break;
                    case 'simulate':
                        this.game.runSimulation();
                        break;
                    default:
                }
                this.updateViews();
            }
            else {
                this.messageField.className = 'warning';
                this.messageField.innerHTML = `The game is finished. Player '${this.game.winner.name}' has won! Restart the game!`;
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
    restartGame() {
        this.game.restart();
        this.updateViews();
        this.dominoLog.innerText = '';
    }
    updateViews() {
        this.userStock.innerText = '';
        this.playLine.innerText = '';
        this.game.players[0].stock.forEach((tile) => {
            DominoIcon.create({
                stock: this.userStock,
                id: tile.id,
            }).addEventListener('click', (event) => {
                if (!this.game.gameOver) {
                    const selection = this.game.playerSelected(event.target.id);
                    if (selection.isValid) {
                        this.messageField.className = 'info';
                        this.messageField.innerHTML = `You selected ${selection.tile}<br><br>`;
                        const makeMove = () => {
                            this.game.makeMove({ startFrom: 1 });
                            this.updateViews();
                        };
                        setTimeout(makeMove, 2000);
                    }
                    else {
                        this.messageField.className = 'warning';
                        this.messageField.innerHTML = `The tile ${selection.tile} does not match the game line! <br>Try another one or Draw a new tile!`;
                    }
                    this.updateViews();
                }
                else {
                    this.messageField.className = 'warning';
                    this.messageField.innerHTML = `The game is over. ${this.game.winner.name} has won. Restart the game!`;
                }
            });
        });
        this.game.playLine.forEach((tile) => {
            DominoIcon.create({ stock: this.playLine, id: tile.id });
        });
    }
    onStart(...tile) {
        this.dominoLog.innerText += `Now playing: ${this.game.players
            .map((p) => p.name)
            .join(', ')}`;
        this.dominoLog.innerText += `\nGame is starting with ${tile.join(' ')}\n`;
    }
    onNextMove(moveNumber) {
        this.dominoLog.innerText += `\nMove ${moveNumber} --------------------------------------------------------------------\n`;
    }
    onSuccess(name, matching, connecting, board, playersStock) {
        this.messageField.className = 'info';
        this.messageField.innerHTML = `'${name}' played ${matching} to connect to tile ${connecting}.<br><br>Select a tile for your move:`;
        this.dominoLog.innerText += `\n${name} plays ${matching} to connect to tile ${connecting} on the board
Board is now: ${board}
${playersStock}\n`;
    }
    onRepeat(playerName, newTile) {
        this.dominoLog.innerText += `\n${playerName} can't play, drawing tile ${newTile}`;
    }
    onMiss(name) {
        const message = `${name} misses move`;
        this.messageField.className = 'warning';
        this.messageField.innerHTML = message;
        this.dominoLog.innerText += `\n${message}`;
    }
    onWin(name, tilesLeft = 0) {
        this.messageField.className = 'info';
        this.messageField.classList.add('winner');
        this.messageField.innerHTML = `'${name}' has won!`;
        this.dominoLog.innerText += `\n${name} has won! `;
        if (tilesLeft > 0) {
            this.dominoLog.innerText += `${name} still has ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} in the stock, but the others have more.`;
        }
        this.updateViews();
    }
}
new DominoController();
//# sourceMappingURL=domino-controller.js.map