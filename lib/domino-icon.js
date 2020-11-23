import Utility from './domino-utility.js';
export class DominoIcon {
    static from(id, horizontal = true) {
        return `&#${(horizontal ? 127025 : 127075) + parseInt(id, 7)};`;
    }
    static remove({ stock, id }) {
        const tileIcon = Utility.getElement(id);
        try {
            stock.removeChild(tileIcon);
        }
        catch (error) {
            throw new Error(`Can not remove tile icon. ${error}`);
        }
    }
    static create(placeHolder, id, style) {
        const span = document.createElement('span');
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
//# sourceMappingURL=domino-icon.js.map