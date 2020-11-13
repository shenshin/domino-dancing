import { Tile } from './domino-tile.js';
import { Player } from './domino-player.js';
import { Utility } from './domino-utility.js';
export class DominoGame {
    constructor(tilesNumber) {
        this.players = [];
        this.stock = [];
        this.playLine = [];
        this.gameOver = false;
        this.moveNumber = 0;
        this.initialTiles = tilesNumber;
    }
    addPlayer(player) {
        this.players.push(player);
    }
    drawTilesTo(player) {
        player.add(...this.stock.splice(0, this.initialTiles));
    }
    addPlayers(...players) {
        players.forEach((player) => this.addPlayer(new Player(player)));
    }
    restart() {
        if (!this.delegate) {
            throw new ReferenceError('Set up an instance of DominoDelegate class as a delegate of DominoGame');
        }
        const count = this.players.length;
        if (count < 2) {
            throw new RangeError(`Add ${2 - count} more player${count > 1 ? 's' : ''} to the game!`);
        }
        this.moveNumber = 0;
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
    playerSelected(tileID) {
        const user = this.players[0];
        const chosenTile = user.getTileByID(tileID);
        const result = user.check([this.playLine[0], this.playLine[this.playLine.length - 1]], chosenTile);
        if (result) {
            this.moveNumber += 1;
            this.delegate.onNextMove(this.moveNumber);
            this.delegate.onSuccess(user.name, result.tileFromPlayer.toString(), result.tileFromLine.toString(), this.toString(), user.toString());
            Tile.rotateIfNeeded(result);
            this.insertTile(result);
            return { tile: result.tileFromPlayer, isValid: true };
        }
        return { tile: chosenTile, isValid: false };
    }
    playerDrawsTile() {
        if (this.stock.length > 0) {
            this.players[0].add(this.stock.shift());
        }
        else {
            this.playerMissedMove();
        }
    }
    playerMissedMove() {
        this.players[0].missedLastMove = true;
        this.makeMove({ startFrom: 1 });
    }
    makeMove({ startFrom }) {
        for (let playerIndex = startFrom; playerIndex < this.players.length; playerIndex += 1) {
            const player = this.players[playerIndex];
            const matching = player.find([
                this.playLine[0],
                this.playLine[this.playLine.length - 1],
            ]);
            if (matching) {
                player.missedLastMove = false;
                Tile.rotateIfNeeded(matching);
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
            const { winner } = this;
            if (winner) {
                this.delegate.onWin(winner.name, winner.stockLength);
                return false;
            }
        }
        return true;
    }
    runSimulation() {
        this.delegate.onStart(...this.playLine.map((tile) => tile.toString()));
        for (;;) {
            this.moveNumber += 1;
            this.delegate.onNextMove(this.moveNumber);
            if (!this.makeMove({ startFrom: 0 }))
                break;
        }
    }
    insertTile(tile) {
        if (tile === null || tile === void 0 ? void 0 : tile.goesRight) {
            this.playLine.push(tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer);
        }
        else {
            this.playLine.unshift(tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer);
        }
    }
    get winner() {
        const playedAllTiles = this.players.find((player) => player.stockLength === 0);
        if (playedAllTiles) {
            this.gameOver = true;
            return playedAllTiles;
        }
        if (this.players.every((player) => player.missedLastMove)) {
            this.gameOver = true;
            return this.players.reduce((winner, player) => (winner.stockLength < player.stockLength ? winner : player));
        }
        return null;
    }
    resetStock() {
        this.stock = Utility.combinationsWithRepetition([...Array(7).keys()], 2).map((twoNumbers) => new Tile([twoNumbers[0], twoNumbers[1]]));
        Utility.shuffle(this.stock);
    }
    toString() {
        return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
    }
}
export default DominoGame;
//# sourceMappingURL=domino-game.js.map