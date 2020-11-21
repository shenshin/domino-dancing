import Tile from './domino-tile.js';
/* eslint-disable no-unused-vars */
/**
 * Protocol to implement by a class that wants to receive messages
 * from Domino-Dancing game. Methods represent different game states
 */
export interface DominoDelegate {
  onStart(): void;
  onNextMove(): void;
  onSuccess(
    matching: Tile,
    connecting: Tile,
    isLastPlayer: boolean
  ): void;
  onMiss(isLastPlayer: boolean): void;
  onWin(): void;
  onRepeat(newTile: Tile): void;
}

export default DominoDelegate;
