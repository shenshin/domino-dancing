import Tile from './domino-tile.js';
/* eslint-disable no-unused-vars */
/**
 * Protocol to implement by a class that wants to receive messages
 * from Domino-Dancing game. Methods represent different game states
 */
export interface DominoDelegate {
  onStart(): void;
  onNextMove(): void;
  /**
   * @param isLastPlayer here and below indicates if model is sending
   *  information about the move of the last player in order for the
   *  controller to update UI only when messages from every player
   *  are received for the current move
   */
  onSuccess(
    matching: Tile,
    connecting: Tile,
    isLastPlayer: boolean
  ): void;
  onMiss(isLastPlayer: boolean): void;
  onWin(): void;
  onRepeat(newTile: Tile, isLastPlayer: boolean): void;
}

export default DominoDelegate;
