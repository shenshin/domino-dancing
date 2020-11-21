import { Tile } from './domino-tile.js';
import { Player } from './domino-player.js';
import { Utility } from './domino-utility.js';
export class DominoGame {
    constructor(delegate) {
        this.players = [];
        this.stock = [];
        this.playLine = [];
        this.initialTiles = 7;
        this.currentPlayer = null;
        this.winners = null;
        this.delegate = delegate;
    }
    addPlayers(...players) {
        players.forEach((player) => this.addPlayer(new Player(player)));
    }
    restart() {
        const numberOfPlayers = this.players.length;
        if (numberOfPlayers < 2) {
            throw new RangeError(`Add ${2 - numberOfPlayers} more player${numberOfPlayers > 1 ? 's' : ''} to the game!`);
        }
        this.currentMove = 1;
        this.winners = null;
        this.resetStock();
        this.playLine = [];
        this.currentPlayer = null;
        if (this.players.length * this.initialTiles >= this.stock.length) {
            throw new RangeError('The desired number of tiles is greater than the stock');
        }
        this.players.forEach((player) => {
            player.reset();
            this.drawTilesTo(player);
        });
        this.firstTile = this.stock.shift();
        this.playLine.push(this.firstTile);
    }
    makeMove(startFrom) {
        for (let playerIndex = startFrom; playerIndex < this.players.length; playerIndex += 1) {
            const isLastPlayer = (playerIndex === (this.players.length - 1));
            this.currentPlayer = this.players[playerIndex];
            const matching = this.currentPlayer.find([this.first, this.last]);
            if (matching) {
                this.currentPlayer.missedLastMove = false;
                this.insertTile(matching);
                this.delegate.onSuccess(matching.tileFromPlayer, matching.tileFromLine, isLastPlayer);
            }
            else if (this.stock.length > 0) {
                const newTile = this.stock.shift();
                this.currentPlayer.add(newTile);
                this.delegate.onRepeat(newTile);
                playerIndex -= 1;
            }
            else {
                this.currentPlayer.missedLastMove = true;
                this.delegate.onMiss(isLastPlayer);
            }
            if (this.findWinners()) {
                return false;
            }
        }
        return true;
    }
    runSimulation() {
        this.sendStartMessage();
        for (;;) {
            this.sendNextMoveMessage();
            if (!this.makeMove(0))
                break;
        }
    }
    get first() {
        return this.playLine[0];
    }
    get last() {
        return this.playLine[this.playLine.length - 1];
    }
    findWinners() {
        if (this.winners) {
            return this.winners;
        }
        const playedAllTiles = this.players.find((player) => player.stockLength === 0);
        if (playedAllTiles) {
            this.winners = [playedAllTiles];
            this.delegate.onWin();
            return this.winners;
        }
        if (this.players.every((player) => player.missedLastMove)) {
            this.winners = [...this.players].sort((a, b) => a.stockLength - b.stockLength);
            this.winners = this.winners.filter((p) => p.stockLength === this.winners[0].stockLength);
            this.delegate.onWin();
            return this.winners;
        }
        return null;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    drawTilesTo(player) {
        player.add(...this.stock.splice(0, this.initialTiles));
    }
    resetStock() {
        this.stock = Utility.combinationsWithRepetition([...Array(7).keys()], 2).map((twoNumbers) => new Tile([twoNumbers[0], twoNumbers[1]]));
        Utility.shuffle(this.stock);
    }
    insertTile(tile) {
        if ((!(tile === null || tile === void 0 ? void 0 : tile.goesRight) && (tile === null || tile === void 0 ? void 0 : tile.tileFromLine.first) === (tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.first))
            || ((tile === null || tile === void 0 ? void 0 : tile.goesRight) && (tile === null || tile === void 0 ? void 0 : tile.tileFromLine.last) === (tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.last))) {
            tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.rotate();
        }
        if (tile === null || tile === void 0 ? void 0 : tile.goesRight) {
            this.playLine.push(tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer);
        }
        else {
            this.playLine.unshift(tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer);
        }
    }
    sendStartMessage() {
        if (this.currentMove === 1) {
            this.delegate.onStart();
        }
    }
    sendNextMoveMessage() {
        this.delegate.onNextMove();
        this.currentMove += 1;
    }
    toString() {
        return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
    }
}
export default DominoGame;
//# sourceMappingURL=domino-game.js.map