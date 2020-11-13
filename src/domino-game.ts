import { Tile } from './domino-tile.js';
import { Player } from './domino-player.js';
import { Utility } from './domino-utility.js';
import { DominoDelegate } from './domino-delegate.js';
import { MatchingTiles } from './domino-matching-tiles.js';
/**
 * The Model of 'Domino Dancing' game
 */
export class DominoGame {
  players: Player[] = [];

  // tiles that are not the in game yet and wait
  // face down to be taken to players' stocks
  stock: Tile[] = [];

  // tiles, put by each player on the table
  playLine: Tile[] = [];

  // The number of tiles, each player gets in the beginning
  initialTiles: number;

  // a delegate object that will receive ALL the events messages
  delegate!: DominoDelegate;

  gameOver: boolean = false;

  moveNumber: number = 0;

  // initiates a new game, setting the number of tiles
  // to be drawn to each player
  constructor(tilesNumber: number) {
    this.initialTiles = tilesNumber;
  }

  /**
   * Adds player as a Player object
   * @param player object of Player type
   */
  addPlayer(player: Player): void {
    this.players.push(player);
  }

  // Draw an 'initialTiles' number of tiles to each player
  drawTilesTo(player: Player): void {
    player.add(...this.stock.splice(0, this.initialTiles));
  }

  /**
   * Creates Player objects and adds to the game
   * @param players one or more player names
   */
  addPlayers(...players: string[]): void {
    players.forEach((player) => this.addPlayer(new Player(player)));
  }

  /**
   * Starts the game from the beginning
   */
  restart(): void {
    // check if there is class that set itself to get the messages from the game
    if (!this.delegate) {
      throw new ReferenceError(
        'Set up an instance of DominoDelegate class as a delegate of DominoGame',
      );
    }

    // check if the number of players is more than one
    const count = this.players.length;
    if (count < 2) {
      throw new RangeError(
        `Add ${2 - count} more player${count > 1 ? 's' : ''} to the game!`,
      );
    }

    // reset game data
    this.moveNumber = 0;
    this.gameOver = false;
    this.resetStock();
    this.playLine = [];

    // check if the number of tiles agree with the number of players
    if (this.players.length * this.initialTiles >= this.stock.length) {
      throw new RangeError(
        'The desired number of tiles is greater than the stock',
      );
    }

    // reset players' stocks
    this.players.forEach((player) => {
      player.reset();
      this.drawTilesTo(player);
    });

    // pick a random tile to start a line of game
    this.playLine.push(this.stock.shift()!);
  }

  /* ************************ Methods to update model from UI *************************** */
  /**
   * Checks if user selected a valid tile and if so, inserts this tile into the playline
   * @param tileID string representation of tile coming from the user interface
   * @returns tile: selected tile, isValid: whether the tile is accepted or not
   */
  playerSelected(tileID: string): { tile: Tile; isValid: boolean } {
    const user = this.players[0];
    const chosenTile = user.getTileByID(tileID);
    const result = user.check(
      [this.playLine[0], this.playLine[this.playLine.length - 1]],
      chosenTile,
    );
    if (result) {
      this.moveNumber += 1;
      this.delegate.onNextMove(this.moveNumber);
      this.delegate.onSuccess(
        user.name,
        result.tileFromPlayer.toString(),
        result.tileFromLine.toString(),
        this.toString(),
        user.toString(),
      );
      Tile.rotateIfNeeded(result);
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
    this.players[0].missedLastMove = true;
    this.makeMove({ startFrom: 1 });
  }

  /* **************************************************************************** */

  /**
   * Starts one move of each player
   * @param startFrom the number of player from which to start moving
   */
  makeMove({ startFrom }: { startFrom: number }): boolean {
    for (
      let playerIndex = startFrom;
      playerIndex < this.players.length;
      playerIndex += 1
    ) {
      const player: Player = this.players[playerIndex];
      const matching = player.find([
        this.playLine[0],
        this.playLine[this.playLine.length - 1],
      ]);
      if (matching) {
        player.missedLastMove = false;
        Tile.rotateIfNeeded(matching);
        this.insertTile(matching);
        this.delegate.onSuccess(
          player.name,
          matching.tileFromPlayer.toString(),
          matching.tileFromLine.toString(),
          this.toString(),
          player.toString(),
        );
      } else if (this.stock.length > 0) {
        const newTile: Tile = this.stock.shift()!;
        player.add(newTile);
        this.delegate.onRepeat(player.name, newTile.toString());
        playerIndex -= 1;
      } else {
        player.missedLastMove = true;
        this.delegate.onMiss(player.name);
      }
      const { winner } = this;
      if (winner) {
        this.delegate.onWin(winner.name, winner.stockLength);
        return false;
      }
    }
    return true;
  }

  /**
   * Simulates the alternate moves of each player
   */
  runSimulation(): void {
    // send a message to the delegate object that the game is about to start
    this.delegate.onStart(...this.playLine.map((tile) => tile.toString()));

    // Loop starts each next move
    for (;;) {
      // send a message to the delegate object that next move is about to start
      this.moveNumber += 1;
      this.delegate.onNextMove(this.moveNumber);
      if (!this.makeMove({ startFrom: 0 })) break;
    }
  }

  /** Puts a tile to the right or left of the game line */
  insertTile(tile: MatchingTiles) {
    if (tile?.goesRight) {
      this.playLine.push(tile?.tileFromPlayer);
    } else {
      this.playLine.unshift(tile?.tileFromPlayer!);
    }
  }

  /**
   * Game end condition.
   * Game stops if player's stock is empty or noone can make a move
   * @returns the winner or null if game is about to continue
   */
  get winner(): Player | null {
    // return player who has no more tiles
    const playedAllTiles = this.players.find(
      (player) => player.stockLength === 0,
    );
    if (playedAllTiles) {
      this.gameOver = true;
      return playedAllTiles;
    }
    // if all players missed the previous move return the one who has less tiles
    if (this.players.every((player) => player.missedLastMove)) {
      this.gameOver = true;
      return this.players.reduce(
        (winner, player) => (winner.stockLength < player.stockLength ? winner : player),
      );
    }
    // continue game
    return null;
  }

  /**
   * Creates and shuffles a standart domino stock, consisting of 28 tiles
   */
  resetStock(): void {
    // makes stock with repetition algorithm
    this.stock = Utility.combinationsWithRepetition(
      [...Array(7).keys()],
      2,
    ).map((twoNumbers) => new Tile([twoNumbers[0], twoNumbers[1]]));
    // shuffle stock
    Utility.shuffle(this.stock);
  }

  /**
   * Returnes string representation of current playline
   */
  toString() {
    return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
  }
}

export default DominoGame;
