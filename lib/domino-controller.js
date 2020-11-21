import DoninoInteractiveGame from './domino-interactive-game.js';
import DominoIcon from './domino-icon.js';
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
            if (!this.game.findWinners()) {
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
            if (!this.game.findWinners()) {
                const selection = this.game.playerSelected(event.target.id);
                if (selection.isValid) {
                    this.updateViews();
                    if (!this.game.findWinners()) {
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
        const winners = this.game.findWinners();
        const many = winners.length > 1;
        const names = winners.map((w) => w.name).join(', ');
        this.writeMessage(`The game is finished. The winner${many ? 's are' : ' is'}: ${names} <br>Restart the game!`, 'warning');
    }
    onStart() {
        this.writeLog(`Now playing: ${this.game.players
            .map((p) => p.name)
            .join(', ')}`);
        this.writeLog(`Game is starting with ${this.game}`);
    }
    onNextMove() {
        this.writeLog(`Move ${this.game.currentMove} --------------------------------------------------------------------`);
    }
    onSuccess(matching, connecting, isLast) {
        const player = this.game.currentPlayer;
        const message = `'${player.name}' played ${matching} to connect to tile ${connecting}.<br>`;
        if (!isLast) {
            this.successMessages += message;
        }
        else {
            this.writeMessage(`${this.successMessages + message}Select a tile for your move:`);
            this.successMessages = '';
        }
        this.writeLog(`${player.name} plays ${matching} to connect to tile ${connecting} on the board.\nBoard is now: ${this.game}\n${player}`);
    }
    onRepeat(newTile) {
        this.writeLog(`${this.game.currentPlayer.name} can't play, drawing tile ${newTile}`);
    }
    onMiss() {
        const message = `${this.game.currentPlayer.name} misses move`;
        this.writeMessage(message, 'warning');
        this.writeLog(message);
    }
    onWin() {
        const winners = this.game.findWinners();
        const winnersNames = winners.map((w) => w.name);
        const tilesLeft = winners[0].stockLength;
        if (winnersNames.length === 1) {
            const [name] = winnersNames;
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