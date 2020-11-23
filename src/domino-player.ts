import Tile from './domino-tile.js';
import MatchingTiles from './domino-matching-tiles.js';
/**
 * Domino game player. The total number of players in a game is not limited.
 */
export class Player {
  // player's name
  readonly name: string;

  // tiles that player currently has
  stock: Tile[] = [];

  missedLastMove: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Finds in the player's stock a tile corresponding to the number, passed as parameter.
   * Removes it from the player's stock and returnes if found or returnes 'null' if not found.
   * @param number
   */
  find(edgeTiles: [Tile, Tile]): MatchingTiles {
    const lineEdges: [number, number] = [
      edgeTiles[0].first,
      edgeTiles[edgeTiles.length - 1].last,
    ];
    for (let i = 0; i < lineEdges.length; i += 1) {
      const index = this.stock.findIndex((tile) => tile.ends.some((end) => lineEdges[i] === end));
      if (index > -1) {
        // remove selected tile from stock and return
        return {
          tileFromPlayer: this.stock.splice(index, 1)[0],
          tileFromLine: edgeTiles[i],
          goesRight: Boolean(i),
        };
      }
    }
    return null;
  }

  /**
   * Checks if selected tile matches the edge tiles of the game line
   * @param edgeTiles of the game line
   * @param selected tile to be checked
   */
  check(edgeTiles: [Tile, Tile], selected: Tile): MatchingTiles {
    const lineEdges: [number, number] = [
      edgeTiles[0].first,
      edgeTiles[edgeTiles.length - 1].last,
    ];
    for (let i = 0; i < lineEdges.length; i += 1) {
      if (selected.ends.some((end) => lineEdges[i] === end)) {
        return {
          tileFromPlayer: this.stock.splice(this.stock.indexOf(selected), 1)[0],
          tileFromLine: edgeTiles[i],
          goesRight: Boolean(i),
        };
      }
    }
    return null;
  }

  /**
   * Get particular tile from player's stock
   * @param id of the unique tile. '51' and '15' are the IDs of the same tile
   */
  getTileByID(id: string): Tile {
    const numbers: number[] = id.split('').map((s) => Number(s));
    const matched: Tile | undefined = this.stock.find(
      (tile) => (tile.ends[0] === numbers[0] && tile.ends[1] === numbers[1])
        || (tile.ends[0] === numbers[1] && tile.ends[1] === numbers[0]),
    );
    if (matched === undefined) {
      throw new Error('Required tile doesn\'t exist in player\'s stock');
    }
    return matched;
  }

  /**
   * Current length of player's stock
   */
  get stockLength(): number {
    return this.stock.length;
  }

  /**
   * Adds new tiles to the player's stock
   * @param tiles one or more tiles to be added
   */
  add(...tiles: Tile[]): void {
    this.stock.push(...tiles);
  }

  /**
   * Remove tile from player's stock
   * @param tile to remove
   */
  remove(tile: Tile) {
    this.stock = this.stock.filter((tileInStock) => tileInStock !== tile);
  }

  /**
   * Reset player for the next game
   */
  reset() {
    this.stock = [];
    this.missedLastMove = false;
  }

  /**
   * String representation of the current player object
   */
  toString() {
    const player = `Player ${this.name} `;
    return this.stock.length > 0
      ? this.stock.reduce(
        (prev, curr) => `${prev}${curr} `,
        `${player}now has: `,
      )
      : `${player}has no more tiles.`;
  }
}

export default Player;
