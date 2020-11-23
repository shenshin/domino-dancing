import Tile from './domino-tile.js';

/**
 * Tiles-handling functions return parameters. Represents a tile in player's
 * stock 'tileFromPlayer' that is about to be put next to the tile in
 * the game line 'tileFromLine' either from left or right side.
 */
export type MatchingTiles = {
  tileFromPlayer: Tile;
  tileFromLine: Tile;
  goesRight: boolean;
} | null;

export default MatchingTiles;
