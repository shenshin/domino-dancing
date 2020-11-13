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

  /** Rotates selected tile */
  static rotateIfNeeded(tile: MatchingTiles): void {
    if (
      (!tile?.goesRight && tile?.tileFromLine.first === tile?.tileFromPlayer.first)
        || (tile?.goesRight && tile?.tileFromLine.last === tile?.tileFromPlayer.last)
    ) {
      tile?.tileFromPlayer.rotate();
    }
  }
}

export default Tile;
