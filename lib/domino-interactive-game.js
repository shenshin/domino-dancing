import DominoGame from './domino-game.js';
export class DoninoInteractiveGame extends DominoGame {
    userChangedNumberOfPlayers(newValue) {
        if (newValue * this.tilesPerPlayer >= 28 || newValue < 2) {
            this.delegate.onError(`Ellegal number of players: ${newValue}! Number of players times tiles per player should be less then 27. Number of tiles must be more than 0 and number of players - more than 1.`);
        }
        else {
            this.numberOfPlayers = newValue;
            this.delegate.onResetModel();
        }
    }
    userChangedNumberOfTiles(newValue) {
        if (this.players.length * newValue >= 28 || newValue < 1) {
            this.delegate.onError(`Ellegal number of tiles per player: ${newValue}! Number of players times tiles per player should be less then 27. Number of tiles must be more than 0 and number of players - more than 1.`);
        }
        else {
            this.tilesPerPlayer = newValue;
            this.delegate.onResetModel();
        }
    }
    userSelected(tileID) {
        [this.currentPlayer] = this.players;
        const chosenTile = this.currentPlayer.getTileByID(tileID);
        const result = this.currentPlayer.check([this.first, this.last], chosenTile);
        if (result) {
            this.currentPlayer.missedLastMove = false;
            this.sendStartMessage();
            this.sendNextMoveMessage();
            this.insertTile(result);
            this.delegate.onSuccess(result.tileFromPlayer, result.tileFromLine, true);
            this.findWinners();
            return { tile: result.tileFromPlayer, isValid: true };
        }
        return { tile: chosenTile, isValid: false };
    }
    userDrawsTile() {
        [this.currentPlayer] = this.players;
        if (this.stock.length > 0) {
            const newTile = this.stock.shift();
            this.sendStartMessage();
            this.sendNextMoveMessage();
            this.delegate.onRepeat(newTile, true);
            this.currentPlayer.add(newTile);
        }
        else {
            this.userMissedMove();
        }
    }
    userMissedMove() {
        [this.currentPlayer] = this.players;
        this.currentPlayer.missedLastMove = true;
        this.sendStartMessage();
        this.sendNextMoveMessage();
        this.delegate.onMiss(true);
        this.currentPlayer.missedLastMove = true;
        this.javascriptMakesMove();
    }
    javascriptMakesMove() {
        this.makeMove(1);
    }
}
export default DoninoInteractiveGame;
//# sourceMappingURL=domino-interactive-game.js.map