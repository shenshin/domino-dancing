import { MatchingTiles } from './domino-matching-tiles.js';
/**
 * Domino tile model. Number of tiles in a game is usually 28 (but not mandatory)
 */
export class Tile {
  // stores unique combination of 2 digits
  private numbers: [number, number];

  // rotation status (whether tile is [a,b] or [b,a])
  private upSideUp: boolean = true;

  constructor(ends: [number, number]) {
    this.numbers = ends;
  }

  // returnes 2 digits representing the tile depending on rotation status
  get ends(): [number, number] {
    return this.upSideUp
      ? [this.numbers[0], this.numbers[1]]
      : [this.numbers[1], this.numbers[0]];
  }

  get first() {
    return this.ends[0];
  }

  get last() {
    return this.ends[1];
  }

  private rotate() {
    this.upSideUp = !this.upSideUp;
  }

  get id(): string {
    return `${this.first}${this.last}`;
  }

  toString() {
    return `<${this.first}:${this.last}>`;
  }

  /**
   * Rotates selected tile. When a player is about to put tile to the game line,
   * it is sometimes necessary to rotate his tile. This static method method
   * receives 'tileFromPlayer' and checks if it's necessary to rotate it
   * in order to put next to 'tileFromLine'
   * @param matching matching player's tile and a tile in game line next to
   *  which it is about to be put either from left or right
   */
  static rotateIfNeeded(matching: MatchingTiles): void {
    if (
      (!matching?.goesRight && matching?.tileFromLine.first === matching?.tileFromPlayer.first)
        || (matching?.goesRight && matching?.tileFromLine.last === matching?.tileFromPlayer.last)
    ) {
      matching?.tileFromPlayer.rotate();
    }
  }
}

export default Tile;
