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
        this.numberOfPlayersInput = Utility.getElement('number-of-players');
        this.tilesPerPlayerInput = Utility.getElement('tiles-per-player');
        this.messagesStack = '';
        this.game = new DoninoInteractiveGame(this);
        this.addButtonsEventListeners();
        this.addInputsEventListeners();
        this.restartGame();
    }
    restartGame() {
        this.writeMessage('Select a tile for the move:');
        this.game.restart();
        this.updateViews();
        this.dominoLog.innerText = '';
    }
    updateViews() {
        this.numberOfPlayersInput.value = this.game.players.length.toString();
        this.tilesPerPlayerInput.value = this.game.tilesPerPlayer.toString();
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
    addInputsEventListeners() {
        const parse = (e) => parseInt(e.target.value, 10);
        this.numberOfPlayersInput.addEventListener('change', (e) => {
            this.game.userChangedNumberOfPlayers(parse(e));
        });
        this.tilesPerPlayerInput.addEventListener('change', (e) => {
            this.game.userChangedNumberOfTiles(parse(e));
        });
    }
    addButtonsEventListeners() {
        const buttonPushed = (event) => {
            if (!this.game.findWinners()) {
                switch (event.target.id) {
                    case 'miss-move':
                        this.game.userMissedMove();
                        break;
                    case 'draw-tile':
                        if (this.game.stock.length === 0) {
                            this.writeMessage('No more tiles in the stock! You miss the move.', true, 'warning');
                            setTimeout(this.game.userMissedMove.bind(this.game), 1000);
                        }
                        else {
                            this.game.userDrawsTile();
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
                const selection = this.game.userSelected(event.target.id);
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
                    this.writeMessage(`The tile ${selection.tile} does not match the game line!<br>Try another one or Draw a new tile!`, true, 'warning');
                }
            }
            else {
                this.sendGameOverWarning();
            }
        });
    }
    writeMessage(text, isLast = true, type = 'info', large = false) {
        if (large) {
            this.messagesStack = '';
        }
        this.messagesStack += text;
        if (isLast) {
            this.messageField.className = type;
            this.messageField.innerHTML = this.messagesStack;
            if (large) {
                this.messageField.classList.add('winner');
            }
            else {
                this.messageField.classList.remove('winner');
            }
            this.messagesStack = '';
        }
    }
    writeLog(text) {
        this.dominoLog.innerText += `\n${text}\n`;
    }
    sendGameOverWarning() {
        const winners = this.game.findWinners();
        const many = winners.length > 1;
        const names = winners.map((w) => w.name).join(', ');
        this.writeMessage(`The game is finished. The winner${many ? 's are' : ' is'}: ${names} <br>Restart the game!`, true, 'warning');
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
    onSuccess(matching, connecting, isLastPlayer) {
        const player = this.game.currentPlayer;
        const message = `'${player.name}' played ${matching} to connect to tile ${connecting}.<br>${isLastPlayer ? 'Select a tile for the move:' : ''}`;
        this.writeMessage(message, isLastPlayer);
        this.writeLog(`${player.name} plays ${matching} to connect to tile ${connecting} on the board.\nBoard is now: ${this.game}\n${player}`);
        this.updateViews();
    }
    onRepeat(newTile) {
        const message = `${this.game.currentPlayer.name} can't play, drawing tile ${newTile}`;
        this.writeMessage(`${message}<br>`, false, 'warning');
        this.writeLog(message);
        this.updateViews();
    }
    onMiss(isLastPlayer) {
        const message = `${this.game.currentPlayer.name} misses move`;
        this.writeMessage(`${message}<br>${isLastPlayer ? 'Select a tile for the move:' : ''}`, isLastPlayer, 'warning');
        this.writeLog(message);
        this.updateViews();
    }
    onWin() {
        const winners = this.game.findWinners();
        const winnersNames = winners.map((w) => w.name);
        const tilesLeft = winners[0].stockLength;
        if (winnersNames.length === 1) {
            const [name] = winnersNames;
            const message = `${name} has won!`;
            this.writeMessage(message, true, 'info', true);
            this.writeLog(message);
            if (tilesLeft > 0) {
                const manyPlayers = this.game.players.length - 1 > 1;
                this.writeLog(`${name} still has ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} in the stock, but the other${manyPlayers ? 's have' : ' player has'} more.`);
            }
        }
        else if (winnersNames.length > 1) {
            const message = `DRAW! The players ${winnersNames.join(', ')} have ${tilesLeft} tile${tilesLeft > 1 ? 's' : ''} left each.`;
            this.writeMessage(message, true, 'info', true);
            this.writeLog(message);
        }
        else {
            throw new Error(`Unexpected number of winners in the game: ${winnersNames.length}`);
        }
        this.updateViews();
    }
    onError(message) {
        this.writeMessage(message, true, 'warning');
        this.updateViews();
    }
    onResetModel() {
        this.restartGame();
    }
}
new DominoController();
//# sourceMappingURL=domino-controller.js.map