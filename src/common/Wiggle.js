import BaseTypes from 'lance/serialize/BaseTypes';
import DynamicObject from 'lance/serialize/DynamicObject';

export default class Wiggle extends DynamicObject {

    // the direction contains only 4 possible strings:
    //     up, down, left, right
    // this is not efficient, but simplifies learning
    // the array of bodyParts provides the direction of
    // the next part in the body.
    static get netScheme() {
        return Object.assign({
            direction: { type: BaseTypes.TYPES.STRING },
            bodyParts: {
                type: BaseTypes.TYPES.LIST,
                itemType: BaseTypes.TYPES.STRING
            }
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.class = Wiggle;
    };
}
