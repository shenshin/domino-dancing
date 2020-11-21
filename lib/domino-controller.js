import { DoninoInteractiveGame } from './domino-interactive-game.js';
import { DominoIcon } from './domino-icon.js';
import Utility from './domino-utility.js';
class DominoController {
    constructor() {
        this.userStock = Utility.getElement('user-stock');
        this.playLine = Utility.getElement('play-line');
        this.messageField = Utility.getElement('message');
        this.dominoLog = Utility.getElement('domino-log');
        this.restartButton = Utility.getElement('restart');
        this.missMoveButton = Utility.getElement('miss-move');
        this.drawTileButton = Utility.getElement('draw-tile');
        this.simulateButton = Utility.getElement('simulate');
        this.successMessages = '';
        this.missMessages = '';
        this.game = new DoninoInteractiveGame(this);
        this.game.initialTiles = 7;
        this.game.addPlayers('User', 'Beatrix', 'Maxima');
        this.addButtonsEventListeners();
        this.restartGame();
    }
    restartGame() {
        this.writeMessage('Select a tile for the move:');
        this.game.restart();
        this.updateViews();
        this.dominoLog.innerText = '';
    }
    updateViews() {
        this.userStock.innerText = '';
        this.playLine.innerText = '';
        this.game.players[0].stock.forEach((tile) => {
            this.createUsersTile(tile.id);
        });
        this.game.playLine.forEach((tile) => {
            const tileHTML = DominoIcon.create(this.playLine, tile.id, 'mixed');
            if (tile.id === this.game.firstTile.id) {
                tileHTML.classList.add('first-in-line');
            }
        });
    }
    addButtonsEventListeners() {
        const buttonPushed = (event) => {
            if (!this.game.getWinners()) {
                switch (event.target.id) {
                    case 'miss-move':
                        this.game.playerMissedMove();
                        break;
                    case 'draw-tile':
                        if (this.game.stock.length === 0) {
                            this.writeMessage('No more tiles in the stock! You miss the move.', 'warning');
                            setTimeout(this.game.playerMissedMove.bind(this.game), 1000);
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
    createUsersTile(id) {
        DominoIcon.create(this.userStock, id, 'vertical').addEventListener('click', (event) => {
            if (!this.game.getWinners()) {
                const selection = this.game.playerSelected(event.target.id);
                if (selection.isValid) {
                    this.updateViews();
                    if (!this.game.getWinners()) {
                        this.writeMessage(`You played ${selection.tile}<br>`);
                        setTimeout(() => {
                            this.game.javascriptMakesMove();
                            this.updateViews();
                        }, 2000);
                    }
                }
                else {
                    this.writeMessage(`The tile ${selection.tile} does not match the game line!<br>Try another one or Draw a new tile!`, 'warning');
                }
            }
            else {
                this.sendGameOverWarning();
            }
        });
    }
    writeMessage(text, type = 'info', large = false) {
        this.messageField.className = type;
        this.messageField.innerHTML = text;
        if (large) {
            this.messageField.classList.add('winner');
        }
        else {
            this.messageField.classList.remove('winner');
        }
    }
    writeLog(text) {
        this.dominoLog.innerText += `\n${text}\n`;
    }
    sendGameOverWarning() {
        const winners = this.game.getWinners();
        const many = winners.length > 1;
        const names = winners.map((w) => w.name).join(', ');
        this.writeMessage(`The game is finished. The winner${many ? 's are' : ' is'}: ${names} <br>Restart the game!`, 'warning');
    }
    onStart(...tile) {
        this.writeLog(`Now playing: ${this.game.players
            .map((p) => p.name)
            .join(', ')}`);
        this.writeLog(`Game is starting with ${tile.join(' ')}`);
    }
    onNextMove(moveNumber) {
        this.writeLog(`Move ${moveNumber} --------------------------------------------------------------------`);
    }
    onSuccess(name, matching, connecting, board, playersStock, isLast) {
        const message = `'${name}' played ${matching} to connect to tile ${connecting}.<br>`;
        if (!isLast) {
            this.successMessages += message;
        }
        else {
            this.writeMessage(`${this.successMessages + message}Select a tile for your move:`);
            this.successMessages = '';
        }
        this.writeLog(`${name} plays ${matching} to connect to tile ${connecting} on the board.
    Board is now: ${board}
    ${playersStock}`);
    }
    onRepeat(playerName, newTile) {
        this.writeLog(`${playerName} can't play, drawing tile ${newTile}`);
    }
    onMiss(name) {
        const message = `${name} misses move`;
        this.writeMessage(message, 'warning');
        this.writeLog(message);
    }
    onWin(winnersNames, tilesLeft = 0) {
        if (winnersNames.length === 1) {
            const name = winnersNames[0];
            const message = `${name} has won!`;
            this.writeMessage(message, 'info', true);
            this.writeLog(message);
            if (tilesLeft > 0) {
                const manyPlayers = this.game.players.length - 1 > 1;
                this.writeLog(`${name} still has ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} in the stock, but the other${manyPlayers ? 's have' : ' player has'} more.`);
            }
        }
        else if (winnersNames.length > 1) {
            const message = `DRAW! The players ${winnersNames.join(', ')} have ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} left each.`;
            this.writeMessage(message, 'info', true);
            this.writeLog(message);
        }
        else {
            throw new Error(`Unexpected number of winners in the game: ${winnersNames.length}`);
        }
        this.updateViews();
    }
}
new DominoController();
//# sourceMappingURL=domino-controller.js.map