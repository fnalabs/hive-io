import Schema from './Schema';


export const SPEC = Symbol('reference to Schema object that defines the data model');

export default class Model {

    constructor(data = { id: 'id' }, spec = new Schema()) {
        this[SPEC] = spec;

        this.update(data);
    }

    /*
     * update
     */
    update(data) {
        this.initialize(data, this[SPEC]);

        return this.assign(data);
    }

    /*
     * iterator(s)
     */
    *[Symbol.iterator]() {
        const keys = Object.keys(this);

        for (const key of keys) {
            yield [key, this[key]];
        }
    }

    *iterator(obj) {
        const keys = Object.keys(obj);

        for (const key of keys) {
            yield [key, obj[key]];
        }
    }

    /*
     * utility method(s)
     */
    assign(data) {
        const assign = (object, source) => {
            // iterate over object/array passed as source data
            for (let [key, value] of this.iterator(source)) {
                if (value && typeof value === 'object') {
                    if (Array.isArray(value)) object[key] = assign([], value);
                    else object[key] = assign({}, value);
                }
                else object[key] = value;
            }
            return object;
        };
        return assign(this, data);
    }

    initialize(data, spec) {
        for (let [property, specification] of spec) {
            // if specification is a nested Schema
            if (specification instanceof Schema) this.initialize(data[property], specification);
            // else if specification is an array of objects
            else if (Array.isArray(specification) && typeof specification[0] !== 'function') {
                this.initialize(data[property], specification[0]);
            }
            else {
                spec.validate(data[property], specification);

                // if a default value/function is defined, use it
                if (specification.value) {
                    data[property] = spec.evalProperty(specification.value);
                }

                else if (specification.default && !data[property]) {
                    data[property] = spec.evalProperty(specification.default);
                }
            }
        }
    }
}
