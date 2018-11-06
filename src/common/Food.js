import DynamicObject from 'lance/serialize/DynamicObject';

export default class Food extends DynamicObject {

    static get netScheme() {
        return Object.assign({
            // add serializable properties here
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.class = Food;
    };
}
