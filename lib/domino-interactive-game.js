import DominoGame from './domino-game.js';
export class DoninoInteractiveGame extends DominoGame {
    playerSelected(tileID) {
        const user = this.players[0];
        const chosenTile = user.getTileByID(tileID);
        const result = user.check([this.first, this.last], chosenTile);
        if (result) {
            this.sendStartMessage();
            this.sendNextMoveMessage();
            this.delegate.onSuccess(user.name, result.tileFromPlayer.toString(), result.tileFromLine.toString(), this.toString(), user.toString());
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
        this.sendStartMessage();
        this.sendNextMoveMessage();
        this.players[0].missedLastMove = true;
        this.javascriptMakesMove();
    }
    javascriptMakesMove() {
        this.makeMove(1);
    }
}
export default DominoGame;
//# sourceMappingURL=domino-interactive-game.js.map