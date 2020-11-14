import DominoGame from './domino-game.js';
import Tile from './domino-tile.js';

export class DoninoInteractiveGame extends DominoGame {
// перекинуть все интерактивные опции в этот контроллер
  /**
   * Checks if user selected a valid tile and if so, inserts this tile into the playline
   * @param tileID string representation of tile coming from the user interface
   * @returns tile: selected tile, isValid: whether the tile is accepted or not
   */
  playerSelected(tileID: string): { tile: Tile; isValid: boolean } {
    const user = this.players[0];
    const chosenTile = user.getTileByID(tileID);
    const result = user.check([this.first, this.last], chosenTile);
    if (result) {
      // send a message to the delegate object that the game is about to start
      this.sendStartMessage();
      this.sendNextMoveMessage();
      this.delegate.onSuccess(
        user.name,
        result.tileFromPlayer.toString(),
        result.tileFromLine.toString(),
        this.toString(),
        user.toString(),
      );
      this.insertTile(result);
      return { tile: result.tileFromPlayer, isValid: true };
    }
    return { tile: chosenTile, isValid: false };
  }

  playerDrawsTile(): void {
    if (this.stock.length > 0) {
      this.players[0].add(this.stock.shift()!);
    } else {
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
