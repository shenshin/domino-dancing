import Utility from './domino-utility.js';
/**
 * Collection of static methods drawing tiles HTML representations
 */
export class DominoIcon {
  /**
   * Returnes HTML entity representing a tile with corresponding ID
   * @param id tile id (i.e. '06' or '15')
   */
  static from(id: string, horizontal: boolean = true): string {
    return `&#${(horizontal ? 127025 : 127075) + parseInt(id, 7)};`;
  }

  /**
   * Removes HTML representation of a tile from it's parent HTML element
   */
  static remove({ stock, id }: { stock: HTMLElement; id: string }): void {
    const tileIcon = Utility.getElement(id);
    try {
      stock.removeChild(tileIcon);
    } catch (error) {
      throw new Error(`Can not remove tile icon. ${error}`);
    }
  }

  /**
   * Creates HTML element repesenting tile with ID='id' and appends it
   * to HTML element 'stock'
   */
  static create(placeHolder: HTMLElement, id: string, style: 'horizontal' | 'vertical' | 'mixed'): HTMLElement {
    const span: HTMLElement = document.createElement('span');
    span.classList.add('tile');
    switch (style) {
      case 'horizontal':
        span.innerHTML = DominoIcon.from(id, true);
        break;
      case 'vertical':
        span.innerHTML = DominoIcon.from(id, false);
        break;
      case 'mixed':
        span.innerHTML = id[0] === id[1] ? DominoIcon.from(id, false) : DominoIcon.from(id, true);
        break;
      default:
    }
    span.id = id;
    placeHolder.appendChild(span);
    return span;
  }
}

export default DominoIcon;
