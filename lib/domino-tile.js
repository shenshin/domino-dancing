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
    static rotateIfNeeded(matching) {
        if ((!(matching === null || matching === void 0 ? void 0 : matching.goesRight) && (matching === null || matching === void 0 ? void 0 : matching.tileFromLine.first) === (matching === null || matching === void 0 ? void 0 : matching.tileFromPlayer.first))
            || ((matching === null || matching === void 0 ? void 0 : matching.goesRight) && (matching === null || matching === void 0 ? void 0 : matching.tileFromLine.last) === (matching === null || matching === void 0 ? void 0 : matching.tileFromPlayer.last))) {
            matching === null || matching === void 0 ? void 0 : matching.tileFromPlayer.rotate();
        }
    }
}
export default Tile;
//# sourceMappingURL=domino-tile.js.map