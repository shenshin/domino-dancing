/* eslint-disable no-param-reassign */
/**
 * Couple necessary algorithms for Domino game
 */
export class Utility {
  /**
   * Combinatorics: combinations of elements <of any Type> with repetition
   * https://en.wikipedia.org/wiki/Combination
   */
  static combinationsWithRepetition<T>(elements: T[], taking: number): T[][] {
    if (taking <= 0 || elements.length <= 0) {
      return [];
    }
    if (taking === 1) {
      return elements.map((e) => [e]);
    }
    let combinations: T[][] = [];
    let reducedElements: T[] = elements;
    elements.forEach((element) => {
      combinations = combinations.concat(
        Utility.combinationsWithRepetition(
          reducedElements,
          taking - 1,
        ).map((e) => [element].concat(e)),
      );
      reducedElements = reducedElements.slice(1);
    });
    return combinations;
  }

  /**
   * Shuffles an array of any elements type with Fisher-Yates algorithm
   */
  static shuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * i);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  /**
   * Links HTML element on the page
   * @param name HTML tag name
   */
  static getElement(name: string): HTMLElement {
    const element: HTMLElement | null = document.getElementById(name);
    if (element === null) {
      throw new Error('Can not find HTML element with selected name');
    }
    return element;
  }
}

export default Utility;
