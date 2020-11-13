export class Utility {
    static combinationsWithRepetition(elements, taking) {
        if (taking <= 0 || elements.length <= 0) {
            return [];
        }
        if (taking === 1) {
            return elements.map((e) => [e]);
        }
        let combinations = [];
        let reducedElements = elements;
        elements.forEach((element) => {
            combinations = combinations.concat(Utility.combinationsWithRepetition(reducedElements, taking - 1).map((e) => [element].concat(e)));
            reducedElements = reducedElements.slice(1);
        });
        return combinations;
    }
    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    static getElement(name) {
        const element = document.getElementById(name);
        if (element === null) {
            throw new Error('Can not find HTML element with selected name');
        }
        return element;
    }
}
export default Utility;
//# sourceMappingURL=domino-utility.js.map