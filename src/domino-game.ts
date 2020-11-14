import { Tile } from './domino-tile.js';
import { Player } from './domino-player.js';
import { Utility } from './domino-utility.js';
import { DominoDelegate } from './domino-delegate.js';
import { MatchingTiles } from './domino-matching-tiles.js';
/**
 * The Model of 'Dominoes' game
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
  delegate: DominoDelegate;

  gameOver: boolean = false;

  moveNumber!: number;

  /**
   * Initiates a new dominoes game. Setts the number of tiles
   * to be drawn to each player and a delegate object.
   * @param tilesNumber number of tiles, each player receives
   * at the beginning of the game
   * @param delegate an instance of a class that is going to
   * receive messages from the game model. Class should
   * implement the DominoDelegate protocol
   */
  constructor(params: {delegate: DominoDelegate, tilesNumber: number}) {
    this.initialTiles = params.tilesNumber;
    this.delegate = params.delegate;
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
    // check if the number of players is more than one
    const numberOfPlayers = this.players.length;
    if (numberOfPlayers < 2) {
      throw new RangeError(
        `Add ${2 - numberOfPlayers} more player${numberOfPlayers > 1 ? 's' : ''} to the game!`,
      );
    }

    // reset game data
    this.moveNumber = 1;
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

  /**
   * Starts one move of each player. Returns true for next player to move or
   * false if a winner was found during the move.
   * @param startFrom the number of player from which to start moving
   */
  makeMove(startFrom: number): boolean {
    for (
      let playerIndex = startFrom;
      playerIndex < this.players.length;
      playerIndex += 1
    ) {
      const player: Player = this.players[playerIndex];
      const matching = player.find([this.first, this.last]);
      if (matching) {
        player.missedLastMove = false;
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
      const { winners } = this;
      if (winners) {
        this.delegate.onWin(winners.map((w) => w.name), winners[0].stockLength);
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
    this.sendStartMessage();
    // Loop starts each next move
    for (;;) {
      // send a message to the delegate object that next move is about to start
      this.sendNextMoveMessage();
      if (!this.makeMove(0)) break;
    }
  }

  /** First tile of the game line */
  get first(): Tile {
    return this.playLine[0];
  }

  /** Last tile of the game line */
  get last(): Tile {
    return this.playLine[this.playLine.length - 1];
  }

  /**
   * Game end condition.
   * Game stops if player's stock is empty or noone can make a move
   * @returns the winner or null if game is about to continue
   */
  get winners(): Player[] | null {
    // return player who has no more tiles
    const playedAllTiles = this.players.find(
      (player) => player.stockLength === 0,
    );
    if (playedAllTiles) {
      this.gameOver = true;
      return [playedAllTiles];
    }
    if (this.players.every((player) => player.missedLastMove)) {
      this.gameOver = true;
      // if all players missed the previous move return players with the least
      // stock lengths
      return this.players.concat().sort((a, b) => a.stockLength - b.stockLength)
        .filter((p) => p.stockLength === this.players[0].stockLength);
    }
    return null;
  }

  /**
   * Adds player as a Player object
   * @param player object of Player type
   */
  private addPlayer(player: Player): void {
    this.players.push(player);
  }

  // Draw an 'initialTiles' number of tiles to each player
  private drawTilesTo(player: Player): void {
    player.add(...this.stock.splice(0, this.initialTiles));
  }

  /**
   * Creates and shuffles a standart domino stock, consisting of 28 tiles
   */
  private resetStock(): void {
    // makes stock with repetition algorithm
    this.stock = Utility.combinationsWithRepetition(
      [...Array(7).keys()],
      2,
    ).map((twoNumbers) => new Tile([twoNumbers[0], twoNumbers[1]]));
    // shuffle stock
    Utility.shuffle(this.stock);
  }

  /** Puts a tile to the right or left of the game line */
  protected insertTile(tile: MatchingTiles) {
    if (
      (!tile?.goesRight && tile?.tileFromLine.first === tile?.tileFromPlayer.first)
        || (tile?.goesRight && tile?.tileFromLine.last === tile?.tileFromPlayer.last)
    ) {
      tile?.tileFromPlayer.rotate();
    }
    if (tile?.goesRight) {
      this.playLine.push(tile?.tileFromPlayer);
    } else {
      this.playLine.unshift(tile?.tileFromPlayer!);
    }
  }

  /** Sends a message to the delegate object that the game is about to start */
  protected sendStartMessage(): void {
    if (this.moveNumber === 1) {
      this.delegate.onStart(...this.playLine.map((tile) => tile.toString()));
    }
  }

  /** Sends a message to the delegate object that next move is about to start */
  protected sendNextMoveMessage(): void {
    this.delegate.onNextMove(this.moveNumber);
    this.moveNumber += 1;
  }

  /**
   * Returnes string representation of current playline
   */
  toString() {
    return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
  }
}

export default DominoGame;
