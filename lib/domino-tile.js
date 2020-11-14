export class Tile {
    constructor(ends) {
        this.upSideUp = true;
        this.numbers = ends;
    }
    get ends() {
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
    rotate() {
        this.upSideUp = !this.upSideUp;
    }
    get id() {
        return `${this.first}${this.last}`;
    }
    toString() {
        return `<${this.first}:${this.last}>`;
    }
}
export default Tile;
//# sourceMappingURL=domino-tile.js.map