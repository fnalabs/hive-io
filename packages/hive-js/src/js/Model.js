import Schema from './Schema';


export const SPEC = Symbol('reference to Schema object that defines the data model');

export default class Model {

    constructor(data = { id: 'id' }, spec = new Schema()) {
        this[SPEC] = spec;

        this.create(data);
    }

    /*
     * create
     */
    create(data) {
        const create = (source, spec = this[SPEC]) => {
            for (let [property, specification] of spec) {
                // if specification is a nested Schema, recursively create them too
                if (specification instanceof Schema) create(source[property], specification);
                else {
                    spec.validate(source[property], specification);

                    // if a default value/function is defined, use it
                    if (specification.value) {
                        source[property] = spec.evalProperty(specification.value);
                    }

                    else if (specification.default && !source[property]) {
                        source[property] = spec.evalProperty(specification.default);
                    }
                }
            }

            return this.assign(source);
        };
        return create(data);
    }

    /*
     * update
     */
    update(data) {
        const update = (object, source, spec = this[SPEC]) => {
            for (let [property, value] of this.iterator(source)) {
                // if property is a nested Model, recursively update them too
                if (spec[property] instanceof Schema) object[property] = update({}, value, spec[property]);
                else {
                    // if specification is defined, validate the value
                    if (spec[property]) spec.validate(value, spec[property]);

                    // if a default value/function is defined, use it
                    if (spec[property].value) {
                        object[property] = spec.evalProperty(spec[property].value);
                    }

                    else object[property] = value;
                }

            }

            return object;
        };
        return update(this, data);
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

}
