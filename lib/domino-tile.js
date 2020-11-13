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
    static rotateIfNeeded(tile) {
        if ((!(tile === null || tile === void 0 ? void 0 : tile.goesRight) && (tile === null || tile === void 0 ? void 0 : tile.tileFromLine.first) === (tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.first))
            || ((tile === null || tile === void 0 ? void 0 : tile.goesRight) && (tile === null || tile === void 0 ? void 0 : tile.tileFromLine.last) === (tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.last))) {
            tile === null || tile === void 0 ? void 0 : tile.tileFromPlayer.rotate();
        }
    }
}
export default Tile;
//# sourceMappingURL=domino-tile.js.map