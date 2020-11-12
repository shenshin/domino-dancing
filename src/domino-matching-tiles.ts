/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import { Tile } from './domino-tile.js';

/**
 * Tiles handling functions return parameters
 */
export type MatchingTiles = {
  tileFromPlayer: Tile;
  tileFromLine: Tile;
  goesRight: boolean;
} | null;

export default MatchingTiles;
