import { Tile } from './domino-tile.js';
import { Player } from './domino-player.js';
import { Utility } from './domino-utility.js';
export class DominoGame {
    constructor(params) {
        this.players = [];
        this.stock = [];
        this.playLine = [];
        this.gameOver = false;
        this.initialTiles = params.tilesNumber;
        this.delegate = params.delegate;
    }
    addPlayers(...players) {
        players.forEach((player) => this.addPlayer(new Player(player)));
    }
    restart() {
        const numberOfPlayers = this.players.length;
        if (numberOfPlayers < 2) {
            throw new RangeError(`Add ${2 - numberOfPlayers} more player${numberOfPlayers > 1 ? 's' : ''} to the game!`);
        }
        this.moveNumber = 1;
        this.gameOver = false;
        this.resetStock();
        this.playLine = [];
        if (this.players.length * this.initialTiles >= this.stock.length) {
            throw new RangeError('The desired number of tiles is greater than the stock');
        }
        this.players.forEach((player) => {
            player.reset();
            this.drawTilesTo(player);
        });
        this.playLine.push(this.stock.shift());
    }
    makeMove(startFrom) {
        for (let playerIndex = startFrom; playerIndex < this.players.length; playerIndex += 1) {
            const player = this.players[playerIndex];
            const matching = player.find([this.first, this.last]);
            if (matching) {
                player.missedLastMove = false;
                this.insertTile(matching);
                this.delegate.onSuccess(player.name, matching.tileFromPlayer.toString(), matching.tileFromLine.toString(), this.toString(), player.toString());
            }
            else if (this.stock.length > 0) {
                const newTile = this.stock.shift();
                player.add(newTile);
                this.delegate.onRepeat(player.name, newTile.toString());
                playerIndex -= 1;
            }
            else {
                player.missedLastMove = true;
                this.delegate.onMiss(player.name);
            }
            const { winners } = this;
            if (winners) {
                this.delegate.onWin(winners.map((w) => w.name), winners[0].stockLength);
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
    get winners() {
        const playedAllTiles = this.players.find((player) => player.stockLength === 0);
        if (playedAllTiles) {
            this.gameOver = true;
            return [playedAllTiles];
        }
        if (this.players.every((player) => player.missedLastMove)) {
            this.gameOver = true;
            return [...this.players].sort((a, b) => a.stockLength - b.stockLength)
                .filter((p) => p.stockLength === this.players[0].stockLength);
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
        if (this.moveNumber === 1) {
            this.delegate.onStart(...this.playLine.map((tile) => tile.toString()));
        }
    }
    sendNextMoveMessage() {
        this.delegate.onNextMove(this.moveNumber);
        this.moveNumber += 1;
    }
    toString() {
        return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
    }
}
export default DominoGame;
//# sourceMappingURL=domino-game.js.map