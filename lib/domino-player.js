export class Player {
    constructor(name) {
        this.stock = [];
        this.missedLastMove = false;
        this.name = name;
    }
    find(edgeTiles) {
        const lineEdges = [
            edgeTiles[0].first,
            edgeTiles[edgeTiles.length - 1].last,
        ];
        for (let i = 0; i < lineEdges.length; i += 1) {
            const index = this.stock.findIndex((tile) => tile.ends.some((end) => lineEdges[i] === end));
            if (index > -1) {
                return {
                    tileFromPlayer: this.stock.splice(index, 1)[0],
                    tileFromLine: edgeTiles[i],
                    goesRight: Boolean(i),
                };
            }
        }
        return null;
    }
    check(edgeTiles, selected) {
        const lineEdges = [
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
    getTileByID(id) {
        const numbers = id.split('').map((s) => Number(s));
        const matched = this.stock.find((tile) => (tile.ends[0] === numbers[0] && tile.ends[1] === numbers[1])
            || (tile.ends[0] === numbers[1] && tile.ends[1] === numbers[0]));
        if (matched === undefined) {
            throw new Error('Required tile doesn\'t exist in player\'s stock');
        }
        return matched;
    }
    get stockLength() {
        return this.stock.length;
    }
    add(...tiles) {
        this.stock.push(...tiles);
    }
    toString() {
        const player = `Player ${this.name} `;
        return this.stock.length > 0
            ? this.stock.reduce((prev, curr) => `${prev}${curr} `, `${player}now has: `)
            : `${player}has no more tiles.`;
    }
}
Player.names = [
    'Luna',
    'Wouter',
    'Rob',
    'Alex',
    'Beatrix',
    'Maxima',
    'Edwin',
    'Leo',
    'Merel',
    'Peter',
    'Nel',
    'Sara',
    'Hans',
    'Frits',
    'Mark',
    'Dasey',
    'Anna',
    'Martin',
    'Elisabeth',
    'Victoria',
    'Willem',
    'Wilgert',
    'Tjebbe',
    'Andrew',
    'Elton',
    'David',
    'Maria',
    'Alan',
];
export default Player;
//# sourceMappingURL=domino-player.js.map