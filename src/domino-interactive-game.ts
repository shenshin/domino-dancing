import DominoGame from './domino-game.js';
import Tile from './domino-tile.js';

/** Adds interactive functionality to DominoGame model */
export class DoninoInteractiveGame extends DominoGame {
  /**
   * Checks if user selected a valid tile and if so, inserts this tile into the playline
   * @param tileID string representation of tile coming from the user interface
   * @returns tile: selected tile, isValid: whether the tile is accepted or not
   */
  playerSelected(tileID: string): { tile: Tile; isValid: boolean } {
    [this.currentPlayer] = this.players;
    const chosenTile = this.currentPlayer.getTileByID(tileID);
    const result = this.currentPlayer.check([this.first, this.last], chosenTile);
    if (result) {
      this.currentPlayer.missedLastMove = false;
      this.sendStartMessage();
      this.sendNextMoveMessage();
      this.insertTile(result);
      this.delegate.onSuccess(
        result.tileFromPlayer,
        result.tileFromLine,
        true,
      );
      // check if user has just put his last tile
      this.findWinners();
      return { tile: result.tileFromPlayer, isValid: true };
    }
    return { tile: chosenTile, isValid: false };
  }

  playerDrawsTile(): void {
    [this.currentPlayer] = this.players;
    if (this.stock.length > 0) {
      this.currentPlayer.add(this.stock.shift()!);
    } else {
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
