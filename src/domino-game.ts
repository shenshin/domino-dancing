import Tile from './domino-tile.js';
import Player from './domino-player.js';
import Utility from './domino-utility.js';
import DominoDelegate from './domino-delegate.js';
import MatchingTiles from './domino-matching-tiles.js';
/**
 * The Model of 'Dominoes' game
 */
export class DominoGame {
  players: Player[] = [];

  /** Tiles that are not the in game yet and wait
   face down for their turn */
  stock: Tile[] = [];

  /** Tiles, put one by one on the table by each player */
  playLine: Tile[] = [];

  /** The number of tiles, each player gets in the beginning */
  tilesPerPlayer: number = 7;

  numberOfPlayers: number = 3;

  /** A delegate object that will receive ALL the events messages */
  delegate: DominoDelegate;

  /** Tile selected to be the first in the game line */
  firstTile!: Tile;

  /** Number of current game move */
  currentMove!: number;

  currentPlayer: Player | null = null;

  /** Set to null if the game is not finished or stores the winner(s) */
  private winners: Player[] | null = null;

  /**
   * Initiates a new dominoes game.
   * @param delegate an instance of a class that is going to
   * receive messages from the game model. Class should
   * implement the DominoDelegate protocol
   */
  constructor(delegate: DominoDelegate) {
    this.delegate = delegate;
  }

  /**
   * Creates 'numberOfPlayers' Player objects and adds to the game
   */
  addPlayers(): void {
    this.players = [];
    for (let i = 0; i < this.numberOfPlayers; i += 1) {
      const player = new Player(`Player ${i + 1}`);
      this.drawTilesTo(player);
      this.addPlayer(player);
    }
  }

  /**
   * Starts the game from the beginning
   */
  restart(): void {
    // reset game data
    this.addPlayers();
    this.currentMove = 1;
    this.winners = null;
    this.resetStock();
    this.playLine = [];
    this.currentPlayer = null;

    // check if the number of tiles agree with the number of players
    if (this.players.length * this.tilesPerPlayer >= this.stock.length) {
      throw new RangeError(
        'The desired number of tiles is greater than the stock',
      );
    }

    // pick a random tile to start a line of game
    this.firstTile = this.stock.shift()!;
    this.playLine.push(this.firstTile);
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
      const isLastPlayer: boolean = (playerIndex === (this.players.length - 1));
      this.currentPlayer = this.players[playerIndex];
      const matching = this.currentPlayer.find([this.first, this.last]);
      if (matching) {
        this.currentPlayer.missedLastMove = false;
        this.insertTile(matching);
        this.delegate.onSuccess(
          matching.tileFromPlayer,
          matching.tileFromLine,
          isLastPlayer,
        );
      } else if (this.stock.length > 0) {
        const newTile: Tile = this.stock.shift()!;
        this.currentPlayer.add(newTile);
        this.delegate.onRepeat(newTile, isLastPlayer);
        playerIndex -= 1;
      } else {
        this.currentPlayer.missedLastMove = true;
        this.delegate.onMiss(isLastPlayer);
      }
      if (this.findWinners()) {
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
    // I can not put '!this.makeMove(0)' inside while condition because
    // I want the model to send a message about next move before checking
    // if it's time to stop the game.
    // eslint-disable-next-line no-constant-condition
    while (true) {
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
   * Game stops if player's stock is empty or no one can make a move
   * @returns the winner(s) or null if game is about to continue
   */
  findWinners(): Player[] | null {
    // returnes winners if they were already found
    if (this.winners) {
      return this.winners;
    }
    // return player who has no more tiles
    const playedAllTiles = this.players.find(
      (player) => player.stockLength === 0,
    );
    if (playedAllTiles) {
      this.winners = [playedAllTiles];
      this.delegate.onWin();
      return this.winners;
    }
    if (this.players.every((player) => player.missedLastMove)) {
      // if all players missed the previous move return players with the least stock lengths
      this.winners = [...this.players].sort((a, b) => a.stockLength - b.stockLength);
      this.winners = this.winners.filter((p) => p.stockLength === this.winners![0].stockLength);
      this.delegate.onWin();
      return this.winners;
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
    player.add(...this.stock.splice(0, this.tilesPerPlayer));
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
    if (this.currentMove === 1) {
      this.delegate.onStart();
    }
  }

  /** Sends a message to the delegate object that next move is about to start */
  protected sendNextMoveMessage(): void {
    this.delegate.onNextMove();
    this.currentMove += 1;
  }

  /**
   * Returnes string representation of current playline
   */
  toString() {
    return this.playLine.reduce((string, tile) => `${string}${tile} `, '');
  }
}

export default DominoGame;
