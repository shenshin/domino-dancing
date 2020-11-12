/* eslint-disable no-unused-vars */
/**
 * Protocol to implement by a class that wants to receive messages
 * from Domino-Dancing game.
 */
export interface DominoDelegate {
  onStart(...tile: string[]): void;
  onNextMove(moveNumber: number): void;
  onSuccess(
    name: string,
    matching: string,
    connecting: string,
    board: string,
    playerStock: string,
  ): void;
  onMiss(player: string): void;
  onWin(player: string, remainingCards: number): void;
  onRepeat(player: string, tile: string): void;
}

export default DominoDelegate;
