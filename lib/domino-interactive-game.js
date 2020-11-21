import DominoGame from './domino-game.js';
export class DoninoInteractiveGame extends DominoGame {
    playerSelected(tileID) {
        [this.currentPlayer] = this.players;
        const chosenTile = this.currentPlayer.getTileByID(tileID);
        const result = this.currentPlayer.check([this.first, this.last], chosenTile);
        if (result) {
            this.sendStartMessage();
            this.sendNextMoveMessage();
            this.insertTile(result);
            this.delegate.onSuccess(result.tileFromPlayer, result.tileFromLine, true);
            this.findWinners();
            return { tile: result.tileFromPlayer, isValid: true };
        }
        return { tile: chosenTile, isValid: false };
    }
    playerDrawsTile() {
        [this.currentPlayer] = this.players;
        if (this.stock.length > 0) {
            this.currentPlayer.add(this.stock.shift());
        }
        else {
            this.playerMissedMove();
        }
    }
    playerMissedMove() {
        [this.currentPlayer] = this.players;
        this.sendStartMessage();
        this.sendNextMoveMessage();
        this.currentPlayer.missedLastMove = true;
        this.javascriptMakesMove();
    }
    javascriptMakesMove() {
        this.makeMove(1);
    }
}
export default DoninoInteractiveGame;
//# sourceMappingURL=domino-interactive-game.js.map